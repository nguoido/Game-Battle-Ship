# MySQL

## Cài đặt
### Trên Ubuntu

sudo apt-get update

sudo apt-get install mysql-server

### Trên Windows

XAMPP là một bản phân phối Apache dễ cài đặt có chứa MariaDB, PHP và Perl. Chỉ cần tải về và bắt đầu cài đặt. Nó rất dễ dàng.

https://www.apachefriends.org/download.html

## Một số lệnh commands sử dụng MySQL

Quyền truy cập MySQL: `mysql -u [username] -p;` (will prompt for password)

Hiện thị các database: `show databases;`

Truy cập database: `mysql -u [username] -p [database]`

Tạo database: `create database [database];`

Lựa chọn database: `use [database];`

Xác định cơ sở dữ liệu nào đang được sử dụng: `select database();`

Hiển thị tất cả các bảng: `show tables;`

Hiển thị cấu trúc bảng: `describe [table];`

Liệt kê tất cả các chỉ mục trên một bảng: `show index from [table];`

Tạo bảng mới với các cột: `CREATE TABLE [table] ([column] VARCHAR(120), [another-column] DATETIME);`

Thêm một cột: `ALTER TABLE [table] ADD COLUMN [column] VARCHAR(120);`

Thêm một cột với một duy nhất, tự động tăng ID: `ALTER TABLE [table] ADD COLUMN [column] int NOT NULL AUTO_INCREMENT PRIMARY KEY;`

Chèn một bản ghi: `INSERT INTO [table] ([column], [column]) VALUES ('[value]', [value]');`


Chọn bản ghi: `SELECT * FROM [table];`

Lựa chọn các phần của bản ghi: `SELECT [column], [another-column] FROM [table];`

Đếm số bảng ghi: `SELECT COUNT([column]) FROM [table];`

Đếm và chọn bản ghi được nhóm: `SELECT *, (SELECT COUNT([column]) FROM [table]) AS count FROM [table] GROUP BY [column];`

Chọn bản ghi cụ thể: `SELECT * FROM [table] WHERE [column] = [value];` (Selectors: `<`, `>`, `!=`; combine multiple selectors with `AND`, `OR`)

Select records containing `[value]`: `SELECT * FROM [table] WHERE [column] LIKE '%[value]%';`

Select records starting with `[value]`: `SELECT * FROM [table] WHERE [column] LIKE '[value]%';`

Select records starting with `val` and ending with `ue`: `SELECT * FROM [table] WHERE [column] LIKE '[val_ue]';`

Select a range: `SELECT * FROM [table] WHERE [column] BETWEEN [value1] and [value2];`

Select with custom order and only limit: `SELECT * FROM [table] WHERE [column] ORDER BY [column] ASC LIMIT [value];` (Order: `DESC`, `ASC`)

Updating records: `UPDATE [table] SET [column] = '[updated-value]' WHERE [column] = [value];`

Deleting records: `DELETE FROM [table] WHERE [column] = [value];`

Delete all records from a table (without dropping the table itself): `DELETE FROM [table];`
(This also resets the incrementing counter for auto generated columns like an id column.)

Xóa tất cả các bản ghi trong một bảng: `truncate table [table];`

Xóa cột bảng: `ALTER TABLE [table] DROP COLUMN [column];`

Xóa bảng: `DROP TABLE [table];`

Xóa databases: `DROP DATABASE [database];`

Logout: `exit;`
