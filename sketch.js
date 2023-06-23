let ws;
let squares = {};
let myId = null;
let mySquare = null;
let speed = 5;

function setup() {
  createCanvas(windowWidth, windowHeight);
  mySquare = {
    color: randomColor(),
    position: createVector(Math.random() * width, Math.random() * height)
  };
  ws = new WebSocket('ws://localhost:8080');
  
  ws.onopen = () => {
    console.log('Connected');
  }

  ws.onmessage = (msg) => {
    let msgObj = JSON.parse(msg.data);
    if (msgObj.type === "connect") {
      console.log(msgObj.payload);
      myId = msgObj.payload.id;
    } else if (msgObj.type === "move") {
      squares[msgObj.payload.id] = {
        color: msgObj.payload.color,
        position: createVector(msgObj.payload.position.x, msgObj.payload.position.y)
      };
    }
  }
  
  ws.onclose = () => {
    console.log('Disconnected');
  }
}

function draw() {
  background(255);
  for (let key in squares) {
    fill(squares[key].color);
    square(squares[key].position.x, squares[key].position.y, 50);
  }
  if (mySquare) {
    fill(mySquare.color);
    square(mySquare.position.x, mySquare.position.y, 50);
    
    if (keyIsDown(LEFT_ARROW)) {
      mySquare.position.x -= speed;
    } else if (keyIsDown(RIGHT_ARROW)) {
      mySquare.position.x += speed;
    } else if (keyIsDown(UP_ARROW)) {
      mySquare.position.y -= speed;
    } else if (keyIsDown(DOWN_ARROW)) {
      mySquare.position.y += speed;
    }

    ws.send(JSON.stringify({type: "move", payload: {x: mySquare.position.x, y: mySquare.position.y}}));
  }
}

function randomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}
