const audioCanvas = document.getElementById('audio-canvas');
audioCanvas.width = 110;
audioCanvas.height = 8;
const audioCanvasCtx = audioCanvas.getContext('2d');

const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const audioContext = new AudioContext();
const source = audioContext.createMediaStreamSource(stream);

function getColor(volumePercent) {
  if (volumePercent > 0.9 || volumePercent < 0.3) {
    return '#B80000';
  }
  if (volumePercent > 0.6 || volumePercent < 0.4) {
    return '#FAB400';
  }
  return '#21A564';
}

function drawVolume(volumePercent) {
  audioCanvasCtx.clearRect(0, 0, audioCanvas.width, audioCanvas.height);
  const xEndPos = volumePercent * audioCanvas.width;

  audioCanvasCtx.lineWidth = 20;
  const gradient = audioCanvasCtx.createLinearGradient(0, 0, xEndPos, 0);
  const color = getColor(volumePercent);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.8, `${color}88`);
  gradient.addColorStop(1, `${color}00`);
  audioCanvasCtx.beginPath();
  audioCanvasCtx.moveTo(0, 0);
  audioCanvasCtx.lineTo(xEndPos, 0);
  audioCanvasCtx.strokeStyle = gradient;
  audioCanvasCtx.stroke();
  audioCanvasCtx.closePath();
}

function getRMS(samples) {
  const sum = samples.reduce((acc, curr) => acc + curr * curr, 0);
  return Math.sqrt(sum / samples.length);
}

function rmsToDb(gain) {
  return 20 * Math.log10(gain);
}

function getVolumePercent(dbValue) {
  const minDb = -80;

  if (dbValue < minDb) {
    return 0;
  } else if (dbValue > 1) {
    return 1;
  }

  const volumePercent = (Math.abs(minDb) - Math.abs(dbValue)) / Math.abs(minDb);
  return volumePercent;
}

async function audioRecorder() {
  const scriptProcessor = audioContext.createScriptProcessor(1024, 1, 1);
  source.connect(scriptProcessor);
  scriptProcessor.connect(audioContext.destination);

  scriptProcessor.onaudioprocess = event => {
    const samples = event.inputBuffer.getChannelData(0);
    const rms = getRMS(samples);
    const db = rmsToDb(rms);
    const volumePercent = getVolumePercent(db);
    drawVolume(volumePercent);
  };
}

audioRecorder();
