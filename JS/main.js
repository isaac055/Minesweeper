'use strict'
const MINE = '💥';
const FLAG = '🚩'
const SMILE = '😊';
const WIN = '😎';
const LOOSE = '😵';
const LIFE = '🫀'

var gLife = 3;
var gBoard = [];
var gisHintsOn = false;
var gHintsLeft = 3;
var gIntervalID;
var gisFirstClick = true;

var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};






function startGame() {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    };
    gLife = 3;
    gisHintsOn = false;
    gHintsLeft = 3;
    clearInterval(gIntervalID);

    gBoard = buildBoard();
    renderContainer(SMILE)
    renderBoard(gBoard)
    var elTime = document.querySelector('.time')
    elTime.innerText = `000`

}


function setLevel(indx) {
    var levels = [{ SIZE: 4, MINES: 2 }, { SIZE: 8, MINES: 12 }, { SIZE: 12, MINES: 30 }]
    gLevel = levels[indx]
    gisFirstClick = true;
    startGame()
}


function startTimer() {
    var time = 0;
    var elTimer = document.querySelector('.time')
    gIntervalID = setInterval(function () {

        if (time >= 120 || !gGame.isOn) {
            checkGameOver()
            clearInterval(gIntervalID);
        }
        var strHTML = (time < 100) ? `0${time}` : `${time}`;

        elTimer.innerHTML = (time < 10) ? `0${strHTML}` : strHTML
        gGame.secsPassed = time;
        time++;
    }, 1000);
}




function buildBoard() {
    var board = createMat(gLevel.SIZE, gLevel.SIZE)

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {

            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
            board[i][j] = cell;
        }
    }
     setMines(board, gLevel.MINES);
    // console.table(board);
    return board;
}

function setMines(board, minesQuantity) {

    for (var i = 0; i < minesQuantity; i++) {
        var cell = getRandomCell(board)
        var indx = cell.i;
        var j = cell.j;

        board[indx][j].isMine = true;
    }
}


function setMinesNeighborsCount(board, cellI, cellJ) {

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j > board[i].length - 1) continue;
            if (i === cellI && j === cellJ) continue;

            if (board[i][j].isMine)
                board[cellI][cellJ].minesAroundCount++;
        }
    }
    return board[cellI][cellJ].minesAroundCount;
}



function renderContainer(smiley) {
    var elLife = document.querySelector('.life')
    elLife.innerHTML = LIFE.repeat(gLife)
    var elSmiley = document.querySelector('.smiley')
    elSmiley.innerHTML = smiley
    var elHint = document.querySelector('.hint')
    elHint.innerHTML = `💡 ${gHintsLeft} hints`
    
}



function renderBoard(board) {

    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            var cellClass = getClassName({ i: i, j: j })
            strHTML += `\t<td class="cell" id ="${cellClass}"  onclick="cellClicked(this,${i},${j})" oncontextmenu="cellMarked(this)" >\n`;

            if (!currCell.isMine) setMinesNeighborsCount(board, i, j)

            strHTML += '\t</td>\n';

        }
        strHTML += '</tr>\n';
    }


    window.addEventListener("contextmenu", e => e.preventDefault());
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;

}


function cellClicked(elCell, i, j) {

    if (gisFirstClick) {
        gisFirstClick = false
        uncoverCell(elCell, i, j)
        startTimer()
        if (gBoard[i][j].isMine) {
            gBoard[i][j].isMine = false;
            // uncoverCell(elCell, i, j);
            setMines(gBoard, 1);
        }
        return;
    }

    if (gBoard[i][j].isShown) return;

    if (gisHintsOn) {
        gisHintsOn = false;
        gHintsLeft--;
        revelHint(i, j)
        setTimeout(function () {
            coverHint(i, j)
        }, 1000);

        return;
    }



    if (gBoard[i][j].isMarked) return;
    uncoverCell(elCell, i, j)


    if (gBoard[i][j].isMine) {
        elCell.innerHTML = MINE;
        gGame.shownCount--;
        gLife--;
        renderContainer(SMILE)
        checkGameOver();
        return;
    }

    if (gBoard[i][j].minesAroundCount === 0) {
        expandShown(i, j)
        checkGameOver()
        return;
    }
    checkGameOver()

    elCell.innerHTML = gBoard[i][j].minesAroundCount;


}


