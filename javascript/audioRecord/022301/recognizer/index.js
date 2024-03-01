export default class Recognizer {
  constructor(options) {
    this.socket = null;
    this.options = options;

    // 是否鉴权成功
    this.isSignSuccess = false;
    // 是否一句话开始
    this.isSentenceBegin = false;
    // 当前是否识别结束
    this.isRecognizeComplete = false;
  }

  async start(url) {
    this.socket = new WebSocket(url);

    this.socket.onmessage = e => {
      const response = JSON.parse(e.data);

      if (response.code !== 0) {
        console.log('Recognizer start error: ', response.message);
        this.socket.close();
        return;
      }

      if (!this.isSignSuccess) {
        this.onRecognitionStart(response);
        this.isSignSuccess = true;
      }

      if (response.final === 1) {
        this.isRecognizeComplete = true;
        this.onRecognitionComplete(response);
        return;
      }

      if (response.result) {
        const result = {
          ...response.result,
          voice_id: response.voice_id
        };

        if (response.result.slice_type === 0) {
          this.onRecognitionSentenceBegin(result);
          this.isSentenceBegin = true;
        } else if (response.result.slice_type === 2) {
          if (!this.isSentenceBegin) {
            this.onRecognitionSentenceBegin(result);
          }
          this.onRecognitionSentenceEnd(result);
        } else {
          this.onRecognitionResultChange(result);
        }
      }
    };

    this.socket.onerror = e => {
      this.socket.close();
      this.onError(e);
    };

    this.socket.onclose = event => {
      if (!this.isRecognizeComplete) {
        this.onError(event);
      }
    };
  }

  send(data) {
    if (!this.socket || this.socket.readyState !== 1) {
      return;
    }
    this.socket.send(data);
  }

  // 识别失败
  onError(error) {
    console.log('onError error', error);
  }

  // 开始识别的时候
  onRecognitionStart(result) {
    console.log('onRecognitionStart result', result);
  }

  // 一句话开始的时候
  onRecognitionSentenceBegin(result) {
    console.log('onRecognitionSentenceBegin res', result);
  }

  // 识别结果发生变化的时候
  onRecognitionResultChange(result) {
    const { voice_text_str } = result;
    this.options.onRecognitionResultChange?.(voice_text_str);
  }

  // 一句话结束的时候
  onRecognitionSentenceEnd(res) {
    console.log('onRecognitionSentenceEnd res', res);
  }

  // 识别结束的时候
  onRecognitionComplete(response) {
    console.log('onRecognitionComplete response', response);
  }
}
