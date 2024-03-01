import Processor from './processor/index.js';
import Recognizer from './recognizer/index.js';

let recognizer = null;
let recordStatus = 'init';
let mediaRecorder = null;
const recordedBlobs = [];
const audio = document.getElementById('audio');
const startRecordEl = document.getElementById('start-record');
const stopRecordEl = document.getElementById('stop-record');
const asrResultContainerEl = document.querySelector('.asr-result-container');

function startRecord() {
  recordStatus = 'recording';
  const timeSlice = 5000;
  mediaRecorder.start(timeSlice);

  recognizer.start(
    'wss://asr.cloud.tencent.com/asr/v2/1303248253?convert_num_mode=1&engine_model_type=16k_zh&expired=1708686737&filter_dirty=1&filter_modal=2&filter_punc=0&hotword_id=08003a00000000000000000000000000&needvad=1&nonce=17086831&secretid=AKIDdCU1KGl1nKXquwnI8j7H4dw0pulN2KRg&t=1708683136899&timestamp=1708683137&vad_silence_time=800&voice_format=1&voice_id=f2c37564-1213-43f5-b84a-2ed8de3f7484&word_info=2&signature=LyHqzm9TWuxU9DcK6cKGxxApVHM%3D'
  );
}

async function stopRecord() {
  recordStatus = 'stopped';
  mediaRecorder.stop();
  const audioBlob = new Blob(recordedBlobs);
  const audioUrl = URL.createObjectURL(audioBlob);
  audio.src = audioUrl;
}

function processRecord(data) {
  if (recordStatus !== 'recording') {
    return;
  }

  const { buffer } = data;
  recognizer.send(buffer);
}

function recognitionResultChange(data) {
  asrResultContainerEl.innerHTML = data;
}

async function prepareRecord() {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true
  });

  recognizer = new Recognizer({
    onRecognitionResultChange: recognitionResultChange
  });

  new Processor({ stream, processRecord });
  mediaRecorder = new MediaRecorder(stream);

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

async function run() {
  const microphone = await checkPermissions('microphone');
  if (microphone.state === 'granted') {
    prepareRecord();
    startRecordEl.addEventListener('click', startRecord);
    stopRecordEl.addEventListener('click', stopRecord);
  } else {
    alert('请允许使用麦克风');
  }
}

run();
