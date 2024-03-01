function isSupportAudioWorklet(audioContext) {
  return (
    audioContext.audioWorklet &&
    typeof audioContext.audioWorklet.addModule === 'function' &&
    typeof AudioWorkletNode !== 'undefined'
  );
}

function isSupportCreateScriptProcessor(audioContext) {
  return typeof audioContext.createScriptProcessor === 'function';
}

function to16kHz(audioData, sampleRate = 44100) {
  const data = new Float32Array(audioData);
  const fitCount = Math.round(data.length * (16000 / sampleRate));
  const newData = new Float32Array(fitCount);
  const springFactor = (data.length - 1) / (fitCount - 1);
  newData[0] = data[0];
  for (let i = 1; i < fitCount - 1; i++) {
    const tmp = i * springFactor;
    const before = Math.floor(tmp).toFixed();
    const after = Math.ceil(tmp).toFixed();
    const atPoint = tmp - before;
    newData[i] = data[before] + (data[after] - data[before]) * atPoint;
  }
  newData[fitCount - 1] = data[data.length - 1];
  return newData;
}

function to16BitPCM(input) {
  const dataLength = input.length * (16 / 8);
  const dataBuffer = new ArrayBuffer(dataLength);
  const dataView = new DataView(dataBuffer);
  let offset = 0;
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    dataView.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return dataView;
}

export default class Processor {
  constructor(options) {
    const { stream } = options;

    this.options = options;
    this.audioContext = new AudioContext();
    this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);

    this.init();
  }

  init() {
    if (isSupportAudioWorklet(this.audioContext)) {
      this.audioWorkletNodeDealAudioData();
    } else {
      this.scriptNodeDealAudioData();
    }
  }

  scriptNodeDealAudioData() {
    if (!isSupportCreateScriptProcessor(this.audioContext)) {
      return;
    }

    try {
      const scriptProcessor = this.audioContext.createScriptProcessor(
        1024,
        1,
        1
      );
      this.mediaStreamSource.connect(scriptProcessor);
      scriptProcessor.connect(this.audioContext.destination);

      scriptProcessor.onaudioprocess = event => {
        const samples = event.inputBuffer.getChannelData(0);
        const output = to16kHz(samples);
        const audioBuffer = to16BitPCM(output);

        const data = {
          buffer: audioBuffer
        };

        this.options.processRecord?.(data);
      };

    } catch (e) {
      console.log('scriptNodeDealAudioData 错误原因:', e);
    }
  }

  async audioWorkletNodeDealAudioData() {
    if (!isSupportAudioWorklet(this.audioContext)) {
      return;
    }

    try {
      await this.audioContext.audioWorklet.addModule('http://127.0.0.1:5502/test/javascript/audioRecord/022301/processor/custom-processor.js');

      const customNode = new AudioWorkletNode(
        this.audioContext,
        'custom-processor'
      );

      this.mediaStreamSource
        .connect(customNode)
        .connect(this.audioContext.destination);

      customNode.port.onmessage = event => {
        const { audioBuffer } = event.data;
        const data = {
          buffer: audioBuffer
        };

        this.options.processRecord?.(data);
      };
    } catch (e) {
      console.log('audioWorkletNodeDealAudioData 错误原因:', e);
    }
  }
}
