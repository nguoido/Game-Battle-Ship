var express = require("express");
var app = express();
var http = require("http").Server(app);
var config = require("config");
var user_md = require("./models/user");
var helper = require("./models/helper");
var host = config.get("server.host");
var port = config.get("server.port");
var bodyParser = require("body-parser");
// chức năng đăng nhập
var session = require("express-session");
var passport = require('passport');
// nhận dữ liệu từ form
// truelấy dữ liệu từ body parser
app.use(bodyParser.urlencoded({
    extended: true
}));
// lấy dữ liệu trong body của post method
app.use(bodyParser.json());
//File chua .ejs
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

//mang user đang đăng nhập
var check_user = [];
/************************************************
    Xử lý dăng kí đăng nhập
*************************************************/

// cấu hình seddion
app.set('trust proxy', 1)
app.use(session({
    secret: config.get("secret_key"),
    resave: false,
    saveUninitialized: true,
    cookie: {
        //secure: true
        secure: false
    }
}));



app.get("/", function(req, res) {
    if (req.session.user) {
        console.log("id session:" + req.sessionID)
        res.render("playgame", {
            data: req.session.user
        });
    } else {
        res.render("home", {
            data: {}
        });
        console.log("id session:" + req.sessionID)
    }
});





// chuyển đến đăng kí
app.get("/signup", function(req, res) {
    if (req.session.user) {
        console.log("id session:" + req.sessionID)
        res.render("playgame", {
            data: req.session.user
        });
    } else {
        res.render("signup", {
            data: {}
        });
        console.log("id session:" + req.sessionID)

    }
});

// chuyển đến đăng nhập
app.get("/signin", function(req, res) {
    if (req.session.user) {
        console.log("id session:" + req.sessionID)
        res.render("playgame", {
            data: req.session.user
        });
    } else {
        res.render("signin", {
            data: {}

        });
        console.log("id session:" + req.sessionID)
    }
});

/*//chuyển đến map game
    app.get("/playgame", checkAuthentication,  function(req, res) {
    
    res.render("playgame", {
    data: {}
    });
    });
*/

//chuyển đến map game

app.get("/playgame", function(req, res) {
    if (req.session.user) {
        console.log("id session:" + req.sessionID)
        res.render("playgame", {
            data: req.session.user
        });
    } else {
        res.render("home", {
            data: {}
        });
        console.log("id session:" + req.sessionID)
    }
});


// xu ly nguoi dung dang ki
app.post("/signup", function(req, res) {
    // biến chứa dữ liệu trong form
    var user = req.body;
    // báo lỗi không nhập user
    if (user.username.trim().length == 0) {
        res.render("signup", {
            data: {
                error: "User is required"
            }
        });
        // báo lỗi không nhập nhập khẩu
    } else if (user.passwd.trim().length == 0) {
        res.render("signup", {
            data: {
                error: "Password is required"
            }
        });
        // password không trùng nhau
    } else if (user.passwd != user.repasswd && user.passwd.trim().length != 0) {
        res.render("signup", {
            data: {
                error: "Password is not match"
            }
        });
    } else {
        // chèn dữ liệu vào DB
        var password = helper.hash_password(user.passwd);
        user = {
            username: user.username,
            password: password
        };

        var results = user_md.addUser_check(user);
        // Xử lý xong trở lại trang đăng nhập
        results.then(function(data) {
            res.redirect("/signin");
            // đẩy ra lỗi nếu đã đăng ký
        }).catch(function(err) {
            console.log(err);
            res.render("signup", {
                data: {
                    error: "User is already taken"
                }
            });
        });
    }
});

