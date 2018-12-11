# Cách kết nối vào máy amazonaws bằng PuTTY

https://docs.aws.amazon.com/en_us/AWSEC2/latest/UserGuide/AccessingInstances.html

# Kiểm tra cổng TCP, mô phỏng chức năng của ping
## Ping là gì?

PING ở đây là Packet Internet Grouper, tiện ích được sử dụng để xác định xem một gói dữ liệu mạng có thể được phân phối đến một địa chỉ mà không có lỗi hay không. Ping là lệnh cực kỳ phổ biến dùng để đo độ trễ giữa hai thiết bị trên mạng và nhiều trò chơi trực tuyến hiển thị ping cho game thủ biết được độ trễ của mạng hiện tại. Lệnh ping cũng thường được sử dụng để kiểm tra lỗi mạng, kiểm tra 2 thiết bị trong mạng nào đó có kết nối, hay đơn giản là có thông với nhau hay không.

## Công cụ
https://code.google.com/archive/p/paping/

```paping v1.5.5 - Copyright (c) 2011 Mike Lovell

Syntax: paping [options] destination

Options:
 -?, --help     display usage
 -p, --port N   set TCP port N (required)
     --nocolor  Disable color output
 -t, --timeout  timeout in milliseconds (default 1000)
 -c, --count N  set number of checks to N
 ```
**US East (N. Virginia)**

![Screenshot](ping_East.JPG)
