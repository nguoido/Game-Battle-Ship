var q = require("q");
var db = require("./database");

// Ket noi vao database
var conn = db.getConnection();

function addUser(user) {
	if (user) {
		var defer = q.defer();

		var query = conn.query('INSERT INTO users SET ?', user, function (err, results, fields) {
				if (err) {
					defer.reject(err);
				} else {
					defer.resolve(results);
				}
			});

		//console.log(query.sql);
		return defer.promise;
	}
	return false;
}

function addUser_check(user) {
	if (user) {
		var defer = q.defer();
		var username = user.username;
		//console.log(username);
		var query = conn.query('SELECT * FROM users WHERE username = ?', [username], function (err, results, fields) {
				//console.log("-----------------");
				//console.log(results);
				if (results.length) {
					//console.log("-----------------");
					//console.log(results.length); --> số lượng
					defer.reject(err);
				} else {
					var query = conn.query('INSERT INTO users SET ?', user, function (err, results, fields) {
							if (err) {
								defer.reject(err);
							} else {
								defer.resolve(results);
							}
						});
				}
			});
		//console.log(query.sql);
		return defer.promise;
	}
	return false;
}
// Get username
function getUserByUsername(username) {
	//Nếu có username
	if (username) {
		var defer = q.defer();

		var query = conn.query('SELECT * FROM users WHERE ?', {
				username: username
			}, function (err, results, fields) {
				// Neu loi
				if (err) {
					defer.reject(err);
				} else {
					// Ko loi
					defer.resolve(results);
				}
			});
		return defer.promise;
	}
	return false;
}


module.exports = {
	addUser: addUser,
	getUserByUsername: getUserByUsername,
	addUser_check: addUser_check
}
