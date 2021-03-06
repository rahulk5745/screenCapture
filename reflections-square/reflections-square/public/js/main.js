"use strict";

var constraints = { video: true, audio: true };

var shareBtn = document.querySelector("button#shareScreen");
var recBtn = document.querySelector("button#rec");
var stopBtn = document.querySelector("button#stop");
var cropBtn = document.querySelector("button#crp");

var videoElement = document.querySelector("video");
var dataElement = document.querySelector("#data");



videoElement.controls = false;

var Url

var mediaRecorder;
var chunks = [];
var count = 0;
var localStream = null;
var soundMeter = null;
var micNumber = 0;
var blob =null

const WIDTH=800;
let convertedHeight = 600;

// showing loading
const loader = document.querySelector("#loading");

function displayLoading() {
    loader.classList.add("display");
}

// hiding loading 
function hideLoading() {
    loader.classList.remove("display");
}


function onShareScreen() {
  if (!navigator.mediaDevices.getDisplayMedia) {
    alert(
      "navigator.mediaDevices.getDisplayMedia not supported on your browser, use the latest version of Chrome"
    );
  } else {
    if (window.MediaRecorder == undefined) {
      alert(
        "MediaRecorder not supported on your browser, use the latest version of Firefox or Chrome"
      );
    } else {
      navigator.mediaDevices.getDisplayMedia(constraints).then(function(screenStream) {
          //check for microphone
          navigator.mediaDevices.enumerateDevices().then(function(devices) {
              devices.forEach(function(device) {
                if (device.kind == "audioinput") {
                  micNumber++;
                }
              });

              if (micNumber == 0) {
                getStreamSuccess(screenStream);
              } else {
                navigator.mediaDevices.getUserMedia({audio: true}).then(function(micStream) {
                    var composedStream = new MediaStream();

                    //added the video stream from the screen
                    screenStream.getVideoTracks().forEach(function(videoTrack) {
                      composedStream.addTrack(videoTrack);
                    });

                    //if system audio has been shared
                    if (screenStream.getAudioTracks().length > 0) {
                      //merge the system audio with the mic audio
                      var context = new AudioContext();
                      var audioDestination = context.createMediaStreamDestination();

                      const systemSource = context.createMediaStreamSource(screenStream);
                      const systemGain = context.createGain();
                      systemGain.gain.value = 1.0;
                      systemSource.connect(systemGain).connect(audioDestination);
                      console.log("added system audio");

                      if (micStream && micStream.getAudioTracks().length > 0) {
                        const micSource = context.createMediaStreamSource(micStream);
                        const micGain = context.createGain();
                        micGain.gain.value = 1.0;
                        micSource.connect(micGain).connect(audioDestination);
                        console.log("added mic audio");
                      }

                      audioDestination.stream.getAudioTracks().forEach(function(audioTrack) {
                          composedStream.addTrack(audioTrack);
                        });
                    } else {
                      //add just the mic audio
                      micStream.getAudioTracks().forEach(function(micTrack) {
                        composedStream.addTrack(micTrack);
                      });
                    }
                    
                  getStreamSuccess(composedStream);
                  
                  })
                  .catch(function(err) {
                    log("navigator.getUserMedia error: " + err);
                  });
              }
            })
            .catch(function(err) {
              log(err.name + ": " + err.message);
            });
        })
        .catch(function(err) {
          log("navigator.getDisplayMedia error: " + err);
        });
    }
  }
}

