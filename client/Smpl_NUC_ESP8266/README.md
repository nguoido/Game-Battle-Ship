# Code tay cầm

## GPIO được dùng
![Screenshot](nuc140.jpg)

| Chức năng| 		GPIO   | 
|------------|--------|
| LED1     | PA.14     |  
|BTN_OK      | PA.12     |  
|BTN_CANCEL      |PA.13      | 
| BTN_LEFT     | PC.3 |
|BTN_RIGHT    | PC.2     | 
| BTN_UP     | PD.7     | 
| BTN_DOWN  | PC.1     | 
|BTN_1     |  RESET NUC |
|VIBRATE     |PA.15 |


## Giới thiệu về GPIO

* NUC140 có 5 port với tên là: `GPIOA, GPIOB, GPIOC, GPIOD, GPIOE`
* Mỗi chân GPIO được cấu hình độc lập bằng phân mềm để làm `input, output`, open-drain or quasi-bidirectional mode

## GPIO Driver và thanh ghi


#### DrvGPIO_Open() 
* Prototype: int32_t DrvGPIO_Open(Port,Pin,Mode)
* Input:
	* Port : E_GPA, E_GPB, E_GPC, E_GPD, E_GPE (Port A,B,C,D,E) .
	* Pin : 0 – 15 ;
* Mode:
	* E_IO_QUASI // Chân chức năng vào ra.
	* E_IO_INPUT // Chân có chức năng ngỏ vào.
	* E_IO_OUTPUT // Chân có chức năng ngỏ ra .
* Return:
	* E_SUCCESS // cấu hình thành công.
	* E_DRVGPIO_ARGUMENT // cấu hình không đúng.
* Chức năng : Cấu hình chức năng vào ra của từng chân.
* Yêu cầu: Không.
* Ví dụ:
	* DrvGPIO_Open (E_GPA, 12, E_IO_OUTPUT); //GPIOA->PMD.PMD12 = 0x01;
	* DrvGPIO_Open (E_GPA, 12, E_IO_INPUT); //GPIOA->PMD.PMD12 = 0x00;

	
#### DrvGPIO_SetBit();
* Prototype: int32_t DrvGPIO_SetBit(Port, Pin).
* Input : 
	* Port: E_GPA, E_GPB, E_GPC, E_GPD, E_GPE.
	* Pin : 0 – 15.
* Return : 
	* E_SUCCESS // cấu hình thành công.
	* E_DRVGPIO_ARGUMENT // lập luận không chính xác.
* Chức năng:
	* Đưa chân lên mức cao.
* Yêu cầu: Cấu hình chân là INPUT hoặc QUASI.
* Ví dụ:
	* DrvGPIO_ClrBit(E_GPA,13);
GPIOA->DOUT &= ~(0x1<<13);