// xử lý người dùng đăng nhập
app.post("/signin", function(req, res) {
    // Lay thong tin tu form từ biến params
    var params = req.body;
    // Loi không nhập username

    var flag_user = 0;

    if (params.username.trim().length == 0) {
        // render luôn trả về html
        res.render("signin", {
            data: {
                error: "Please enter an username"
            }
        });
    } else if (params.password.trim().length == 0) {
        // render luôn trả về html
        res.render("signin", {
            data: {
                error: "Please enter an password"
            }
        });

        // dã nhập user password
    } else {

        // data nhan username
        var data = user_md.getUserByUsername(params.username);
        // nếu có data
        if (data) {
            console.log("flag_user: data " + flag_user)
            data.then(function(users) {
                var user = users[0];

                // so sánh password
                var status = helper.compare_password(params.password, user.password);
               

                 // password sai
               if (!status) {
                    res.render("signin", {
                        data: {
                            error: "Password wrong"
                        }
                    });
                }

                // đã đăng nhập khớp
                else {
                    // Đẩy user ra
                    req.session.user = user;
                    console.log(req.session.user);
                    var i = 0;
                    for (; i < check_user.length; i++) {
                        if (req.session.user.username == check_user[i]) {
                            flag_user = 1;
                            req.session.destroy();
                            res.render("signin", {
                                data: {
                                    error: "You cannot sign in using another user's sign-in"
                                }
                            });
                        }
                    }
                    check_user.push(req.session.user.username);
                    if (flag_user == 0) {
                        console.log("flag_user play: " + flag_user)
                            // sang trang map game
                        res.redirect('playgame');
                    }

                }
            })
            .catch(function(err) {
            console.log(err);
            res.render("signin", {
                data: {
                    error: "User wrong"
                }
            });
        });    
        }

//Lỗi không có data user
         else {
            res.render("signin", {
                data: {
                    error: "User not exists"
                }
            });
        }
    }
});


// run http trên cổng http
http.listen(port, host, function() {
    console.log("Server is running on port", port);
});

/************************************************
    Xử lý chơi game
************************************************/

var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();
var io = require('socket.io')(http);
var BattleshipGame = require('./app/game.js');
var GameStatus = require('./app/gameStatus.js');

var users = {};
var gameIdCounter = 1;


app.use(express.static(__dirname + "/public"));


// thư viện TCP
var net = require('net');

// giữ các clients
var clients = [];
var socketid = [];

//số lượng tay cầm kết nối lên server
var amount_gamepad = 0;
//số lượng tay cầm người chơi đã chọn
var selected_gamepad = 0;
// var socketid1;
// var socketid2;
var checkshoot = 0;
var player_opponent = null;

var flag_gamepad = 0;
var check_gamepad = [];

var gamepads = {
    id: 0,
    status: null,
    player: null,
    mac: null

};

//add new
var amount_room = 0;
var list_rooms = [];
var players_inroom = [];
var room = {
    id: null,
    players: null
};

var players = 0;
var player_gamepad = [];
var mac_gamepad = [];


var mac_pad = [];

var player_socket = {
    id: null,
    mac_gamepad: null
}

