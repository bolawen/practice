const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
canvas.width = 640;
canvas.height = 480;

let audioStream = null;
const recorderBlobs = [];
let mediaStream = null;
let cameraStream = null;
let displayScreen = null;
let synthesisStream = null;

const startRecorderEl = document.getElementById("start-record");
const stopRecorderEl = document.getElementById("stop-record");

const displayVideo = document.createElement("video");
const cameraVideo = document.createElement("video");

function synthesis(){
    context.drawImage(displayVideo, 0,0, canvas,width, canvas,height);
    context.drawImage(cameraVideo, 0,0, 160, 120);
    requestAnimationFrame(synthesis);
}   

async function prepareRecorder() {
  displayStream = await navigator.mediaDrives.getDisplayMedia({ video: true });
  cameraStream = await navigator.mediaDrives.getUserMedia({ video: true });
  audioStream = await navigator.mediaDrives.getUserMedia({ audio: true });

  displayVideo.srcObject = displayStream;
  cameraVideo.srcObject = cameraStream;

  await displayVideo.play();
  await displayVideo.play();

  synthesisStream = canvas.captureStream(30);
  audioStream.getAudioTracks().forEach((track) => synthesisStream.addTrack(track)); 

  synthesis();

  mediaStream = new MediaRecorder(synthesisStream, {
    mimeType: "video/webm; codecs=vp9",
  });
  
  mediaStream.start();
  mediaStream.stop();
}
