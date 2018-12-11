var GameStatus = {
    inProgress: 1,
    gameOver: 2
}

var Game = (function() {
    var canvas = [],
        context = [],
        grid = [],
        gridHeight = 400,
        gridWidth = 400,
        gridBorder = 1,
        gridRows = 10,
        gridCols = 10,
        markPadding = 10,
        shipPadding = 3,
        squareHeight = (gridHeight - gridBorder * gridRows - gridBorder) / gridRows,
        squareWidth = (gridWidth - gridBorder * gridCols - gridBorder) / gridCols,
        turn = false,
        gameStatus, squareHover = {
            x: -1,
            y: -1
        },
        toado = {
            x: 0,
            y: 0
        },
        frist=1;

    canvas[0] = document.getElementById('canvas-grid1'); // This player
    canvas[1] = document.getElementById('canvas-grid2'); // Opponent
    context[0] = canvas[0].getContext('2d');
    context[1] = canvas[1].getContext('2d');
//set time
var myVar;
var time;
function showtime(){
    if(turn)
    {
        time = 20;
        myVar = setInterval(myTimer, 1000);

         
        function myTimer() {
     
            document.getElementById("time").innerHTML = 'Time:' + time;
            time--;
            if(time<0)
            {
                 clearInterval(myVar);
                 myFunction1();
            }

        };



        

    }

};




// phim may tinh
    // document.addEventListener('keydown', function(e) {
    //     if (turn) {

    //         stepnew_old(toado.y, toado.x, 1, 1);

    //         if (e.which == 39) //right
    //         {
    //             stepnew_old(toado.y, toado.x, 1, 0);

    //             toado.x = toado.x + 1;
    //             if (toado.x > (gridCols - 1)) {
    //                 toado.x = 0;
    //             }
    //             stepnew_old(toado.y, toado.x, 1, 1);
    //         }
    //         if (e.which == 37) //left
    //         {
    //             stepnew_old(toado.y, toado.x, 1, 0);

    //             toado.x = toado.x - 1;
    //             if (toado.x < 0) {
    //                 toado.x = gridCols - 1;
    //             }
    //             stepnew_old(toado.y, toado.x, 1, 1);
    //         }
    //         if (e.which == 38) //up
    //         {
    //             stepnew_old(toado.y, toado.x, 1, 0);

    //             toado.y = toado.y - 1;
    //             if (toado.y < 0) {
    //                 toado.y = gridRows - 1;
    //             }
    //             stepnew_old(toado.y, toado.x, 1, 1);
    //         }
    //         if (e.which == 40) //down
    //         {
    //             stepnew_old(toado.y, toado.x, 1, 0);

    //             toado.y = toado.y + 1;
    //             if (toado.y > (gridCols - 1)) {
    //                 toado.y = 0;
    //             }
    //             stepnew_old(toado.y, toado.x, 1, 1);
    //         }

    //         if (e.which == 79) //nut o ban
    //         {
    //             //if(grid[1].shots[toado.x * gridCols + toado.y] === 0)
    //             sendShot(toado);
    //         }
    //     }
    // });


    function dichuyen_shoot(e) {
        if (turn) {

            clearInterval(myVar);
            if(frist==1)
            {
                stepnew_old(toado.y, toado.x, 1, 1);
                frist=frist+1;
            }
            else{
            if (e == 'r') //right
            {
                stepnew_old(toado.y, toado.x, 1, 0);

                toado.x = toado.x + 1;
                if (toado.x > (gridCols - 1)) {
                    toado.x = 0;
                }
                stepnew_old(toado.y, toado.x, 1, 1);
            }
            if (e == 'l') //left
            {
                stepnew_old(toado.y, toado.x, 1, 0);

                toado.x = toado.x - 1;
                if (toado.x < 0) {
                    toado.x = gridCols - 1;
                }
                stepnew_old(toado.y, toado.x, 1, 1);
            }
            if (e == 'u') //up
            {
                stepnew_old(toado.y, toado.x, 1, 0);

                toado.y = toado.y - 1;
                if (toado.y < 0) {
                    toado.y = gridRows - 1;
                }
                stepnew_old(toado.y, toado.x, 1, 1);
            }
            if (e == 'd') //down
            {
                stepnew_old(toado.y, toado.x, 1, 0);

                toado.y = toado.y + 1;
                if (toado.y > (gridCols - 1)) {
                    toado.y = 0;
                }
                stepnew_old(toado.y, toado.x, 1, 1);
            }

            if (e == 's') //nut o ban
            {
                //if(grid[1].shots[toado.x * gridCols + toado.y] === 0)
                sendShot(toado);
            }
        }

        }
    };
   
    


    function getSquare(x, y) {
        return {
            x: Math.floor(x / (gridWidth / gridCols)),
            y: Math.floor(y / (gridHeight / gridRows))
        };
    };


    function getCanvasCoordinates(event, canvas) {
        rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((event.clientX - rect.left) / (rect.right - rect.left) * canvas.width),
            y: Math.round((event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height)
        };
    };

    /**
     * Init new game
     */
    function initGame() {
        var i;

        gameStatus = GameStatus.inProgress;

        // Create empty grids for player and opponent
        grid[0] = {
            shots: Array(gridRows * gridCols),
            ships: []
        };
        grid[1] = {
            shots: Array(gridRows * gridCols),
            ships: []
        };

        for (i = 0; i < gridRows * gridCols; i++) {
            grid[0].shots[i] = 0;
            grid[1].shots[i] = 0;
        }

        // Reset turn status classes
        $('#turn-status').removeClass('alert-your-turn').removeClass('alert-opponent-turn')
            .removeClass('alert-winner').removeClass('alert-loser');

        drawGrid(0);
        drawGrid(1);
    };


    function updateGrid(player, gridState) {
        grid[player] = gridState;
        drawGrid(player);
    };


    function setTurn(turnState) {
        if (gameStatus !== GameStatus.gameOver) {
            turn = turnState;

            if (turn) {
                $('#turn-status').removeClass('alert-opponent-turn').addClass('alert-your-turn').html('It\'s your turn!');
            } else {
                $('#turn-status').removeClass('alert-your-turn').addClass('alert-opponent-turn').html('Waiting for opponent.');
            }
        }
    };

 
    function setGameOver(isWinner) {
        gameStatus = GameStatus.gameOver;
        turn = false;

        if (isWinner) {
            $('#turn-status').removeClass('alert-opponent-turn').removeClass('alert-your-turn')
                .addClass('alert-winner').html('You won! <a href="#" class="btn-leave-game">Play again</a>.');
        } else {
            $('#turn-status').removeClass('alert-opponent-turn').removeClass('alert-your-turn')
                .addClass('alert-loser').html('You lost. <a href="#" class="btn-leave-game">Play again</a>.');
        }
        $('.btn-leave-game').click(sendLeaveRequest);
    }


    function drawGrid(gridIndex) {
        drawSquares(gridIndex);
        drawShips(gridIndex);
        drawMarks(gridIndex);
    };

 
    function drawSquares(gridIndex) {
        var i, j, squareX, squareY;

        context[gridIndex].fillStyle = '#222222' //màu nền đen là của khung 
        context[gridIndex].fillRect(0, 0, gridWidth, gridHeight);

        for (i = 0; i < gridRows; i++) {
            for (j = 0; j < gridCols; j++) {
                squareX = j * (squareWidth + gridBorder) + gridBorder;
                squareY = i * (squareHeight + gridBorder) + gridBorder;

                context[gridIndex].fillStyle = '#7799FF' //màu xanh dương của ô vuông nhỏ

              

                if (j === squareHover.x && i === squareHover.y &&
                    gridIndex === 1 && grid[gridIndex].shots[i * gridCols + j] === 0 && turn) {
                    context[gridIndex].fillStyle = '#4477FF';
                }

                context[gridIndex].fillRect(squareX, squareY, squareWidth, squareHeight);
            }
        }
    };

 
    function drawShips(gridIndex) {
        var ship, i, x, y,
            shipWidth, shipLength;

        context[gridIndex].fillStyle = '#444444'; //màu con tàu

        for (i = 0; i < grid[gridIndex].ships.length; i++) {
            ship = grid[gridIndex].ships[i];

            x = ship.x * (squareWidth + gridBorder) + gridBorder + shipPadding;
            y = ship.y * (squareHeight + gridBorder) + gridBorder + shipPadding;
            shipWidth = squareWidth - shipPadding * 2;
            shipLength = squareWidth * ship.size + (gridBorder * (ship.size - 1)) - shipPadding * 2;

            if (ship.horizontal) {
                context[gridIndex].fillRect(x, y, shipLength, shipWidth);
            } else {
                context[gridIndex].fillRect(x, y, shipWidth, shipLength);
            }
        }
    };


    function drawMarks(gridIndex) {
        var i, j, squareX, squareY;

        for (i = 0; i < gridRows; i++) {
            for (j = 0; j < gridCols; j++) {
                squareX = j * (squareWidth + gridBorder) + gridBorder;
                squareY = i * (squareHeight + gridBorder) + gridBorder;

                // draw black cross if there is a missed shot on square
                if (grid[gridIndex].shots[i * gridCols + j] === 1) {
                    context[gridIndex].beginPath();
                    context[gridIndex].arc(squareX + squareWidth / 2, squareY + squareWidth / 2,
                        squareWidth / 2 - markPadding, 0, 2 * Math.PI, false);
                    context[gridIndex].fillStyle = '#000000';
                    context[gridIndex].fill();
                }
                // draw red circle if hit on square
                else if (grid[gridIndex].shots[i * gridCols + j] === 2) {
                    context[gridIndex].beginPath();
                    context[gridIndex].arc(squareX + squareWidth / 2, squareY + squareWidth / 2,
                        squareWidth / 2 - markPadding, 0, 2 * Math.PI, false);
                    context[gridIndex].fillStyle = '#E62E2E';
                    context[gridIndex].fill();
                }
            }
        }
    };

    function stepnew_old(x, y, gridIndex, check) {

        if (check === 1) //step new
        {
            squareX = y * (squareWidth + gridBorder) + gridBorder + shipPadding;
            squareY = x * (squareHeight + gridBorder) + gridBorder + shipPadding;
            context[gridIndex].fillStyle = '#4477FF';
            context[gridIndex].fillRect(squareX, squareY, squareWidth - shipPadding * 2, squareHeight - shipPadding * 2);
        }
        if (check === 0) //step old
        {
            squareX = y * (squareWidth + gridBorder) + gridBorder + shipPadding;
            squareY = x * (squareHeight + gridBorder) + gridBorder + shipPadding;
            if (grid[gridIndex].shots[x * gridCols + y] === 0) {
                context[gridIndex].fillStyle = '#7799FF';
                context[gridIndex].fillRect(squareX, squareY, squareWidth - shipPadding * 2, squareHeight - shipPadding * 2);
            }

            if (grid[gridIndex].shots[x * gridCols + y] === 1) {
                context[gridIndex].beginPath();
                context[gridIndex].arc(squareX + squareWidth / 2, squareY + squareWidth / 2,
                    squareWidth / 2 - markPadding, 0, 2 * Math.PI, false);
                context[gridIndex].fillStyle = '#000000';
                context[gridIndex].fill();
            }

            if (grid[gridIndex].shots[x * gridCols + y] === 2) {
                context[gridIndex].beginPath();
                context[gridIndex].arc(squareX + squareWidth / 2, squareY + squareWidth / 2,
                    squareWidth / 2 - markPadding, 0, 2 * Math.PI, false);
                context[gridIndex].fillStyle = '#E62E2E';
                context[gridIndex].fill();
            }
        }

    }

    

    return {
        'initGame': initGame,
        'updateGrid': updateGrid,
        'setTurn': setTurn,
        'setGameOver': setGameOver,
        'dichuyen_shoot': dichuyen_shoot,
        'showtime':showtime
    };
})();