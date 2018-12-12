var mysql = require('mysql');


// Tao database voi ten nodejs_game
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: ""
});

con.connect(function(err) {
    if (err)
        throw err;
    console.log("Connected!");
    con.query("CREATE DATABASE nodejs_game", function(err, result) {
        if (err)
            throw err;
        console.log("Database created");
    });
});


// kết nối database
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodejs_game',
});

conn.connect(function(err) {
    //nếu có nỗi thì in ra
    if (err) throw err.stack;
    //nếu thành công tạo bảng
    var sql = "CREATE TABLE users (id INT NOT NULL primary key auto_increment,username VARCHAR(255) not null, password VARCHAR(255) not null)";
    conn.query(sql, function(err) {
        if (err) throw err;
        console.log('Tao thanh cong bang');
    });
    // thêm dữ liệu vào bảng
    var sql = "INSERT INTO users(username,password) values ('a', 'a'),('b','b')";
    conn.query(sql, function(err) {
        if (err) throw err;
        console.log('Them du lieu thanh cong');
    });

    // in ra dữ liệu từ bảng
    var sql = "SELECT * FROM users";
    conn.query(sql, function(err, results, fields) {
        if (err) throw err;
        console.log('Dữ liệu trong bảng hiên có');
        console.log(results);
        console.log('Lấy thông tin các trường dữ liệu');
        console.log(fields);
        console.log("OK")
    });
});