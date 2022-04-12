// var canvas;
// var ctx;

// var canvasOffset;
// var offsetX;
// var offsetY;

// var isDrawing = false;
  
// canvas = document.getElementById("canvas");
// ctx = canvas.getContext("2d");

// canvasOffset = $("#canvas").offset();
// offsetX = canvasOffset.left;
// offsetY = canvasOffset.top;

// $("#canvas").on('mousedown', function (e) {
//     handleMouseDown(e);
// }).on('mouseup', function(e) {
//     handleMouseUp();
// }).on('mousemove', function(e) {
//     handleMouseMove(e);
// });


// var startX;
// var startY;

// function handleMouseUp() {
// 	isDrawing = false;
// 	canvas.style.cursor = "default";	
// }

// function handleMouseMove(e) {
// 	if (isDrawing) {
// 		var mouseX = parseInt(e.clientX - offsetX);
// 		var mouseY = parseInt(e.clientY - offsetY);				
		
// 		ctx.clearRect(0, 0, canvas.width, canvas.height);
// 		ctx.beginPath();
// 		ctx.rect(startX, startY, mouseX - startX, mouseY - startY);
// 		ctx.stroke();
		
// 	}
// }

// function handleMouseDown(e) {
// 	canvas.style.cursor = "crosshair";		
// 	isDrawing = true
// 	startX = parseInt(e.clientX - offsetX);
// 	startY = parseInt(e.clientY - offsetY);
// }

/*** 

var stage = new createjs.Stage("canvas");
createjs.Ticker.on("tick", tick);

var selection = new createjs.Shape(),
  g = selection.graphics.setStrokeStyle(1).beginStroke("#000").beginFill("rgba(0,0,0,0.05)"),
  sd = g.setStrokeDash([10, 5], 0).command,
  r = g.drawRect(0, 0, 100, 100).command,
  moveListener;


stage.on("stagemousedown", dragStart);
stage.on("stagemouseup", dragEnd);

function dragStart(event) {
  stage.addChild(selection).set({
    x: event.stageX,
    y: event.stageY
  });
  r.w = 0;
  r.h = 0;
  moveListener = stage.on("stagemousemove", drag);
};

function drag(event) {
  r.w = event.stageX - selection.x;
  r.h = event.stageY - selection.y;
}

function dragEnd(event) {
  stage.off("stagemousemove", moveListener);
}

function tick(event) {
  stage.update(event);
  sd.offset--;
}


/*** 0*/

// var canvas = document.getElementById('canvas');
// var ctx = canvas.getContext('2d');
// var video = document.getElementById('video');

// // set canvas size = video size when known
// video.addEventListener('loadedmetadata', function() {
//   canvas.width = video.videoWidth;
//   canvas.height = video.videoHeight;
// });

// video.addEventListener('play', function() {
//   var $this = this; //cache
//   (function loop() {
//     if (!$this.paused && !$this.ended) {
//       ctx.drawImage($this, 0, 0);
//       setTimeout(loop, 1000 / 30); // drawing at 30fps
//     }
//   })();
// }, 0);


const canvas = document.querySelector('canvas');
const video = document.querySelector('video');
const fps = 60;
const width = 1280;
const height = 720;
const canvasInterval = null;
function drawImage() {
  canvas.getContext('2d', { alpha: false }).drawImage(video, 0, 0, width, height);
}
canvasInterval = window.setInterval(() => {
  drawImage(video);
}, 1000 / fps);
video.onpause = function() {
  clearInterval(canvasInterval);
};
video.onended = function() {
  clearInterval(canvasInterval);
};
video.onplay = function() {
  clearInterval(canvasInterval);
  canvasInterval = window.setInterval(() => {
    drawImage(video);
  }, 1000 / fps);
};