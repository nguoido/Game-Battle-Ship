//Test localhost
//var socket = io.connect("http://localhost:3000");
//Test server
var socket = io();


function myFunction11(){
        socket.emit('leave');
    }
    
function myFunction10() {
    socket.emit('infor');
}




//chon tay cam 1
    function myFunction1() {
        socket.emit('change_turn');
    }


//chon tay cam 2
    function myFunction2() {
    var x = document.getElementById("bt2");
    x.disabled = true;
    x.style.color="red";
    document.getElementById("gamepad_selected").innerHTML = "You selected gamepad 2";
    socket.emit('gamepad2');
    }

//create room
    function myFunction3(){
        socket.emit('create_room');
    }

//nút load các phòng hiện có
    function myFunction4(){
        socket.emit('show_rooms');
    }

//khi nhan nut play thi chuyen qua phòng chờ
    function myFunction5(index){

        socket.emit('check_room',index);
        
    }

//khi nhan nut thi refresh gamepad
//báo cho server cung cấp danh sách tay cầm
    function myFunction6(){

       socket.emit('server_gamepad');
        
    }

    function myFunction7(index){
       socket.emit('check_gamepad',index);
        
    }

    function status_gamepad(index)
    {
        var x = document.getElementById("bt"+index);
        x.disabled=true;
        x.style.color="red";
        
        
    }






$(function() {

    socket.on('disconnect_gamepad',function(data){
        alert('Disconnect gamepad with mac : '+ data);

    });


//hiển thị tên đối thủ 
    socket.on('showuser_opp',function(data){
        document.getElementById("user_opponent").innerHTML = data;

    });


//hiển thị điểm chéo nhau giữa 2 người chơi
//tab hiện tại 
    socket.on('score',function(data){
        document.getElementById("score_you").innerHTML = "Score : " + data.score_you;
        document.getElementById("score_opponent").innerHTML = "Score : " + data.score_opponent;  

    });
//tab còn lại
        socket.on('score_opp',function(data){
        document.getElementById("score_you").innerHTML = "Score : " + data.score_opponent;
        document.getElementById("score_opponent").innerHTML = "Score : " + data.score_you;  

    });


//không chọn tay cầm
    socket.on('not_select_gamepad',function(){
        //alert('selected gamepad');
    });

//giao diện chọn tay cầm.
//input :chỉ số vị trí tay cầm trong mảng tay cầm
//output:thông báo và đánh dấu nút đã chọn
    socket.on('select_gamepad',function(index){
        status_gamepad(index);//đánh dấu nút 
        var y=index+1;
        document.getElementById("gamepad_selected").innerHTML = "You selected gamepad " +y;
    });


//hiển thị tay cầm 
//input:danh sách tay cầm gồm 3 mảng con.
//1 là id     : chứa địa chỉ ip và port tay cầm
//2 là status : trạng thái tay cầm (= 0: chưa chọn, = 1: đã chọn)
//3 là player : chứa socket id của người chơi
//xử lý:duyệt mảng,tạo button tay cầm và kiểm tra trạng thái button (khi button đã chọn thì sẽ disable button đó )
    socket.on('update_gamepad',function(data){

        $('#box_gamepad').html("");
        $('#gamepad_selected').html("");
         var c=0,temp;
        for(;c<data.id.length;c++)
        {
            temp=c+1;
            $('#box_gamepad').append("<div class='user'>" +"  <button type='button' id='bt"+c+"' onclick='myFunction7("+ c + ")'> Gamepad "+temp+ "</button>" +"</p></div>");
            if(data.status[c]==1)
            {
                status_gamepad(c);
            }        
        }

    });




//khi phòng đủ 2 người thì không cho phép vào phòng
//input : chỉ số phòng đó 
    socket.on('not_joinRoom',function(index){        
        var x = document.getElementById(index);
        x.disabled=true;
        x.style.color="red";

    });

  socket.on('join_r',function(data){
    socket.emit('check_room',data);

  });
//khi phòng chưa đủ 2 người thì vào chơi
//input : chỉ số phòng đó 
    socket.on('joinRoom',function(data){
        //giao diện
        $('#rooms').hide();
        $('#waiting-room').show();
        document.getElementById("id_room").innerHTML = "Waiting room: " + data;
        //xử lý
        myFunction6();//show list gamepad

    });

    //cập nhập phòng hiện tại
    socket.on('update_room',function(data){
        $('#boxContent').html("");//tạo cho rỗng ruột để dễ cập nhập
        var c=0;
        for(;c<data.id.length;c++)
        {
            $('#boxContent').append("<div class='user'>" + "<p>Id room: "+data.id[c] + " --- Players : "+ data.players[c] +"/2" +"  <button type='button' id='"+c+"' onclick='myFunction5("+ c + ")' >Play</button>" +"</p></div>");
        }

    });

   
 
     //Successfully connected to server event
    socket.on('connect', function() {
        console.log('Connected to server.');
        $('#disconnected').hide();
        $('#waiting-room').hide();
        $('#game').hide();
        $('#rooms').show();


        
    });


    // Xu ly xu lieu nhan
    socket.on('thao_tac', function(data) {
        //alert(data);
        Game.dichuyen_shoot(data);

        //add new,

    });




     // Disconnected from server event
    socket.on('disconnect', function() {
        console.log('Disconnected from server.');
        $('#waiting-room').hide();
        $('#game').hide();
        $('#disconnected').show();
        $('#rooms').hide();
    });

   
     // User has joined a game
     
    socket.on('join', function(gameId) {
        Game.initGame();
        // $('#messages').empty();
        $('#disconnected').hide();
        $('#waiting-room').hide();
        $('#game').show();
        $('#game-number').html(gameId);


        var x = document.getElementById("user_you").textContent; 
        socket.emit('user_opp',x);



    })

    /**
     * Update player's game state
     */
    socket.on('update', function(gameState) {
        Game.setTurn(gameState.turn);
        Game.updateGrid(gameState.gridIndex, gameState.grid);
        Game.showtime();

    });


    /**
     * Change game status to game over
     */
    socket.on('gameover', function(isWinner) {
        Game.setGameOver(isWinner);
    });

    /**
     * Leave game and join waiting room
     */
    socket.on('leave', function() {
        $('#game').hide();
        $('#waiting-room').hide();
        $('#rooms').show();
    });


});

/**
 * Send leave game request
 * @param {type} e Event
 */
function sendLeaveRequest(e) {
    e.preventDefault();
    socket.emit('leave');
}

/**
 * Send shot coordinates to server
 * @param {type} square
 */
function sendShot(square) {
    socket.emit('shot', square);
}