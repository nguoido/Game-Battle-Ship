var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "nodejs_game"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "CREATE TABLE users (id INT primary key auto_increment,username VARCHAR(255),password  VARCHAR(255))";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("table created");
  });
});