function getStreamSuccess(stream) {
  localStream = stream;
  //store stream width and height in global variables
  console.log('called')
  var stage = new createjs.Stage("canvas");
createjs.Ticker.on("tick", tick);

var selection = new createjs.Shape(),
  g = selection.graphics.setStrokeStyle(1).beginStroke("#000").beginFill("rgba(0,0,0,0.05)"),
  sd = g.setStrokeDash([10, 5], 0).command,
  r = g.drawRect(0, 0, 100, 100).command,
  moveListener;

  //stage.on("dblclick", dragStart);
 stage.on("mouseover", dragStart);
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


function dragLoad(event) {
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
  localStream.getTracks().forEach(function(track) {
    if (track.kind == "audio") {
      track.onended = function(event) {
        //log("audio track.onended Audio track.readyState=" + track.readyState + ", track.muted=" + track.muted);
      };
    }
    if (track.kind == "video") {
      console.log(track.kind + ":" + JSON.stringify(track.getSettings()));
      console.log(track.getSettings());
      /*document.getElementById("canvas").height = track.getSettings().height;
      document.getElementById("canvas").width= track.getSettings().width;
      document.getElementById("videoshare").height = track.getSettings().height;
      document.getElementById("videoshare").width= track.getSettings().width;*/

      aspectRatio = track.getSettings().aspectRatio;

      let convertedHeight = WIDTH / aspectRatio;
      document.getElementById("wrapper").style.height = `${convertedHeight}px`;
      document.getElementById("wrapper").style.width= `${WIDTH}px`;


      console.log(`Canvas props changed ${document.getElementById("canvas").height} ${document.getElementById("canvas").width}, Aspect Ratio: ${aspectRatio}`);
      track.onended = function(event) {
      
        //log("video track.onended Audio track.readyState=" + track.readyState + ", track.muted=" + track.muted);
      };
    }
  });

  maxX = localStream.getVideoTracks()[0].getSettings().width;
  maxY = localStream.getVideoTracks()[0].getSettings().height;
  videoElement.srcObject = localStream;
  videoElement.play();
  videoElement.muted = true;
  recBtn.disabled = false;
  shareBtn.disabled = true;

  try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.audioContext = new AudioContext();
  } catch (e) {
    log("Web Audio API not supported.");
  }

  soundMeter = window.soundMeter = new SoundMeter(window.audioContext);
  soundMeter.connectToSource(localStream, function(e) {
    if (e) {
      log(e);
      return;
    }
  });
}

function onBtnRecordClicked() {
  if (localStream == null) {
    alert("Could not get local stream from mic/camera");
  } else {
    recBtn.disabled = true;
    stopBtn.disabled = false;

    /* use the stream */
    log("Video recording in Progress...");
    if (typeof MediaRecorder.isTypeSupported == "function") {
      if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
        var options = { mimeType: "video/webm;codecs=vp9" };
      } else if (MediaRecorder.isTypeSupported("video/webm;codecs=h264")) {
        var options = { mimeType: "video/webm;codecs=h264" };
      } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
        var options = { mimeType: "video/webm;codecs=vp8" };
      }
      //log("Using " + options.mimeType);
      mediaRecorder = new MediaRecorder(localStream, options);
    } else {
      //log("isTypeSupported is not supported, using default codecs for browser");
      mediaRecorder = new MediaRecorder(localStream);
    }

    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
      //console.log("chunks array"+chunks)
    };

    mediaRecorder.onerror = function(e) {
      //log("mediaRecorder.onerror: " + e);
    };

    mediaRecorder.onstart = function() {
      //log("mediaRecorder.onstart, mediaRecorder.state = " + mediaRecorder.state);

      localStream.getTracks().forEach(function(track) {
        if (track.kind == "audio") {
          //log("onstart - Audio track.readyState=" + track.readyState + ", track.muted=" + track.muted);
        }
        if (track.kind == "video") {
          //log("onstart - Video track.readyState=" + track.readyState + ", track.muted=" + track.muted);
        }
      });
    };

    mediaRecorder.onstop = function() {
      //log("mediaRecorder.onstop, mediaRecorder.state = " + mediaRecorder.state);

      blob = new Blob(chunks, { type: "video/webm" });

    };

    mediaRecorder.onwarning = function(e) {
      log("mediaRecorder.onwarning: " + e);
    };

    mediaRecorder.start(10);

    localStream.getTracks().forEach(function(track) {
      console.log(track.kind + ":" + JSON.stringify(track.getSettings()));
      console.log(track.getSettings());

    });
  }
}
function checkCoordinates(){
	coordinates.xEnd = (coordinates.xEnd)?coordinates.xEnd:maxX;
	coordinates.yEnd = (coordinates.yEnd)?coordinates.yEnd:maxY;
	
	if (coordinates.xEnd < coordinates.xStart){
		var temp = coordinates.xEnd;
		coordinates.xEnd = coordinates.xStart;
		coordinates.xStart = temp;
	}
	if (coordinates.yEnd < coordinates.yStart){
		var temp = coordinates.yEnd;
		coordinates.yEnd = coordinates.yStart;
		coordinates.yStart = temp;
	}
	if (coordinates.xEnd - coordinates.xStart < 25){
		coordinates.xStart = 0;
		coordinates.xEnd = maxX;
	}
	if (coordinates.yEnd - coordinates.yStart < 25){
		coordinates.yStart = 0;
		coordinates.yEnd = maxY;
	}
	let xLength = coordinates.xEnd - coordinates.xStart;
	let yLength = coordinates.yEnd - coordinates.yStart;

	if(xLength > yLength){
		coordinates.yEnd = coordinates.yStart + (xLength / aspectRatio);
	} else {
		coordinates.xEnd = coordinates.xStart + (yLength * aspectRatio);
		coordinates.xEnd = (coordinates.xEnd > maxX)?maxX:coordinates.xEnd;
	}

	console.log(`Updated Coordinates: ${JSON.stringify(coordinates, 0,3)}, lengths: ${xLength}, ${yLength}`)
}
 const onUpload = async ()=> {
  var Blob = blob;
  //Blob.filename = Blob.filename + ".mp4";
   //console.log("--------->"+url)
  const data = new FormData
  checkCoordinates();
  console.log(coordinates)
  data.append('file',Blob)
  data.append('crop',JSON.stringify(coordinates))
  displayLoading();
  fetch("users/", {
    //mode: 'no-cors',
    method: "POST",
      body: data

    }).then(async response =>{
	    hideLoading();
	    const resp = await response.json();
	    console.log("response:L" + JSON.stringify(resp));
	    alert("Video Uploaded");
	    log("Download Link: <a href="+window.location.origin+"/"+resp.path+"> Download </a>");
    return response.json()
  })
  .catch(error => console.log(error));
 
}
function onBtnStopClicked() {
  mediaRecorder.stop();
  videoElement.controls = true;
  recBtn.disabled = false;
  stopBtn.disabled = true;
}

