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

#define  PWM_CLKSRC_SEL   3        //0: 12M, 1:32K, 2:HCLK, 3:22M
#define  PWM_PreScaler    21      // clock is divided by (PreScaler + 1)
#define  Cycle        219 

uint8_t buf_Mac[18];
volatile uint16_t i = 0, checkOK = 0;
volatile uint8_t flag = 0;

void uartConfig(void);
void interruptConfig(void);
void GPIOAB_INT_CallBack(uint32_t GPA_IntStatus, uint32_t GPB_IntStatus);
void GPIOCDE_INT_CallBack(uint32_t GPC_IntStatus, uint32_t GPD_IntStatus, uint32_t GPE_IntStatus);
void delay_time(int time);		     
void UART_INT_HANDLE(void);
void CleanString(uint8_t *str);
void Vibrate(int time, int percent);
void InitPWM();

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


void InitPWM()
{
	SYS->GPAMFP.PWM3_I2SMCLK=1;  // Enable PWM3 multi-function pin
	SYSCLK->CLKSEL1.PWM23_S = PWM_CLKSRC_SEL; // Select 22Mhz for PWM clock source		
	SYSCLK->APBCLK.PWM23_EN =1;  // Enable PWM2 & PWM3 clock	
	PWMA->PPR.CP23=1;			      // Prescaler 0~255, Setting 0 to stop output clock
	PWMA->CSR.CSR3=0;			      // PWM clock = clock source/(Prescaler + 1)/divider
	PWMA->PCR.CH3MOD=1;			    // 0:One-shot mode, 1:Auto-load mode
															// CNR and CMR will be auto-cleared after setting CH2MOD form 0 to 1.	
	PWMA->CNR3=0xFFFF;           // CNR : counting down   // PWM output high if CMRx+1 >= CNR
	PWMA->CMR3=0xFFFF;		        // CMR : fix to compare  // PWM output low  if CMRx+1 <  CNR
	PWMA->PCR.CH3INV=0;          // Inverter->0:off, 1:on
	PWMA->PCR.CH3EN=1;			      // PWM function->0:Disable, 1:Enable
	PWMA->POE.PWM3=1;			      // Output to pin->0:Diasble, 1:Enable		
}

void Vibrate(int time, int percent)
{
	uint16_t HiTime = percent*Cycle/100;
	if(percent==0){
		HiTime=1;
	}
	PWMA->CSR.CSR3 = 0;             // diver factor = 0: 1/2, 1: 1/4, 2: 1/8, 3: 1/16, 4: 1
	PWMA->PPR.CP23 = PWM_PreScaler; // set PreScaler
	PWMA->CNR3 = Cycle;    					// set CNR
	PWMA->CMR3 = HiTime -1;     		// set CMR
	PWMA->POE.PWM3=1;
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
			Vibrate(1,400);
		}
		else if(bInChar[0] == '!')
		{
			//DrvGPIO_ClrBit(E_GPC,0); 		// GPB11 = 0 to turn on Buzzer
			//DrvSYS_Delay(300000);  				 		// Delay 
			//DrvGPIO_SetBit(E_GPC,0); 		// GPB11 = 1 to turn off Buzzer	
			Vibrate(1,100);
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