var socket_tcp = [];
// Start a TCP Server
net.createServer(function(socket) {
    // Identify this client
    socket.name = socket.remoteAddress + ":" + socket.remotePort
    console.log('CONNECTED: ' + socket.name);

    socket_tcp.push(socket);
    var x = null;
    flag_gamepad = 0;
    //socket.join('gamepad');
    clients.push(socket.name);
    check_gamepad.push(flag_gamepad);
    player_gamepad.push(x);



    gamepads.id = clients;
    gamepads.status = check_gamepad;
    gamepads.player = player_gamepad;



    console.log('hello ' + clients.length);



    //nhận mac từ tay cầm lên
    socket.on('data', function(data) {

        var line = data.toString(),
            c = 0,
            temp;
        if (line.length == 17) {
            console.log('id mac da nhan :' + line);
            mac_gamepad.push(line);
            var temp, index = gamepads.id.length - 1,
                tempmac, flag = 0;
            gamepads.mac = mac_gamepad;


            temp = gamepads.id[index];
            tempmac = gamepads.mac[index];
            for (c = 0; c < gamepads.id.length - 1; c++) {
                if (gamepads.mac[c] == tempmac) {
                    gamepads.id[c] = temp;
                    flag = 1;
                }
            }
            if (flag == 1) {
                gamepads.id.splice(index, 1);
                gamepads.status.splice(index, 1);
                gamepads.player.splice(index, 1);
                gamepads.mac.splice(index, 1);
                io.sockets.emit('update_gamepad', gamepads);

            }
            for (c = 0; c < gamepads.id.length; c++) {
                for (temp = 0; temp < player_socket.id.length; temp++) {
                    if (gamepads.mac[c] == player_socket.mac_gamepad[temp]) {
                        gamepads.status[c] = 1;
                        gamepads.player[c] = player_socket.id[temp];
                        //xóa tay cầm tại vị trí c vừa tìm dc
                        io.sockets.emit('update_gamepad', gamepads);

                    }
                }
            }

        }

        for (c = 0; c < gamepads.id.length; c++) {
            //nhieu tay cam gui len --> tay chọn mới gửi
            if (socket.name == gamepads.id[c] && gamepads.status[c] == 1) {

                console.log('socket user : ' + socket.name);

                console.log('du lieu1: ', line);

                io.to(gamepads.player[c]).emit('thao_tac', line);

                setTimeout(function() {
                    if (checkshoot == 2) {
                        //trả rung về tay cầm hiện tại
                        socket.write('^');


                        //trả rung về tay cầm đối thủ
                        var socket_opponent = null;

                        //tìm socket id của đối thủ
                        for (var x = 0; x < gamepads.player.length; x++) {
                            if (player_opponent == gamepads.player[x]) {
                                socket_opponent = gamepads.id[x];
                            }
                        }
                        console.log('socket opp : ' + socket_opponent);
                        //lấy socket của id đối thủ trả về kết quả
                        for (var b1 = 0; b1 < socket_tcp.length; b1++) {
                            if (socket_opponent == socket_tcp[b1].name) {
                                socket_tcp[b1].write('!');
                            }
                        }
                        checkshoot = 0;

                    }
                    if (checkshoot == 1) {
                        //socket.write('shoot missed');
                        checkshoot = 0;
                    }

                }, 500);

            }

        }

    });


    socket.on('end', function() {
        console.log('disconnect to server gamepad');
        var c = 0;

        //tìm vị trí tay cầm cần xóa
        for (; c < gamepads.id.length; c++) {
            if (socket.name == gamepads.id[c]) {
                break;
            }
        }

        console.log('disconnect gamepad with mac : ' + gamepads.mac[c]);
        io.to(gamepads.player[c]).emit('disconnect_gamepad', gamepads.mac[c]);


        //xóa tay cầm tại vị trí c vừa tìm dc
        gamepads.id.splice(c, 1);
        gamepads.status.splice(c, 1);
        gamepads.player.splice(c, 1);
        gamepads.mac.splice(c, 1);

        //show list gamepad
        io.sockets.emit('update_gamepad', gamepads);

    });

    io.sockets.emit('update_gamepad', gamepads);
    amount_gamepad = amount_gamepad + 1;
    console.log('so luong tay cam : ' + amount_gamepad);

    socket.write('hello from tcp server');
}).listen(3333, function() {
    console.log('TCP Server is listening on port 3333');
});

/*****************************
    Socket.io
*******************************/

