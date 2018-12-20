/***********************************************************
	LED1 -- 26 -- PA.14 -- D3
	LED2 -- 25 -- PA.15 -- D4
	BTN_OK -- 28 -- PA.12
	BTN_CANCEL -- 27 -- PA.13
	BTN_LEFT -- 21 -- PC.3
	BTN_RIGHT -- 22 -- PC.2
	BTN_UP -- 20 -- PD.7
	BTN_DOWN -- 23 -- PC.1
	BTN_1 -- RESET NUC
	VIBRATE --- 	PC.0
************************************************************/

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "NUC1xx.h"
#include "Driver\DrvUART.h"
#include "Driver\DrvGPIO.h"
#include "Driver\DrvSYS.h"

#define AT_CIPAPMAC "AT+CIPAPMAC?\r\n"
#define AT_CWMODE "AT+CWMODE=1\r\n"
#define AT_CIPMUX "AT+CIPMUX=0\r\n"
#define AT_CWJAP "AT+CWJAP=\"MYH 1\",\"12022017\"\r\n"
//#define AT_CWJAP "AT+CWJAP=\"thuy\",\"hhhhhhhh\"\r\n"
#define AT_CIPSTART "AT+CIPSTART=\"TCP\",\"13.250.115.86\",3333\r\n"
#define AT_CIPSEND_PLAY "AT+CIPSEND=1\r\n"
#define AT_CIPSEND_MAC "AT+CIPSEND=17\r\n"
#define AT_TEST_MAC "a2:20:a6:13:1f:48"

#define  ONESHOT  0   // counting and interrupt when reach TCMPR number, then stop

uint8_t buf_Mac[18];
volatile uint16_t i = 0, checkOK = 0;
volatile uint8_t flag = 0;
uint32_t Timer_High;
uint32_t Timer_Low ;

void uartConfig(void);
void interruptConfig(void);
void GPIOAB_INT_CallBack(uint32_t GPA_IntStatus, uint32_t GPB_IntStatus);
void GPIOCDE_INT_CallBack(uint32_t GPC_IntStatus, uint32_t GPD_IntStatus, uint32_t GPE_IntStatus);
void delay_time(int time);		     
void UART_INT_HANDLE(void);
void CleanString(uint8_t *str);
void InitTIMER0(void);
void vibration(uint32_t high, uint32_t low);
volatile uint8_t Timers_Vibration = 0;
volatile uint8_t Timer_Cnt = 1;

int main()
{
	DrvGPIO_Open(E_GPC, 0, E_IO_OUTPUT); 
	interruptConfig();
	uartConfig();
	do{
		checkOK = 0;
		CleanString(buf_Mac); 
		DrvUART_EnableInt(UART_PORT0, DRVUART_RDAINT, (PFN_DRVUART_CALLBACK *)UART_INT_HANDLE);
		DrvUART_Write(UART_PORT0, (uint8_t *)AT_CIPAPMAC, strlen(AT_CIPAPMAC));
		delay_time(30);		
	}while(checkOK != 5);

	
	DrvUART_DisableInt(UART_PORT0, DRVUART_RDAINT); 
	
	DrvUART_Write(UART_PORT0, (uint8_t *)AT_CWMODE, strlen(AT_CWMODE));
	DrvSYS_Delay(1000);
	DrvUART_Write(UART_PORT0, (uint8_t *)AT_CIPMUX, strlen(AT_CIPMUX));
	DrvSYS_Delay(10000);
	DrvUART_Write(UART_PORT0, (uint8_t *)AT_CWJAP, strlen(AT_CWJAP));
	delay_time(20);
	DrvUART_Write(UART_PORT0, (uint8_t *)AT_CIPSTART, strlen(AT_CIPSTART));
	delay_time(20);
	
	DrvGPIO_SetBit(E_GPC,14);
	DrvUART_Write(UART_PORT0, (uint8_t *)AT_CIPSEND_MAC, strlen(AT_CIPSEND_MAC));
	DrvSYS_Delay(1000);
	for(int j = 0; j<17; j++)
	{
		DrvUART_Write(UART_PORT0, &buf_Mac[j], 1);
		DrvSYS_Delay(80);
	}
	DrvUART_EnableInt(UART_PORT0, DRVUART_RDAINT, (PFN_DRVUART_CALLBACK *)UART_INT_HANDLE);

	delay_time(20);
	while(1)
	{
	}
}


