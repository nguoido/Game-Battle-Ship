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
#include "NUC1xx.h"
#include "Driver\DrvUART.h"
#include "Driver\DrvGPIO.h"
#include "Driver\DrvSYS.h"

#define AT_CIPAPMAC "AT+CIPAPMAC?\r\n"
#define AT_CWMODE "AT+CWMODE=1\r\n"
#define AT_CIPMUX "AT+CIPMUX=0\r\n"
//#define AT_CWJAP "AT+CWJAP=\"MYH 1\",\"12022017\"\r\n"
#define AT_CWJAP "AT+CWJAP=\"thuy\",\"hhhhhhhh\"\r\n"
#define AT_CIPSTART "AT+CIPSTART=\"TCP\",\"34.205.32.160\",3333\r\n"

volatile uint8_t buf_Mac[17];
volatile uint16_t i = 0;
volatile uint8_t flag = 0;


void initLed(void);
void uartConfig(void);
void uart_sendStr(uint8_t *str);
void interruptConfig(void);
void GPIOAB_INT_CallBack(uint32_t GPA_IntStatus, uint32_t GPB_IntStatus);
void GPIOCDE_INT_CallBack(uint32_t GPC_IntStatus, uint32_t GPD_IntStatus, uint32_t GPE_IntStatus);
void delay_time(int time);		     


void UART_INT_HANDLE(void)
{
	uint8_t bInChar[1] = {0xFF};
	while(UART0->ISR.RDA_IF==1) 
	{
		DrvUART_Read(UART_PORT0,bInChar,1);	
		if(bInChar[0] == '^')
		{
			DrvGPIO_ClrBit(E_GPC,0); // GPB11 = 0 to turn on Buzzer
			delay_time(1);    // Delay 
			DrvGPIO_SetBit(E_GPC,0); // GPB11 = 1 to turn off Buzzer	
		}
		else if(bInChar[0] == '"')
		{
			flag ++;
		}
		else if(flag == 1)
		{
			buf_Mac[i] = bInChar[0];
			i++;
		}
		
	}
}



int main()
{
	initLed();
	interruptConfig();
	uartConfig();
	
	DrvGPIO_Open(E_GPC, 0, E_IO_OUTPUT); // initial controlling 
	
	DrvUART_Write(UART_PORT0, (unsigned char*)AT_CWMODE, strlen(AT_CWMODE));
	delay_time(5);
	DrvUART_Write(UART_PORT0, (unsigned char*)AT_CIPMUX, strlen(AT_CIPMUX));
	delay_time(5);
	DrvUART_Write(UART_PORT0, (unsigned char*)AT_CWJAP, strlen(AT_CWJAP));
	delay_time(30);
	
	
	DrvUART_EnableInt(UART_PORT0, DRVUART_RDAINT, (PFN_DRVUART_CALLBACK *)UART_INT_HANDLE); 
	
	DrvUART_Write(UART_PORT0, (unsigned char*)AT_CIPAPMAC, strlen(AT_CIPAPMAC));
	delay_time(5);
	
	DrvUART_Write(UART_PORT0, (unsigned char*)AT_CIPSTART, strlen(AT_CIPSTART));
	delay_time(30);
	while(1)
	{	
		
	}
	
}

void delay_time(int time)		     
{
	int i=0;
	for(i=0;i<time*3;i++)
	{
		DrvSYS_Delay(330000);
	}
}


void initLed(void){
	DrvGPIO_Open(E_GPA, 15, E_IO_OUTPUT); // GPC12 pin set to output mode
	DrvGPIO_ClrBit(E_GPA, 15);            // Goutput Hi to turn off LED
	DrvGPIO_Open(E_GPA, 14, E_IO_OUTPUT); // GPC12 pin set to output mode
	DrvGPIO_ClrBit(E_GPA, 14);            // Goutput Hi to turn off LED
	
}


void uart_sendStr(uint8_t *str)
{
	while(*str)
	{
		DrvUART_Write(UART_PORT0,str,1);
		DrvSYS_Delay(20000);
		str++;
	}
}