io.on('connection', function(socket) {
    console.log((new Date().toISOString()) + ' ID ' + socket.id + ' connected.');


    socket.room = null; //phòng chơi 
    socket.gamepad = null; //chứa địa chỉ mac của tay cầm


    socketid.push(socket.id);
    mac_pad.push(socket.gamepad);
    player_socket.id = socketid;
    player_socket.mac_gamepad = mac_pad;

    // tạo dữ liệu đối tượng người chơi
    users[socket.id] = {
        inGame: null,
        player: null,
        gamepad: null
    };

    socket.on('infor', function() {
        var c = 0;
        if (socket)
            console.log('start-------');
        for (; c < gamepads.id.length; c++) {

            console.log('id gamepad:' + gamepads.id[c]);
            console.log('status gamepad:' + gamepads.status[c]);
            console.log('player gamepad:' + gamepads.player[c]);
            console.log('mac gamepad:' + gamepads.mac[c]);
            console.log('-------');
        }

        console.log('server-------');
        c = 0;
        for (; c < player_socket.id.length; c++) {
            console.log('id player:' + player_socket.id[c]);
            console.log('mac player:' + player_socket.mac_gamepad[c]);
            console.log('-------');
        }



        console.log('mac ids:---------');
        for (c = 0; c < mac_gamepad.length; c++) {
            console.log('mac id :' + mac_gamepad[c]);
        }

    });


    // Xử lý client
    socket.on('shot', function(position) {
        var game = users[socket.id].inGame,
            opponent;

        if (game !== null) {
            // Is it this users turn?
            if (game.currentPlayer === users[socket.id].player) {
                opponent = game.currentPlayer === 0 ? 1 : 0;


                if (game.shoot(position)) {
                    if (game.check_shoot == 2) {
                        checkshoot = game.check_shoot;
                        //socket.emit('shoot successed');

                        //bắn trúng thì cập nhập điểm   
                        io.to(socket.id).emit('score', game.get_score());
                        io.to(game.getPlayerId(opponent)).emit('score_opp', game.get_score());
                        player_opponent = game.getPlayerId(opponent);

                    }
                    if (game.check_shoot == 1) {
                        checkshoot = game.check_shoot;
                    }
                    // Valid shot
                    checkGameOver(game);

                    //console.log('score hien tai:'+game.get_score())

                    // Update game state on both clients.
                    io.to(socket.id).emit('update', game.getGameState(users[socket.id].player, opponent));
                    io.to(game.getPlayerId(opponent)).emit('update', game.getGameState(opponent, opponent));


                }
            }
        }
    });


    socket.on('change_turn', function() {
        var game = users[socket.id].inGame,
            opponent;

        if (game !== null) {
            // Is it this users turn?
            if (game.currentPlayer === users[socket.id].player) {
                opponent = game.currentPlayer === 0 ? 1 : 0;

                game.switchPlayer();
                checkGameOver(game);
                // Update game state on both clients.
                io.to(socket.id).emit('update', game.getGameState(users[socket.id].player, opponent));
                io.to(game.getPlayerId(opponent)).emit('update', game.getGameState(opponent, opponent));
            }
        }


    });

    //Rời khỏi game
    socket.on('leave', function() {
        if (users[socket.id].inGame !== null) {
            leaveGame(socket);

            // socket.join('waiting room');
            // joinWaitingPlayers();
        }
    });


    //Ngắt kết nối
    socket.on('disconnect', function() {
        console.log((new Date().toISOString()) + ' ID ' + socket.id + ' disconnected.');
        leaveGame(socket);
        delete users[socket.id];
    });




    //tạo phòng
    socket.on('create_room', function() {
        amount_room = amount_room + 1;
        players = 0;

        list_rooms.push(amount_room);
        players_inroom.push(players);

        room.id = list_rooms;
        room.players = players_inroom;

        socket.emit('join_r', amount_room - 1);
        socket.emit('joinRoom', amount_room);
        io.sockets.emit('update_room', room);
    });


    //lấy danh sách phòng trả về cho client để hiển thị
    socket.on('show_rooms', function() {
        socket.emit('update_room', room);
    });


    //kiểm tra phòng
    //input : chỉ số phòng
    socket.on('check_room', function(index) {

        if (room.players[index] >= 2) {

            socket.emit('not_joinRoom', index);

        } else {
            //chuyển giao diện
            socket.emit('joinRoom', room.id[index]);

            //xử lý
            room.players[index]++; //tăng số lượng người trong phòng

            socket.room = room.id[index]; //để biết socket hiện đang ở phòng nào

            io.sockets.emit('update_room', room); //cập nhật phòng để hiển thị só người trong phòng

            socket.join('room' + socket.room); //vào phòng và chờ đối thủ
        }
    });






    //lấy danh sách tay cầm trả về cho client
    socket.on('server_gamepad', function() {
        socket.emit('update_gamepad', gamepads);
    });


    //kiểm tra tay cầm. Nếu tay cầm chưa được chọn và player chưa chọn tay cầm nào thì có thể chọn tay cầm
    //input: chỉ số tay cầm trong danh sách
    socket.on('check_gamepad', function(index) {

        if (gamepads.status[index] == 0 && socket.gamepad == null) {

            //giao dien
            socket.emit('select_gamepad', index);
            gamepads.status[index] = 1;
            gamepads.player[index] = socket.id;


            var c = 0;
            for (; c < player_socket.id.length; c++) {
                if (socket.id == player_socket.id[c]) {
                    socket.gamepad = gamepads.mac[index];
                    player_socket.mac_gamepad[c] = gamepads.mac[index];
                }
            }



            socket.broadcast.emit('update_gamepad', gamepads);

            //khi nhận tay cầm xong thì kiểm tra cả hai người trong phòng chờ đã chọn tay cầm chưa
            joinWaitingPlayers(socket.room);
        } else {
            socket.emit('not_select_gamepad');
        }
    });


    //hiển thị username của mình ở tab đối thủ,dùng socket.to(tên phòng) thông báo tới tab đối thủ trong phòng mà 2 người đang chơi
    //input : username của mình
    socket.on('user_opp', function(data) {
        socket.to('game' + socket.room).emit('showuser_opp', data);
    });

});