void TMR0_IRQHandler(void) // Timer0 interrupt subroutine 
{	
	if(Timer_Cnt <= 6)
	{
		if ((Timer_Cnt %2) == 0) 
		{
			DrvGPIO_SetBit(E_GPA,14);
			DrvGPIO_ClrBit(E_GPC,0);
			TIMER0->TCMPR = Timer_High;	
			TIMER0->TISR.TIF = 1;			
			TIMER0->TCSR.MODE = ONESHOT;
			TIMER0->TCSR.CEN = 1;
			Timer_Cnt++;
		}
		else
		{
			DrvGPIO_SetBit(E_GPC,0);
			DrvGPIO_ClrBit(E_GPA,14);
			TIMER0->TCMPR = Timer_Low;
			TIMER0->TISR.TIF = 1;
			TIMER0->TCSR.MODE = ONESHOT; 
			TIMER0->TCSR.CEN = 1;			
			Timer_Cnt++;
		}
	
	}

	else
		{
			NVIC_DisableIRQ(TMR0_IRQn);	//Enable Timer0 Interrupt
			Timer_Cnt = 0 ;
		}
}


void vibration(uint32_t high, uint32_t low)
{
	// Rung
	Timer_High = high;
	Timer_Low = low;
	NVIC_EnableIRQ(TMR0_IRQn);	//Enable Timer0 Interrupt
	TIMER0->TCSR.CEN = 1;		//Enable Timer0
}

void InitTIMER0(void)
{
	/* Step 1. Enable and Select Timer clock source */          
	SYSCLK->CLKSEL1.TMR0_S = 0x07;	//Select 22.1184 MHz for Timer0 clock source
	SYSCLK->APBCLK.TMR0_EN = 1;	//Enable Timer0 clock source
	
	/* Step 2. Select Operation mode */	
	TIMER0->TCSR.MODE = ONESHOT;  //Select operation mode
	
	/* Step 3. Select Time out period = (Period of timer clock input) * (8-bit Prescale + 1) * (24-bit TCMP)*/
	TIMER0->TCSR.PRESCALE = 239;	// Set Prescale [0~255]
	TIMER0->TCMPR = 9216;		    // Set TCMPR [0~16777215]
	//Timeout period = (1 / 22.1184MHz * 10^6) * ( 239 + 1 ) * 9210 = 0.1 sec
	
	/* Step 4. Enable interrupt */
	TIMER0->TCSR.IE = 1;
	TIMER0->TISR.TIF = 1;		//Write 1 to clear for safty		
	NVIC_EnableIRQ(TMR0_IRQn);	//Enable Timer0 Interrupt
	
	/* Step 5. Enable Timer module */
	TIMER0->TCSR.CRST = 1;	//Reset up counter
	TIMER0->TCSR.CEN = 1;		//Enable Timer0
}

void UART_INT_HANDLE(void)
{
	uint8_t bInChar[1] = {0xFF};
	while(UART0->ISR.RDA_IF==1) 
	{
		DrvUART_Read(UART_PORT0,bInChar,1);	
		if(bInChar[0] == '^')
		{
			//DrvGPIO_ClrBit(E_GPC,0); 		// GPB11 = 0 to turn on Buzzer
			//delay_time(1);  				 		// Delay 
			//DrvGPIO_SetBit(E_GPC,0); 		// GPB11 = 1 to turn off Buzzer	
			vibration(46080,46080);	// 1.2s rung, 0.8s tat
		}
		else if(bInChar[0] == '!')
		{
			//DrvGPIO_ClrBit(E_GPC,0); 		// GPB11 = 0 to turn on Buzzer
			//DrvSYS_Delay(300000);  				 		// Delay 
			//DrvGPIO_SetBit(E_GPC,0); 		// GPB11 = 1 to turn off Buzzer	
			//vibration(51840, 34560); //0.6s 0.4s
			vibration(73728,18432);		// 0.6s rung, 0.4s tat
		}
		else if(bInChar[0] == '"')
		{
			flag ++;
		}
		else if(flag == 1)
		{
			buf_Mac[i] = bInChar[0];
			if (buf_Mac[i] == ':')
			{
				checkOK ++;
			}
			i++;
		}
	}
}



void CleanString(uint8_t *str)
{
    int i = 0;
    while (str[i] != '\0')
    {
        str[i] = '\0';
        i++;
	}
}



void delay_time(int time)		     
{
	int i=0;
	for(i=0;i<time*3;i++)
	{
		DrvSYS_Delay(300000);
	}
}


