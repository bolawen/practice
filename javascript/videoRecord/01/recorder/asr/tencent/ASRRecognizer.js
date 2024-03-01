import WebAudioSpeechRecognizer from './webAudioSpeechRecognizer';

export class ASRRecognizer {
  constructor(options) {
    const { asrUrl } = options;

    this.asrUrl = asrUrl;
    this.totalSentences = [];
    this.asrInstance = new WebAudioSpeechRecognizer();

    // 开始识别
    this.asrInstance.onRecognitionStart = this.onRecognitionStart;
    // 一句话开始
    this.asrInstance.onRecognitionSentenceBegin =
      this.onRecognitionSentenceBegin;
    // 识别变化时
    this.asrInstance.onRecognitionResultChange = this.onRecognitionResultChange;
    // 一句话结束
    this.asrInstance.onRecognitionSentenceEnd = this.onRecognitionSentenceEnd;
    // 识别结束
    this.asrInstance.onRecognitionComplete = this.onRecognitionComplete;
  }

  start = async () => {
    if (!this.asrUrl) {
      return;
    }

    this.asrInstance.start(this.asrUrl);
  };

  stop() {
    if (this.asrInstance) {
      this.asrInstance.stop();
    }
  }

  clearAuthUrl() {
    this.authUrl = '';
  }

  setAuthUrl(authUrl) {
    this.authUrl = authUrl;
  }

  // 开始识别
  onRecognitionStart = res => {};

  // 一句话开始
  onRecognitionSentenceBegin = res => {};

  // 识别变化时
  onRecognitionResultChange = res => {
    const currentText = res.voice_text_str;
    if (this.onASRResultChangeHandler) {
      this.onASRResultChangeHandler(currentText);
    }
  };

  // 一句话结束
  onRecognitionSentenceEnd = res => {
    this.totalSentences.push(res);
  };

  // 识别结束
  onRecognitionComplete = res => {
    if (this.onASRResultCompleteHandler) {
      this.onASRResultCompleteHandler(this.totalSentences);
    }
  };

  // 设置一句话识别的传出回调
  setOnRecognitionResultChangeHandler = handler => {
    this.onASRResultChangeHandler = handler;
  };

  // 设置整句话识别结束的传出回调
  setOnRecognitionCompleteHandler = handler => {
    this.onASRResultCompleteHandler = handler;
  };

  sendAudioPCM(data) {
    this.asrInstance.sendData(data);
  }
}
