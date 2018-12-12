# Client
## ESP8266

### Các loại Module ESP8266


| Phiên bản| Số chân   | pitch  | form factor | LEDs |Antenna|Ant.Socket| Shielded |dài mm | 
|------------|--------|--------|-------------|------|---------------|------------|----------|---------------| 
| ESP-01     | 8      | .1“    | 2×4 DIL     | Yes  | Etched-on PCB | No         | No       | 14.3 x 24.8   | 
| ESP-02     | 8      | .1”    | 2×4 notch   | No?  | None          | Yes        | No       | 14.2 x 14.2   | 
| ESP-03     | 14     | 2mm    | 2×7 notch   | No   | Ceramic       | No         | No       | 17.3 x 12.1   | 
| ESP-04     | 14     | 2mm    | 2×4 notch   | No?  | None          | No         | No       | 14.7 x 12.1   | 
| ESP-05     | 5      | .1“    | 1×5 SIL     | No   | None          | Yes        | No       | 14.2 x 14.2   | 
| ESP-06     | 12+GND | misc   | 4×3 dice    | No   | None          | No         | Yes      | 16.3 x 13.1   | 
| ESP-07     | 16     | 2mm    | 2×8 pinhole | Yes  | Ceramic       | Yes        | Yes      | 20.0 x 16.0   | 
| ESP-08     | 14     | 2mm    | 2×7 notch   | No   | None          | No         | Yes      | 17.0 x 16.0   | 
| ESP-08 New | 16     | 2mm    | 2×8 notch   | No   | None          | No         | Yes      | 18.0 x 16.0   | 
| ESP-09     | 12+GND | misc   | 4×3 dice    | No   | None          | No         | No       | 10.0 x 10.0   | 
| ESP-10     | 5      | 2mmm?  | 1×5 notch   | No   | None          | No         | No       | 14.2 x 10.0   | 
| ESP-11     | 8      | 1.27mm | 1×8 pinhole | No?  | Ceramic       | No         | No       | 17.3 x 12.1   | 
| ESP-12     | 16     | 2mm    | 2×8 notch   | Yes  | Etched-on PCB | No         | Yes      | 24.0 x 16.0   | 
| ESP-12-E   | 22     | 2mm    | 2×8 notch   | Yes  | Etched-on PCB | No         | Yes      | 24.0 x 16.0   | 
| ESP-13     | 18     | 1.5mm  | 2×9         | ?    | Etched-on PCB | No         | Yes      | ? x ?         | 
| ESP-14     | 22     | 2mm    | 2×8 + 6     | 1    | Etched-on PCB | No         | Yes      | 24.3 x 16.2   | 
| WROOM-02   | 18     | 1.5mm  | 2×9         | No   | Etched on PCB | No         | Yes      | 20.0 x 18.0   | 
| WT8266-S1  | 18     | 1.5mm  | 3×6         | 1    | Etched on PCB | No         | Yes      | 15.0 x 18.6   | 

### Thông tin phần cứng
![Screenshot](esp8266.jpg)


* Mạch nhỏ, gọn (24.75mm x 14.5mm)
* Điện áp làm việc 3.3v
* Tích hợp sẳn anten PCB trace trên module 
* Có hai led báo hiệu : led nguồn, led TXD
* Có các chế độ: AP, STA, AT + STA
* Hổ trợ TCP/UDP
* Bộ nhớ Flash: 4MB
* Tiêu chuẩn wifi : 802.11b/g/n, với tần số 2.4GHz,và hổ trợ bảo mật WPA/WPA2
* Lệnh AT rất đơn giản, dễ dàng sử dụng
* Có các chế độ: AP, STA, AT + STA
* Lập trình trên các ngôn ngữ: C/C++, Micropython, NodeMCU - Lua


### Tập lệnh AT Command
