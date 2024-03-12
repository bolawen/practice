const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
canvas.width = 640;
canvas.height = 480;
const recordedBlobs = [];
const startRecordEl = document.getElementById("start-record");
const stopRecordEl = document.getElementById("stop-record");

let audioStream = null;
let cameraStream = null;
let mediaRecorder = null;
let displayStream = null;
let synthesisStream = null;
const displayVideo = document.createElement("video");
const cameraVideo = document.createElement("video");

function download(blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = "recording.webm";
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
}

const getPixelRatio = (context) => {
  const backingStore =
    context.backingStorePixelRatio ||
    context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    context.backingStorePixelRatio ||
    1;
  return (window.devicePixelRatio || 1) / backingStore;
};

function synthesis() {
  const ratio = getPixelRatio(context);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.mozImageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;
  context.msImageSmoothingEnabled = false;
  context.imageSmoothingEnabled = false;
  canvas.width = canvas.width * ratio;
  canvas.height = canvas.height * ratio;
  context.drawImage(displayVideo, 0, 0, canvas.width, canvas.height);
  context.save();
  context.translate(canvas.width, 0);
  context.scale(-1, 1);
  context.drawImage(cameraVideo, 0, 0, 160, 120);
  context.restore();
  requestAnimationFrame(synthesis);
}

function startRecord() {
  const timeSlice = 5000;
  mediaRecorder.start(timeSlice);
}

async function stopRecord() {
  mediaRecorder.stop();
  displayStream.getTracks().forEach((track) => track.stop());
  cameraStream.getTracks().forEach((track) => track.stop());
}

async function prepareRecord() {
  displayStream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
  });
  displayVideo.srcObject = displayStream;

  cameraStream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });
  cameraVideo.srcObject = cameraStream;

  audioStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });

  await displayVideo.play();
  await cameraVideo.play();
  synthesis();
  synthesisStream = canvas.captureStream(30);
  audioStream
    .getAudioTracks()
    .forEach((audioTrack) => synthesisStream.addTrack(audioTrack));

  mediaRecorder = new MediaRecorder(synthesisStream, {
    mimeType: "video/webm",
  });
  mediaRecorder.ondataavailable = (e) => recordedBlobs.push(e.data);
  mediaRecorder.onstop = () => {
    const completeBlob = new Blob(recordedBlobs, { type: "video/webm" });
    download(completeBlob);
  };
}

async function checkPermissions(name) {
  try {
    return await navigator.permissions.query({ name: name });
  } catch (error) {
    return false;
  }
}

async function run() {
  const camera = await checkPermissions("camera");
  const microphone = await checkPermissions("microphone");
  if (camera.state === "granted" && microphone.state === "granted") {
    await prepareRecord();
    startRecordEl.addEventListener("click", startRecord);
    stopRecordEl.addEventListener("click", stopRecord);
  } else {
    alert("请允许使用摄像头和麦克风");
  }
}

run();
