// set to true if using live kinectron data
let liveData = true;

// fill in kinectron ip address here ie. "127.16.231.33"
let kinectronIpAddress = "145.93.45.247";

// declare kinectron
let kinectron = null;

// drawHand variables
let start = 30;
let target = 100;
let diameter = start;
let light = 255;
let dark = 100;
let hueValue = light;
let lerpAmt = 0.3;
let state = 'ascending';

// recorded data variables
let sentTime = Date.now();
let currentFrame = 0;
let recorded_skeleton;
let recorded_data_file = "./js/recorded_skeleton.json";


function preload() {

  if (!liveData) {
    recorded_skeleton = loadJSON(recorded_data_file);
  }

}

function setup() {
  createCanvas(1920, 1080);
  background(0);
  noStroke();

  if (liveData) initKinectron();
}


function draw() {

  if (!liveData) loopRecordedData();
}


function loopRecordedData() {

  // send data every 20 seconds
  if (Date.now() > sentTime + 20) {
    bodyTracked(recorded_skeleton[currentFrame])
    sentTime = Date.now();

    if (currentFrame < Object.keys(recorded_skeleton).length-1) {
      currentFrame++;
    } else {
      currentFrame = 0;
    }
  }

}

function initKinectron() {
  // define and create an instance of kinectron
  kinectron = new Kinectron(kinectronIpAddress);

  // connect with application over peer
  kinectron.makeConnection();

  // request all tracked bodies and pass data to your callback
  kinectron.startTrackedBodies(bodyTracked);

}


function bodyTracked(body) {
  background(0, 20);

  let hands = [];

  // get all the joints off the tracked body and do something with them
  for(let jointType in body.joints) {
    joint = body.joints[jointType];

    drawJoint(joint);
	setupRain(joint);

    // get the hands off the tracked body and do somethign with them

    // find right hand
    if (jointType == 11) {
      hands.rightHand = joint;
      hands.rightHandState = translateHandState(body.rightHandState);
    }

    // find left hand
    if (jointType == 7) {
      hands.leftHand = joint;
      hands.leftHandState = translateHandState(body.leftHandState);
    }

  }

  drawHands(hands);

}

// draw skeleton
function drawJoint(joint) {
  fill(100);

  // kinect location data needs to be normalized to canvas size
  ellipse(joint.depthX * width, joint.depthY * height, 15, 15);

  fill(200);

  // kinect location data needs to be normalized to canvas size
  ellipse(joint.depthX * width, joint.depthY * height, 3, 3);
}

// make handstate more readable
function translateHandState(handState) {
  switch (handState) {
    case 0:
      return 'unknown';

    case 1:
      return 'notTracked';

    case 2:
      return 'open';

    case 3:
      return 'closed';

    case 4:
      return 'lasso';
  }
}


// draw hands
function drawHands(hands) {

  // check if hands are touching
  if ((Math.abs(hands.leftHand.depthX - hands.rightHand.depthX) < 0.01) && (Math.abs(hands.leftHand.depthY - hands.rightHand.depthY) < 0.01)) {
    hands.leftHandState = 'clapping';
    hands.rightHandState = 'clapping';
  }

  // draw hand states
  updateHandState(hands.leftHandState, hands.leftHand);
  updateHandState(hands.rightHandState, hands.rightHand);
}

// find out state of hands
function updateHandState(handState, hand) {

  switch (handState) {
    case 'closed':
      drawHand(hand, 1, 255);
      break;

    case 'open':
      drawHand(hand, 0, 255);
      break;

    case 'lasso':
      drawHand(hand, 0, 255);
      break;

      // create new state for clapping
    case 'clapping':
      drawHand(hand, 1, 'red');
  }
}

// draw the hands based on their state
function drawHand(hand, handState, color) {

  if (handState === 1) {
    state = 'ascending';
  }

  if (handState === 0) {
    state = 'descending';
  }

  if (state == 'ascending') {
    diameter = lerp(diameter, target, lerpAmt);
    hueValue = lerp(hueValue, dark, lerpAmt);
  }

  if (state == 'descending') {
    diameter = lerp(diameter, start, lerpAmt);
    hueValue = lerp(hueValue, light, lerpAmt);
  }

  fill(color);

  // Kinect location needs to be normalized to canvas size
  ellipse(hand.depthX * width, hand.depthY * height, diameter, diameter);
}

// Rain ~!!!!

var allParticles = [];
var globalHue = 100;
var spawnPerFrame = 1;
var mouseSize = 50;


function Particle(x, y) {
  this.lastPos = new p5.Vector(x, y);
  this.pos = new p5.Vector(x, y);
  this.vel = new p5.Vector(0, 0);
  this.acc = new p5.Vector(0, 0);
  this.size = random(2, 20);
  this.h = globalHue;
}


function setupRain(joint) {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 200);

  // bodyMouseX = joint.depthX * width;
  // bodyMouseY = joint.depthY * height;
  bodyMouseX = body.joints * width;
  bodyMouseY = body.joints * height;

}


function draw() {
  noStroke();
  fill(0, 5);
  rect(0, 0, width, height);

  for (var i = 0; i < spawnPerFrame; i++) {
  	allParticles.push(new Particle(random(width), 0));
  }

  for (var i = allParticles.length-1; i > -1; i--) {
    allParticles[i].acc.add(new p5.Vector(0, allParticles[i].size*0.0025));

    // Quick check to avoid calculating distance if possible.
    if (abs(allParticles[i].pos.x-bodyMouseX) < mouseSize) {
      d = dist(bodyMouseX, bodyMouseY, allParticles[i].pos.x, allParticles[i].pos.y);
      if (d < mouseSize) {
        var vec = new p5.Vector(bodyMouseX, bodyMouseY-mouseSize);
        vec.sub(new p5.Vector(allParticles[i].pos.x, allParticles[i].pos.y));
        vec.normalize();
        allParticles[i].vel.add(vec);

        allParticles[i].h += 1.5;
        if (allParticles[i].h > 360) {
          allParticles[i].h = 0;
        }
      }
    }

    allParticles[i].vel.add(allParticles[i].acc);
    allParticles[i].pos.add(allParticles[i].vel);
    allParticles[i].acc.mult(0);

    stroke(allParticles[i].h, 360, 360);
    strokeWeight(allParticles[i].size);
    line(allParticles[i].lastPos.x, allParticles[i].lastPos.y,
         allParticles[i].pos.x, allParticles[i].pos.y);

    allParticles[i].lastPos.set(allParticles[i].pos.x, allParticles[i].pos.y);

    if (allParticles[i].pos.y > height || allParticles[i].pos.x < 0 || allParticles[i].pos.x > width) {
      allParticles.splice(i, 1);
    }
  }

  globalHue += 0.015;
  if (globalHue > 360) {
    globalHue = 0;
  }
}
