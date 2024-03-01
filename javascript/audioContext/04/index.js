const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const audioContext = new AudioContext();
const source = audioContext.createMediaStreamSource(stream);

async function audioRecorder() {
  await audioContext.audioWorklet.addModule('volumeProcessor.js');
  const volumeNode = new AudioWorkletNode(audioContext, 'volume-processor');
  source.connect(volumeNode).connect(audioContext.destination);

  volumeNode.port.onmessage = event => {
    const {
      data: { audioBuffer }
    } = event;
    console.log('audioBuffer', audioBuffer);
  };
}

audioRecorder();
