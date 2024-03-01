import { rmsToDb, to16BitPCM, getVolumeShownPercent } from './util';

const defaultOptions = {
  bufferSize: 0,
  numberOfInputChannels: 1,
  numberOfOutputChannels: 1,
  useBuiltin16BitTransformer: true,
  dbToVolumeTransformer: getVolumeShownPercent
};

export default class MediaSoundMeter {
  constructor(audioContext, options) {
    this.audioContext = audioContext;
    this.options = { ...defaultOptions, ...options };

    // 创建一个音频分析对象，采样的缓冲区大小为自适应（一般自适应为1K），输入和输出都是单声道
    this.scriptProcessor = this.audioContext.createScriptProcessor(
      this.options.bufferSize,
      this.options.numberOfInputChannels,
      this.options.numberOfOutputChannels
    );

    // TODO: 应判断浏览器对Audio Worklet是否支持
    //   1. 不支持的情况使用ScriptProcessorNode
    //   2. 支持的情况下使用Audio Worklet
    this.scriptProcessor.onaudioprocess = this.onAudioProcess;
  }

  onAudioProcess = evt => {
    const inputData = evt.inputBuffer.getChannelData(0);
    const sum = inputData.reduce((acc, curr) => acc + curr * curr, 0);
    const rms = Math.sqrt(sum / inputData.length);
    const db = rmsToDb(rms);
    const volume = this.options.dbToVolumeTransformer(db);

    const audioData = this.options.useBuiltin16BitTransformer
      ? to16BitPCM(inputData)
      : inputData;

    if (this.callback && this.audioSourceNode) {
      this.callback({ rms, db, volume, buffer: audioData });
    }
  };

  connectToSource(stream, callback) {
    this.audioSourceNode = this.audioContext.createMediaStreamSource(stream);
    this.audioSourceNode.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.audioContext.destination);
    this.callback = callback;
  }

  stop() {
    this.audioContext && this.audioContext.suspend();
    this.scriptProcessor.disconnect();

    if (this.audioSourceNode) {
      this.audioSourceNode.disconnect();
      this.audioSourceNode = null;
      this.callback = null;
    }
  }
}