function expandShown(cellI, cellJ) {

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            var elCell = document.getElementById(`cell-${i}-${j}`);
            if (j < 0 || j > gBoard[i].length - 1) continue;
            if (i === cellI && j === cellJ) continue;
            if (gBoard[i][j].isMine) continue;
            if (gBoard[i][j].isShown) continue;
            uncoverCell(elCell, i, j)
            if (gBoard[i][j].minesAroundCount !== 0) {
                elCell.innerHTML = gBoard[i][j].minesAroundCount;
            } else {
                expandShown(i, j);
            }
        }
    }
}


function cellMarked(elCell) {

    if (gisFirstClick) {
        gisFirstClick = false
        startGame()
    }

    var cell = elCell.id.split('-')
    var i = cell[1]
    var j = cell[2]
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked;
    elCell.innerHTML = (gBoard[i][j].isMarked) ? FLAG : '';
    gGame.markedCount += (gBoard[i][j].isMarked) ? 1 : -1;
    checkGameOver();
}


function hintOn(elButton) {
    renderContainer(SMILE)
    gisHintsOn = true;

}


function revelHint(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            var elCell = document.getElementById(`cell-${i}-${j}`);
            if (j < 0 || j > gBoard[i].length - 1) continue;
            if (gBoard[i][j].isShown) continue;
            uncoverCell(elCell, i, j)
            if (gBoard[i][j].minesAroundCount !== 0) {
                elCell.innerHTML = gBoard[i][j].minesAroundCount;
            }
        }
    }
}


function coverHint(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            var elCell = document.getElementById(`cell-${i}-${j}`);
            if (j < 0 || j > gBoard[i].length - 1) continue;
            coverCell(elCell, i, j)
            if (gBoard[i][j].minesAroundCount !== 0) {
                elCell.innerHTML = '';
            }
        }
    }
}


function checkGameOver() {


    var deff = gLevel.SIZE ** 2 - gLevel.MINES;

    // console.log(deff);
    // console.log(gGame.shownCount);
    // console.log(gGame.markedCount);
    // console.log(gLevel.MINES);
    if (gGame.shownCount >= deff && gGame.markedCount === gLevel.MINES) {
        gGame.isOn = false;
        renderContainer(WIN)
        console.log('win');

    }
    if (gLife === 0 || gGame.secsPassed === 120) {
        gGame.isOn = false;
        uncoverMines();
        renderContainer(LOOSE);
        console.log('lose');
    }


}


function uncoverCell(elCell, i, j) {
    // if (gBoard[i][j].isShown) return;
    console.log('i', i, 'j', j);
    gBoard[i][j].isShown = true
    elCell.classList.add('uncover')
    gGame.shownCount++;
}



function coverCell(elCell, i, j) {
    // if (gBoard[i][j].isShown) return;
    // console.log('i', i, 'j', j);
    gBoard[i][j].isShown = false
    elCell.classList.remove('uncover')
    gGame.shownCount--;
}


function uncoverMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {

            if (gBoard[i][j].isMine) {
                // elCell.classList.add('uncover')
                var elCell = document.getElementById(`cell-${i}-${j}`)
                elCell.innerHTML = MINE;
            }
        }
    }

}



function getRandomCell(board) {
    var emptyCells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine || board[i][j].isShown) {
                emptyCells.push({ 'i': i, 'j': j })
            }

        }
    }
    var randIdx = getRandomInt(0, emptyCells.length - 1)
    // console.log(emptyCells);
    return emptyCells[randIdx]
}




// function renderCell(location, value) {

//     var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
//     console.log(elCell);
//     elCell.innerHTML = value;
//     console.log(elCell);
// }

