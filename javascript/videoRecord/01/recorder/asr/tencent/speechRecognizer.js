import ReconnectingWebSocket from 'reconnecting-websocket';

/**
 * @description: 实时语音识别（Websocket）
 * 文档: https://cloud.tencent.com/document/product/1093/48982
 * Websocket 库: reconnecting-websocket
 * 效果: 采用 websocket 协议，对实时音频流进行识别，同步返回识别结果，达到“边说边出文字”的效果
 * 
 * 流程: 
 *     1. 握手阶段: 前端定义请求 url 部分参数, 发送服务端, 由服务端生成带有 signature 签名的请求url, 拼接 wss:// 前缀, 随后根据请求 url 建立 websocket 连接, 返回 text message，内容为 json 序列化字符串
 *     2. 识别阶段: 发送格式为 16k 采样率的 PCM 音频数据，接收识别结果, 返回 text message，内容为 json 序列化字符串
 * 
 * 结果: json 序列化字符串通过 JSON.parse() 解析后，包含 code、message、voice_id、final、result 等字段
 *     code: 返回码，0表示成功，其他值表示失败
 *     result: 最新语音识别结果
 *          slice_type: 0-一段话开始识别，1-一段话识别中，2-一段话识别结束
 *          voice_text_str: 当前一段话文本结果，编码为 UTF8
 *          start_time: 当前一段话结果在整个音频流中的起始时间
 *          end_time: 当前一段话结果在整个音频流中的结束时间
 *          voice_id: 语音流唯一标识
 *          word_size: 当前一段话的词结果个数
 *          word_list: 当前一段话的词列表
 *     final: 该字段返回1时表示音频流全部识别结束
 */

export default class SpeechRecognizer {
  constructor() {
    this.socket = null;
    // 是否鉴权成功
    this.isSignSuccess = false;
    // 是否一句话开始
    this.isSentenceBegin = false;
    // 当前是否识别结束
    this.isRecognizeComplete = false;
  }

  // 暂停识别，关闭连接
  stop() {
    if (this.socket && this.socket.readyState === 1) {
      this.socket.send(JSON.stringify({ type: 'end' }));
    } else {
      if (this.socket && this.socket.readyState === 1) {
        this.socket.close();
      }
    }
  }

  // 建立websocket链接 data 为用户收集的音频数据
  async start(url) {
    this.socket = new ReconnectingWebSocket(url);

    this.socket.onmessage = e => {
      // 连接建立时触发
      const response = JSON.parse(e.data);
      if (response.code !== 0) {
        this.onError(response.message);
        this.socket.close();
        return;
      } else {
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
          const res = {
            ...response.result,
            voice_id: response.voice_id
          };

          if (response.result.slice_type === 0) {
            this.onRecognitionSentenceBegin(res);
            this.isSentenceBegin = true;
          } else if (response.result.slice_type === 2) {
            if (!this.isSentenceBegin) {
              this.onRecognitionSentenceBegin(res);
            }
            this.onRecognitionSentenceEnd(res);
          } else {
            this.onRecognitionResultChange(res);
          }
        }
      }
    };

    this.socket.onerror = e => {
      // 通信发生错误时触发
      this.socket.close();
      this.onError(e);
    };

    this.socket.onclose = event => {
      if (!this.isRecognizeComplete) {
        this.onError(event);
      }
    };
  }

  // 发送数据
  write(data) {
    if (!this.socket || this.socket.readyState !== 1) {
      return;
    }
    this.socket.send(data);
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

  // 识别失败
  onError(res) {}
}