// function onStateClicked() {
//   if (mediaRecorder != null && localStream != null && soundMeter != null) {
//     log("mediaRecorder.state=" + mediaRecorder.state);
//     log("mediaRecorder.mimeType=" + mediaRecorder.mimeType);
//     log("mediaRecorder.videoBitsPerSecond=" + mediaRecorder.videoBitsPerSecond);
//     log("mediaRecorder.audioBitsPerSecond=" + mediaRecorder.audioBitsPerSecond);

//     localStream.getTracks().forEach(function(track) {
//       if (track.kind == "audio") {
//         //log("Audio: track.readyState=" + track.readyState + ", track.muted=" + track.muted);
//       }
//       if (track.kind == "video") {
//         //log("Video: track.readyState=" + track.readyState + ", track.muted=" + track.muted);
//       }
//     });

//     log("Audio activity: " + Math.round(soundMeter.instant.toFixed(2) * 100));
//   }
// }

function log(message) {
  dataElement.innerHTML = dataElement.innerHTML + "<br>" + message;
  console.log(message);
}

// Meter class that generates a number correlated to audio volume.
// The meter class itself displays nothing, but it makes the
// instantaneous and time-decaying volumes available for inspection.
// It also reports on the fraction of samples that were at or near
// the top of the measurement range.
function SoundMeter(context) {
  this.context = context;
  this.instant = 0.0;
  this.slow = 0.0;
  this.clip = 0.0;
  this.script = context.createScriptProcessor(2048, 1, 1);
  var that = this;
  this.script.onaudioprocess = function(event) {
    var input = event.inputBuffer.getChannelData(0);
    var i;
    var sum = 0.0;
    var clipcount = 0;
    for (i = 0; i < input.length; ++i) {
      sum += input[i] * input[i];
      if (Math.abs(input[i]) > 0.99) {
        clipcount += 1;
      }
    }
    that.instant = Math.sqrt(sum / input.length);
    that.slow = 0.95 * that.slow + 0.05 * that.instant;
    that.clip = clipcount / input.length;
  };
}

SoundMeter.prototype.connectToSource = function(stream, callback) {
  console.log("SoundMeter connecting");
  try {
    this.mic = this.context.createMediaStreamSource(stream);
    this.mic.connect(this.script);
    // necessary to make sample run, but should not be.
    this.script.connect(this.context.destination);
    if (typeof callback !== "undefined") {
      callback(null);
    }
  } catch (e) {
    console.error(e);
    if (typeof callback !== "undefined") {
      callback(e);
    }
  }
};
SoundMeter.prototype.stop = function() {
  this.mic.disconnect();
  this.script.disconnect();
};
















