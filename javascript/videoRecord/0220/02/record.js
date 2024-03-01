import { drawFaceCanvas } from './draw.js';
import { calculate } from './calculate.js';

let recordStatus = 'init';
let worker = null;
let mediaRecorder = null;
const recordedBlobs = [];
const predictResult = [];
let recordDurationInMs = 0;
let startRecordTimestamp = 0;
const video = document.getElementById('video');
const startRecordEl = document.getElementById('start-record');
const stopRecordEl = document.getElementById('stop-record');

const captureCanvas = document.getElementById('capture-canvas');
const captureContext = captureCanvas.getContext('2d');
const faceCanvas = document.getElementById('face-canvas');
const faceContext = faceCanvas.getContext('2d');

function makeId(length) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function getImageDataFromVideoElement({
  context,
  videoSize,
  videoElement,
  imageDataSize
}) {
  context.clearRect(0, 0, imageDataSize, imageDataSize);
  context.save();
  context.translate(imageDataSize, 0);
  context.scale(-1, 1);
  context.drawImage(
    videoElement,
    0,
    0,
    videoSize.width,
    videoSize.height,
    0,
    0,
    imageDataSize,
    (imageDataSize * videoSize.height) / videoSize.width
  );
  context.restore();
  const imageData = context.getImageData(0, 0, imageDataSize, imageDataSize);
  const imageDataBuffer = imageData.data.buffer;
  const imageWidth = imageData.width;
  const imageHeight = imageData.height;

  return {
    id: makeId(4),
    buffer: imageDataBuffer,
    width: imageWidth,
    height: imageHeight
  };
}

function captureFrame() {
  const imageData = getImageDataFromVideoElement({
    imageDataSize: 320,
    videoElement: video,
    context: captureContext,
    videoSize: { width: 640, height: 480 }
  });
  worker.postMessage(
    {
      id: imageData.id,
      buffer: imageData.buffer,
      width: imageData.width,
      height: imageData.height
    },
    [imageData.buffer]
  );
}

function startRecord() {
  recordStatus = 'recording';
  const timeSlice = 5000;
  mediaRecorder.start(timeSlice);
  startRecordTimestamp = Date.now();
  captureFrame();
}

async function stopRecord() {
  recordStatus = 'stopped';
  const stream = video.srcObject;
  const tracks = stream.getTracks();
  recordDurationInMs = Date.now() - startRecordTimestamp;

  tracks.forEach(track => {
    track.stop();
  });

  video.srcObject = null;
  mediaRecorder.stop();

  const calcParams = {
    predictResult,
    config: {
      smilePassLine: 0.6,
      smileThreshold: 0.4,
    },
    recordSeconds: recordDurationInMs / 1000,
  };

  const aiResult = calculate(calcParams);
  console.log('aiResult', aiResult);
}

async function prepareRecord() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  video.srcObject = stream;
  video.play();

  mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm'
  });

  mediaRecorder.ondataavailable = event => {
    if (event.data && event.data.size > 0) {
      recordedBlobs.push(event.data);
    }
  };
}

async function checkPermissions(name) {
  try {
    return await navigator.permissions.query({ name: name });
  } catch (error) {
    return false;
  }
}

function prepareWorker() {
  worker = new Worker('./worker/worker.js');
}

async function run() {
  const camera = await checkPermissions('camera');
  const microphone = await checkPermissions('microphone');
  if (camera.state === 'granted' && microphone.state === 'granted') {
    prepareRecord();
    prepareWorker();
    startRecordEl.addEventListener('click', startRecord);
    stopRecordEl.addEventListener('click', stopRecord);
    worker.addEventListener('message', event => {
      if (recordStatus === 'recording') {
        const { data } = event;
        const { output, id } = data || {};

        drawFaceCanvas(
          faceContext,
          output,
          faceCanvas.width,
          faceCanvas.height
        );

        predictResult.push({
          ...output,
          faces: output.faces.map(faceItem => ({
            ...faceItem,
            mouthPos: undefined,
            facePos: undefined
          }))
        });

        captureFrame();
      }
    });
  } else {
    alert('请允许使用摄像头和麦克风');
  }
}

run();