void uartConfig(void){
	STR_UART_T myuart;
	DrvGPIO_InitFunction(E_FUNC_UART0);   
	
	/* UART Setting */
	myuart.u32BaudRate         = 115200;
	myuart.u8cDataBits         = DRVUART_DATABITS_8;
	myuart.u8cStopBits         = DRVUART_STOPBITS_1;
	myuart.u8cParity        	 = DRVUART_PARITY_NONE;
	myuart.u8cRxTriggerLevel 	 = DRVUART_FIFO_1BYTES;
	
	/* Set UART Configuration */
	if(DrvUART_Open(UART_PORT0,&myuart) != E_SUCCESS) 
	DrvGPIO_SetBit(E_GPC,14);
}

void interruptConfig(){	
	DrvGPIO_Open(E_GPA,12,E_IO_INPUT);
	DrvGPIO_Open(E_GPA,13,E_IO_INPUT);
	DrvGPIO_EnableInt(E_GPA, 12, E_IO_RISING, E_MODE_EDGE);		//BTN OK
	
	DrvGPIO_EnableInt(E_GPC, 1, E_IO_RISING, E_MODE_EDGE);		//BTN DOWN
	DrvGPIO_EnableInt(E_GPC, 2, E_IO_RISING, E_MODE_EDGE);		//BTN RIGHT
	DrvGPIO_EnableInt(E_GPC, 3, E_IO_RISING, E_MODE_EDGE);		//BTN LEFT
	DrvGPIO_EnableInt(E_GPD, 7, E_IO_RISING, E_MODE_EDGE);		//BTN UP
	DrvGPIO_SetDebounceTime(5, E_DBCLKSRC_10K);
	DrvGPIO_EnableDebounce(E_GPA, 12);
	
	DrvGPIO_EnableDebounce(E_GPC, 1);
	DrvGPIO_EnableDebounce(E_GPC, 2);
	DrvGPIO_EnableDebounce(E_GPC, 3);
	DrvGPIO_EnableDebounce(E_GPD, 7);
	DrvGPIO_SetIntCallback(GPIOAB_INT_CallBack, GPIOCDE_INT_CallBack);
}
void GPIOCDE_INT_CallBack(uint32_t GPC_IntStatus, uint32_t GPD_IntStatus, uint32_t GPE_IntStatus)
{  
	if ((GPC_IntStatus>>1) & 0x01){
		DrvUART_Write(UART_PORT0,(uint8_t *)AT_CIPSEND_PLAY, 16);
		DrvSYS_Delay(1000);
		DrvUART_Write(UART_PORT0,(uint8_t *)"d", 1);
		DrvSYS_Delay(20);
	}
	if ((GPC_IntStatus>>2) & 0x01){
		// Cach 1
		/*
			uart_sendStr((unsigned char*)"AT+CIPSEND\r\n");
			DrvSYS_Delay(20000);
			uart_sendStr((unsigned char*)"r");
			DrvSYS_Delay(20000);
			uart_sendStr((unsigned char*)"+++");
			DrvSYS_Delay(20000);
		*/
		
		// Cach 2
		/*
			uart_sendStr((unsigned char*)"AT+CIPSEND=1\r\n");
			DrvSYS_Delay(2);
			uart_sendStr((unsigned char*)"r");
		*/
		
		DrvUART_Write(UART_PORT0,(uint8_t *)AT_CIPSEND_PLAY, 16);
		DrvSYS_Delay(1000);
		DrvUART_Write(UART_PORT0,(uint8_t *)"r", 1);
		DrvSYS_Delay(20);
	}
	if ((GPC_IntStatus>>3) & 0x01){
		DrvUART_Write(UART_PORT0,(uint8_t *)AT_CIPSEND_PLAY, 16);
		DrvSYS_Delay(1000);
		DrvUART_Write(UART_PORT0,(uint8_t *)"l", 1);
		DrvSYS_Delay(20);
		
	}
	if ((GPD_IntStatus>>7) & 0x01){
		DrvUART_Write(UART_PORT0,(uint8_t *)AT_CIPSEND_PLAY, 16);
		DrvSYS_Delay(1000);
		DrvUART_Write(UART_PORT0,(uint8_t *)"u", 1);
		DrvSYS_Delay(20);
	}
}

void GPIOAB_INT_CallBack(uint32_t GPA_IntStatus, uint32_t GPB_IntStatus)
{
	if ((GPA_IntStatus>>12) & 0x01){
		DrvUART_Write(UART_PORT0,(uint8_t *)AT_CIPSEND_PLAY, 16);
		DrvSYS_Delay(1000);
		DrvUART_Write(UART_PORT0,(uint8_t *)"s", 1);
		DrvSYS_Delay(20);
	}
}