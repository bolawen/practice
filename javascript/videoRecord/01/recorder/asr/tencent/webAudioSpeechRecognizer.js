import SpeechRecognizer from "./speechRecognizer";

export default class WebAudioSpeechRecognizer {
  constructor() {
    this.speechRecognizer = new SpeechRecognizer();
    this.isCanSendData = false;
  }

  sendData(data) {
    this.speechRecognizer.write(data);
  }

  start(url) {
    if (!this.speechRecognizer) {
      this.speechRecognizer = new SpeechRecognizer();
    }

    // 开始识别
    this.speechRecognizer.onRecognitionStart = res => {
      this.onRecognitionStart(res);
      this.isCanSendData = true;
    };
    // 一句话开始
    this.speechRecognizer.onRecognitionSentenceBegin = res => {
      this.onRecognitionSentenceBegin(res);
    };
    // 识别变化时
    this.speechRecognizer.onRecognitionResultChange = res => {
      this.onRecognitionResultChange(res);
    };
    // 一句话结束
    this.speechRecognizer.onRecognitionSentenceEnd = res => {
      this.onRecognitionSentenceEnd(res);
    };
    // 识别结束
    this.speechRecognizer.onRecognitionComplete = res => {
      this.onRecognitionComplete(res);
      this.isCanSendData = false;
    };
    // 识别错误
    this.speechRecognizer.onError = res => {
      this.isCanSendData = false;
    };

    // 建立连接
    this.speechRecognizer.start(url);
  }

  stop() {
    if (this.speechRecognizer) {
      this.speechRecognizer.stop();
    }
  }

  // 开始识别的时候
  onRecognitionStart(res) {}

  // 一句话开始的时候
  onRecognitionSentenceBegin(res) {}

  // 识别结果发生变化的时候
  onRecognitionResultChange(res) {}

  // 一句话结束的时候
  onRecognitionSentenceEnd(res) {}

  // 识别结束的时候
  onRecognitionComplete(res) {}
}
