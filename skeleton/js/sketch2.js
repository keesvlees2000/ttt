// set to true if using live kinectron data
let liveData = true;

// fill in kinectron ip address here ie. "127.16.231.33"
let kinectronIpAddress = "145.93.181.252";

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
  //Verander dit om switch te krijgen als de kinect mensen herkent
  background(0, 20);

  // get all the joints off the tracked body and do something with them
  for(let jointType in body.joints) {
    joint = body.joints[jointType];

    drawJoint(joint);
  }

  drawHands(hands);

}

// draw skeleton
function drawJoint(joint) {
  fill(0);

  // kinect location data needs to be normalized to canvas size
  ellipse(joint.depthX * width, joint.depthY * height, 15, 15);

   fill(200);

  // kinect location data needs to be normalized to canvas size
  ellipse(joint.depthX * width, joint.depthY * height, 3, 3);
}




// Rain
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
  // createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 200);

  mouseX = body.joints * width;
  mouseY = body.joints * height;
}


function draw() {
  noStroke();
  fill(0, 1);
  rect(0, 0, width, height);

  for (var i = 0; i < spawnPerFrame; i++) {
  	allParticles.push(new Particle(random(width), 0));
  }

  for (var i = allParticles.length-1; i > -1; i--) {
    allParticles[i].acc.add(new p5.Vector(0, allParticles[i].size*0.0025));

    // Quick check to avoid calculating distance if possible.
    if (abs(allParticles[i].pos.x-mouseX) < mouseSize) {
      d = dist(mouseX, mouseY, allParticles[i].pos.x, allParticles[i].pos.y);
      if (d < mouseSize) {
        var vec = new p5.Vector(mouseX, mouseY-mouseSize);
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
