let score;
let field = document.getElementById("gameField");
let fieldItem = document.getElementById("gameField");
let myModal = new bootstrap.Modal(document.getElementById("scoreModal"));
let emptySquares = [];
let fieldSquares = [];
let recordsList;
let colors = ["red", "green", "purple"];
let gameIsOn = false;
let theGame;

class Game {
  constructor() {
    this.scoreBox = document.forms["formGroupScore"];
    this.timeCounterInterval;
    this.distance;
    score = 0;
    this._createTable();
    this._addingSquares();
    for (let i = 0; i < this._randomize(3); i++) {
      this._addingSquares();
    }
    this._timeCounter();
    this._clickListner();
    gameIsOn = true;
  }
  _createTable() {
    this._table = document.createElement("table");
    this._fieldCols = Math.floor(fieldItem.clientWidth / 20);
    this._fieldRows = Math.floor(fieldItem.clientHeight / 20);
    for (let i = 0; i < this._fieldRows; i++) {
      let tr = document.createElement("tr");
      for (let j = 0; j < this._fieldCols; j++) {
        let td = document.createElement("td");
        let idOfNewSquares = String(i) + String(j);
        td.id = idOfNewSquares;
        emptySquares.push(idOfNewSquares);
        tr.appendChild(td);
      }
      this._table.appendChild(tr);
    }
    field.appendChild(this._table);
    field.classList.remove("col-8", "h-100");
    field.classList.add("col-auto");
    field.style.height = "fit-content";
  }
  _randomize(elem) {
    let random = Math.floor(Math.random() * elem);
    return random;
  }
  _addingSquares() {
    let addedSquaresId = emptySquares[this._randomize(emptySquares.length)];
    document.getElementById(addedSquaresId).classList.add("colored", colors[this._randomize(3)]);
    emptySquares.splice(emptySquares.indexOf(addedSquaresId), 1);
    fieldSquares.push(addedSquaresId);
  }
  _timeCounter() {
    let date = new Date().getTime();
    this.timer = date + (this.distance ? this.distance : 60000);
    let timeCounterInterval = setInterval(() => {
      this.timeCounterInterval = timeCounterInterval;
      let now = new Date().getTime();
      this.distance = this.timer - now;
      let seconds = Math.floor((this.distance % (1000 * 60)) / 1000);
      let minutes = Math.floor((this.distance % (1000 * 60 * 60)) / (1000 * 60));
      document.getElementById("formGroupTimer").innerHTML = minutes + "m " + seconds + "s ";
      if (this.distance < 0) {
        document.getElementById("formGroupTimer").innerHTML = "TIME END";
        clearInterval(timeCounterInterval);
        this._end(this._table);
      }
    }, 1000);
  }
  _clickListner() {
    field.addEventListener("click", () => {
      let square = event.target;
      this._deleteSquare(square);
    });
  }
  _end(tableElement) {
    let endGameScore = document.getElementById("endGameScore");
    endGameScore.innerText = score;
    myModal.toggle();
    field.classList.add("col-8", "h-100");
    field.classList.remove("col-auto");
    tableElement.remove();
    btnsControl("startBtn");
  }
  _deleteSquare(square) {
    if (square.classList.contains("colored")) {
      fieldSquares.splice(fieldSquares.indexOf(square.id), 1);
      emptySquares.push(square.id);
      if (square.classList.contains("red")) {
        score = score + 1;
      }
      if (square.classList.contains("green")) {
        score = score + 2;
      }
      if (square.classList.contains("purple")) {
        score = score + 3;
      }
      square.classList = "";
      this.scoreBox.elements["inputGroupScore"].value = score;
      this._addingSquares();
      for (let i = 0; i < this._randomize(3); i++) {
        this._addingSquares();
      }
    } else {
      return;
    }
  }
}