// Tạo trò chơi cho người chơi trong phòng chờ
function joinWaitingPlayers(index) {
    var players = getClientsInRoom('room' + index);

    if (players.length >= 2 && players[0].gamepad != null && players[1].gamepad != null) {
        console.log('id 1 :' + players[0].id);
        console.log('id  2 :' + players[1].id);
        console.log('tay cam 1 :' + players[0].gamepad);
        console.log('tay cam 2 :' + players[1].gamepad);
        // 2 player waiting. Create new game!
        selected_gamepad = 0;
        amount_gamepad = 0;
        //var game = new BattleshipGame(gameIdCounter++, players[0].id, players[1].id);
        var game = new BattleshipGame(players[0].room, players[0].id, players[1].id);
        console.log("da vao game : ");
        // create new room for this game
        players[0].leave('room' + index);
        players[1].leave('room' + index);
        players[0].join('game' + players[0].room);
        players[1].join('game' + players[0].room);

        users[players[0].id].player = 0;
        users[players[1].id].player = 1;
        users[players[0].id].inGame = game;
        users[players[1].id].inGame = game;
        // users[players[0].id].gamepad = clients[0];
        // users[players[1].id].gamepad = clients[1];

        io.to('game' + game.id).emit('join', game.id);

        // send initial ship placements
        io.to(players[0].id).emit('update', game.getGameState(0, 0));
        io.to(players[1].id).emit('update', game.getGameState(1, 1));

        console.log((new Date().toISOString()) + " " + players[0].id + " and " + players[1].id + " have joined game ID " + game.id);
    }
}


//Leave user's game
function leaveGame(socket) {
    if (users[socket.id].inGame !== null) {
        console.log((new Date().toISOString()) + ' ID ' + socket.id + ' left game ID ' + users[socket.id].inGame.id);

        // Notifty opponent
        socket.broadcast.to('game' + users[socket.id].inGame.id).emit('notification', {
            // Đối thủ đã rời khỏi trò chơi
            message: 'Opponent has left the game'
        });

        if (users[socket.id].inGame.gameStatus !== GameStatus.gameOver) {
            // Trò chơi chưa hoàn thành, hủy bỏ nó.
            users[socket.id].inGame.abortGame(users[socket.id].player);
            checkGameOver(users[socket.id].inGame);
        }

        socket.leave('game' + users[socket.id].inGame.id);


        socket.gamepad = null;
        for (var c = 0; c < player_socket.id.length; c++) {
            if (socket.id == player_socket.id[c]) {
                player_socket.mac_gamepad[c] = null;
            }
        }


        for (var c = 0; c < gamepads.id.length; c++) {
            if (socket.id == gamepads.player[c]) {
                gamepads.status[c] = 0;
                gamepads.player[c] = null;
            }
        }



        for (var c = 0; c < room.id.length; c++) {
            if (socket.room == room.id[c]) {
                room.players[c] = 0;
            }
        }

        io.sockets.emit('update_room', room);

        users[socket.id].inGame = null;
        users[socket.id].player = null;

        io.to(socket.id).emit('leave');
        io.sockets.emit('update_gamepad', gamepads);
        io.sockets.emit('update_room', room);

    }
}


// Notify players if game over.
// @param {type} game
function checkGameOver(game) {
    if (game.gameStatus === GameStatus.gameOver) {
        console.log((new Date().toISOString()) + ' Game ID ' + game.id + ' ended.');
        io.to(game.getWinnerId()).emit('gameover', true);
        io.to(game.getLoserId()).emit('gameover', false);
    }
}


// Find all sockets in a room
function getClientsInRoom(room) {

    var clients = [];

    for (var id in io.sockets.adapter.rooms[room]) {
        clients.push(io.sockets.adapter.nsp.connected[id]);

    }
    return clients;
}