void uartConfig(void){
	STR_UART_T myuart;
	
	DrvGPIO_InitFunction(E_FUNC_UART0);   
	
	/* UART Setting */
	myuart.u32BaudRate         = 115200;
	myuart.u8cDataBits         = DRVUART_DATABITS_8;
	myuart.u8cStopBits         = DRVUART_STOPBITS_1;
	myuart.u8cParity         = DRVUART_PARITY_NONE;
	myuart.u8cRxTriggerLevel = DRVUART_FIFO_1BYTES;
	
	/* Set UART Configuration */
	if(DrvUART_Open(UART_PORT0,&myuart) != E_SUCCESS) 
	DrvGPIO_SetBit(E_GPC,14);
}




void interruptConfig(){	
	DrvGPIO_Open(E_GPA,12,E_IO_INPUT);
	DrvGPIO_Open(E_GPA,13,E_IO_INPUT);
	DrvGPIO_EnableInt(E_GPA, 12, E_IO_RISING, E_MODE_EDGE);		//BTN OK
	DrvGPIO_EnableInt(E_GPA, 13, E_IO_RISING, E_MODE_EDGE);		//BTN CANCLE
	DrvGPIO_EnableInt(E_GPC, 1, E_IO_RISING, E_MODE_EDGE);		//BTN DOWN
	DrvGPIO_EnableInt(E_GPC, 2, E_IO_RISING, E_MODE_EDGE);		//BTN RIGHT
	DrvGPIO_EnableInt(E_GPC, 3, E_IO_RISING, E_MODE_EDGE);		//BTN LEFT
	DrvGPIO_EnableInt(E_GPD, 7, E_IO_RISING, E_MODE_EDGE);		//BTN UP
	DrvGPIO_SetDebounceTime(5, E_DBCLKSRC_10K);
	DrvGPIO_EnableDebounce(E_GPA, 12);
	DrvGPIO_EnableDebounce(E_GPA, 13);
	DrvGPIO_EnableDebounce(E_GPC, 1);
	DrvGPIO_EnableDebounce(E_GPC, 2);
	DrvGPIO_EnableDebounce(E_GPC, 3);
	DrvGPIO_EnableDebounce(E_GPD, 7);
	DrvGPIO_SetIntCallback(GPIOAB_INT_CallBack, GPIOCDE_INT_CallBack);
}

void GPIOCDE_INT_CallBack(uint32_t GPC_IntStatus, uint32_t GPD_IntStatus, uint32_t GPE_IntStatus)
{  
	if ((GPC_IntStatus>>1) & 0x01){
		uart_sendStr((unsigned char*)"AT+CIPSEND=1\r\n");
		DrvSYS_Delay(2);
		uart_sendStr((unsigned char*)"d");
	}
	if ((GPC_IntStatus>>2) & 0x01){
		//uart_sendStr((unsigned char*)"AT+CIPSEND\r\n");
		//DrvSYS_Delay(20000);
		//uart_sendStr((unsigned char*)"r");
		//DrvSYS_Delay(20000);
		//uart_sendStr((unsigned char*)"+++");
		//DrvSYS_Delay(20000);
		uart_sendStr((unsigned char*)"AT+CIPSEND=1\r\n");
		DrvSYS_Delay(2);
		uart_sendStr((unsigned char*)"r");
	}
	if ((GPC_IntStatus>>3) & 0x01){
		uart_sendStr((unsigned char*)"AT+CIPSEND=1\r\n");
		DrvSYS_Delay(2);
		uart_sendStr((unsigned char*)"l");
		
	}
	if ((GPD_IntStatus>>7) & 0x01){
		uart_sendStr((unsigned char*)"AT+CIPSEND=1\r\n");
		DrvSYS_Delay(2);
		uart_sendStr((unsigned char*)"u");
	}
}

void GPIOAB_INT_CallBack(uint32_t GPA_IntStatus, uint32_t GPB_IntStatus)
{
	if ((GPA_IntStatus>>12) & 0x01){
		uart_sendStr((unsigned char*)"AT+CIPSEND=1\r\n");
		DrvSYS_Delay(2);
		uart_sendStr((unsigned char*)"s");
	}
	if ((GPA_IntStatus>>13) & 0x01){
		uart_sendStr((unsigned char*)"AT+CIPSEND=1\r\n");
		DrvSYS_Delay(2);
		uart_sendStr((unsigned char*)"c");
	}
}