class recordListListner {
  constructor() {
    if (gameIsOn) {
      this.nameForm = document.forms["endGameScoreForm"];
      this.userName = this.nameForm.elements["inputName"].value;
      this.user = new userScore(this.userName, score);
      recordsList.push(this.user);
      this._recordList = recordsList;
      this.nameForm.elements["inputName"].value = "";
      myModal.toggle();
      this._sortList(this._recordList);
      recordsList = recordsList.slice(0, 10);
      localStorage.setItem("records", JSON.stringify(recordsList));
      gameIsOn = false;
      theGame = undefined;
    }
    this._publishedNewList();
  }
  _sortList(list) {
    recordsList = list.sort((a, b) => b.score - a.score);
  }
  _publishedNewList() {
    let listWrapper = document.getElementById("listWrapperID");
    listWrapper.innerHTML = "";
    for (let i = 0; i < recordsList.length; i++) {
      let li = document.createElement("li");
      let numberOfScoreList = i + 1;
      let userScoreSemple =
        "<span>" +
        numberOfScoreList +
        "</span><span class='name'>" +
        recordsList[i].name +
        "</span><span class='score'>" +
        recordsList[i].score +
        "</span>";
      li.innerHTML = userScoreSemple;
      listWrapper.appendChild(li);
    }
  }
}

class localStorageListner {
  constructor() {
    if (localStorage.getItem("records")) {
      this.addDate();
      this._recordListListner = new recordListListner();
      this._recordListListner._publishedNewList();
    } else {
      recordsList = [];
    }
  }
  addDate() {
    recordsList = JSON.parse(localStorage.getItem("records"));
  }
}

class userScore {
  constructor(name, score) {
    this.name = name;
    this.score = score;
  }
}

function removeRecords() {
  localStorage.getItem("records") ? localStorage.removeItem("records") : remove;
  let listWrapper = document.getElementById("listWrapperID");
  listWrapper.innerHTML = "";
}

function gameStart(gameType) {
  if (theGame && gameType == "removePlaingGame") {
    field.classList.add("col-8", "h-100");
    field.classList.remove("col-auto");
    this.oldTable = fieldItem.querySelectorAll("table");
    this.oldTable[0].remove();
    clearInterval(theGame.timeCounterInterval);
    theGame = undefined;
    theGame = new Game(gameType);
    btnsControl("pauseBtn");
  }
  if (!theGame && gameType == "newGame") {
    theGame = undefined;
    theGame = new Game(gameType);
    btnsControl("pauseBtn");
  }
  if (theGame && gameType == "pauseGame") {
    clearInterval(theGame.timeCounterInterval);
    btnsControl("unpausedBtn");
  }
  if (theGame && gameType == "unpausedGame") {
    theGame._timeCounter();
    btnsControl("pauseBtn");
  }
}

function gameEnd() {
  new recordListListner();
}

new localStorageListner();

function btnsControl(neededBtn) {
  if (neededBtn == "startBtn") {
    if (document.getElementById("startBtn").classList.contains("d-none")) {
      document.getElementById("startBtn").classList.remove("d-none");
    }
    if (!document.getElementById("pauseBtn").classList.contains("d-none")) {
      document.getElementById("pauseBtn").classList.add("d-none");
    }
    if (!document.getElementById("unpausedBtn").classList.contains("d-none")) {
      document.getElementById("unpausedBtn").classList.add("d-none");
    }
  }
  if (neededBtn == "pauseBtn") {
    if (!document.getElementById("startBtn").classList.contains("d-none")) {
      document.getElementById("startBtn").classList.add("d-none");
    }
    if (document.getElementById("pauseBtn").classList.contains("d-none")) {
      document.getElementById("pauseBtn").classList.remove("d-none");
    }
    if (!document.getElementById("unpausedBtn").classList.contains("d-none")) {
      document.getElementById("unpausedBtn").classList.add("d-none");
    }
  }
  if (neededBtn == "unpausedBtn") {
    if (!document.getElementById("startBtn").classList.contains("d-none")) {
      document.getElementById("startBtn").classList.add("d-none");
    }
    if (!document.getElementById("pauseBtn").classList.contains("d-none")) {
      document.getElementById("pauseBtn").classList.add("d-none");
    }
    if (document.getElementById("unpausedBtn").classList.contains("d-none")) {
      document.getElementById("unpausedBtn").classList.remove("d-none");
    }
  }
}
