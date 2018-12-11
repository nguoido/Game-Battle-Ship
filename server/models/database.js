var config = require("config");

var mysql = require("mysql");

var connection = mysql.createConnection({
	host: config.get("mysql.host"),
	user: config.get("mysql.user"),
	password: config.get("mysql.password"),
	database: config.get("mysql.database"),
	port: config.get("mysql.port")
});


 //kết nối.
 /*
connection.connect(function (err){
    //nếu có nỗi thì in ra
    if (err) throw err.stack;
    //nếu thành công tạo bảng
    var sql = "CREATE TABLE users (id INT NOT NULL primary key auto_increment, email VARCHAR(55) NOT NULL, password VARCHAR(225) NOT NULL)";
    connection.query(sql, function (err) {
        if (err) throw err;
        console.log('Tao thanh cong bang');
    });
	// thêm dữ liệu vào bảng
	// var sql = "INSERT INTO users(email,password) values ('a', 'a'),('b','b')";
    // connection.query(sql, function (err) {
        // if (err) throw err;
        // console.log('Them du lieu thanh cong');
    // }); 
	
});   
*/
 
	
function getConnection() {
	if (!connection) {
		connection.connect()
	}
	return connection;
}

module.exports = {
	getConnection: getConnection
}
