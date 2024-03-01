import { formatTime } from './util';
import MediaRecorder from './mediaRecorder';
import RecordBtn from './components/recordBtn';
import MediaSoundMeter from './mediaSoundMeter';
import template1 from './template/template1.html';
import VideoCanvas from './components/videoCanvas';
import FacePredictWorker from './facePredictWorker';
import { calculateAIScore } from './calculateScore';
import LayerVisibleIcons from './components/layerVisibleIcons';
import { ASRRecognizer as TencentASRRecognizer } from './asr/tencent/ASRRecognizer';

let _recorder = null;
const components = {};
const componentEle = {};

const defaultOptions = {
  isAIOn: true, // 是否开启AI
  isVoiceOn: true, // 是否开启语音音量
  container: '', // 容器 string | HTMLElement
  isDisplayAsrText: true, // 是否显示语音识别的文字

  video: {
    width: 640,
    height: 480,
    frameRate: 30,
    deviceId: 'default'
  },
  audio: {
    sampleSize: 16,
    sampleRate: 16000,
    deviceId: 'default'
  },
  countDownSeconds: 5,
  previewImageSize: 3, // 截取的用户微笑帧数量
  preview: { width: 640, height: 360 }, // 截取的用户微笑帧宽高
  recordingMode: 'half-mode', // half-mode, full-mode  录制模式，全身模式或者半身模式
  emitChunkUnitSize: '1MB', // 录制过程中抛出分片数据的大小，默认为1MB
  aiScoreSetting: {
    smileThreshold: 0.4,
    volumeThreshold: 0.2,
    smilePassLine: 0.6
  },

  keywords: [],
  tooltipText: {
    ai: 'AI视图',
    shape: '参考线'
  },
  horizontalLineHintText: '平行于参考线拍摄',

  onMediaError: null, // 媒体设备错误回调
  onRecordStart: null, // 录制开始回调
  onRecordStop: null, // 录制结束回调
  onCountdownStart: null, // 倒计时开始回调
  onRecorderStatusChange: null, // 录制状态变化回调
  onRecorderChunkDataChange: null, // 录制过程中分片数据变化回调

  tencentASRUrl:
    'wss://asr.cloud.tencent.com/asr/v2/1303248253?convert_num_mode=1&engine_model_type=16k_zh&expired=1708419783&filter_dirty=1&filter_modal=2&filter_punc=0&hotword_id=08003a00000000000000000000000000&needvad=1&nonce=17084162&secretid=AKIDdCU1KGl1nKXquwnI8j7H4dw0pulN2KRg&t=1708416182863&timestamp=1708416183&vad_silence_time=800&voice_format=1&voice_id=44452ed1-ccce-4ce0-a864-78d6b1efbcc6&word_info=2&signature=ZmyvIl2RSRCpSwDbw7ivwJlBRuA%3D'
};

export default class Recorder {
  static register(name, component) {
    components[name] = component;
  }

  static createRecorder(options) {
    if (_recorder) {
      _recorder = null;
    }
    _recorder = new Recorder(options);
    return _recorder;
  }

  constructor(options) {
    this.options = { ...defaultOptions, ...options };

    this.worker = null;

    this.recordSeconds = 0;
    this.showAiLayer = true;
    this.isRecording = false;
    this.recordStatus = 'init'; // init, starting, recording, stopping, stopped
    this.miniRecordingSeconds = 2;
    this.isShowBodyShapeLayer = true;

    this.soundMeter = null;
    this.mediaStream = null;
    this.mediaRecorder = null;
    this.tencentASRRecognizer = null; // 腾讯云语音识别 ASR , 将语音转化成文字

    this.tempFaceList = []; // 存储视频预览数据的对象
    this.previewImageBlobs = []; // 存储笑脸数据的数组
    this.aiPredictResult = []; // ai人脸识别的物料，用于计算sight、smile、gesture
    this.soundMeterResult = []; // 声音音量基础语料，用于计算volume

    this.onRecordStartCallbacks = [];
    this.onRecordProcessCallbacks = [];
    this.onRecordStopCallbacks = [];
    this.onVolumeChangeCallback = null;

    this.setup();
  }

  async setup() {
    this.setupPredictWorker();
    this.setupASRInstance();
    await this.setupMediaRecorder();
    this.setupSoundMeter();
  }

  initUI() {
    const container = document.querySelector(this.options.container);
    const fragment = document.createDocumentFragment();
    const div = fragment.appendChild(document.createElement('div'));
    div.className = 'video-recorder';
    div.innerHTML = template1;
    if (container) {
      container && container.appendChild(div);
    }

    this.initCustomUI();
  }

  initCustomUI() {
    Recorder.register('layerVisibleIcons', LayerVisibleIcons);
    Recorder.register('videoCanvas', VideoCanvas);
    Recorder.register('recordBtn', RecordBtn);

    Object.keys(components).forEach(key => {
      componentEle[key] = new components[key](this);
      componentEle[key].init();
    });
  }

  setupSoundMeter() {
    const audioContext = this.mediaRecorder.createAudioContext();
    this.soundMeter = new MediaSoundMeter(audioContext, {
      useBuiltin16BitTransformer: this.options.isVoiceOn
    });

    this.soundMeter.connectToSource(this.mediaStream, this.onSoundMeterMessage);
  }

  setupPredictWorker() {
    if (!this.options.workerUrl) {
      return;
    }
    this.worker = new FacePredictWorker(this.options.workerUrl);
    this.worker.addPredictWorkerMessageHandler(this.onAIFacePredicted);
  }

  async setupMediaRecorder() {
    this.onMediaError = this.onMediaError.bind(this);
    this.onRecorderStatusChange = this.onRecorderStatusChange.bind(this);
    this.onRecorderChunkDataChange = this.onRecorderChunkDataChange.bind(this);

    if (this.options.mediaRecorder) {
      this.mediaRecorder = this.options.mediaRecorder;
    } else {
      if (!this.options.video || !this.options.audio) {
        throw Error('video or audio must be specified');
      }
      const options = this.setupMediaRecorderOptions();
      this.mediaRecorder = new MediaRecorder(options);
    }

    this.mediaRecorder.configCallbacks({
      onMediaError: this.onMediaError,
      onRecorderStatusChange: this.onRecorderStatusChange,
      onRecorderChunkChange: this.onRecorderChunkDataChange,
      onRecorderStop: this.onRecorderStop,
      onRecorderStart: this.onRecorderStart
    });

    await this.mediaRecorder.requestUserMedia();
    this.mediaStream = this.mediaRecorder.getMediaStream();
    this.initUI();
  }

  setupMediaRecorderOptions() {
    const audioConstraints = {
      deviceId: this.options.audio.deviceId
    };
    const videoConstraints = {
      width: { ideal: this.options.video.width },
      height: { ideal: this.options.video.height },
      deviceId: this.options.video.deviceId
    };
    if (this.options.video.frameRate) {
      videoConstraints.frameRate = this.options.video.frameRate;
    }
    if (this.options.audio.sampleSize) {
      audioConstraints.sampleSize = this.options.audio.sampleSize;
    }
    if (this.options.audio.sampleRate) {
      audioConstraints.sampleRate = this.options.audio.sampleRate;
    }
    const mediaRecorderOptions = {};
    if (this.options.audioBitrateMode) {
      mediaRecorderOptions.audioBitrateMode = this.options.audioBitrateMode;
    }
    if (this.options.audioBitsPerSecond) {
      mediaRecorderOptions.audioBitsPerSecond = this.options.audioBitsPerSecond;
    }
    if (this.options.videoBitsPerSecond) {
      mediaRecorderOptions.videoBitsPerSecond = this.options.videoBitsPerSecond;
    }
    if (this.options.mimeType) {
      mediaRecorderOptions.mimeType = this.options.mimeType;
    }
    const recorderOptions = {
      mediaRecorderOptions,
      emitChunkUnitSize: this.options.emitChunkUnitSize,
      mediaStreamConstraints: {
        audio: audioConstraints,
        video: videoConstraints
      }
    };

    return recorderOptions;
  }

  setupASRInstance() {
    this.tencentASRRecognizer = new TencentASRRecognizer({
      asrUrl: this.options.tencentASRUrl
    });
    this.tencentASRRecognizer.setOnRecognitionCompleteHandler(
      this.onRecognitionCompleteHandler
    );
  }

  onSoundMeterMessage = params => {
    if (this.recordStatus === 'recording' || this.recordStatus === 'starting') {
      this.soundMeterResult.push(params.volume);
      if (this.options.isVoiceOn && params.buffer) {
        this.sendAudioPCM2ASRRecognizer(params.buffer);
      }
    }
    if (this.onVolumeChangeCallback) {
      this.onVolumeChangeCallback(params.volume);
    }
  };

  sendAudioPCM2ASRRecognizer(data) {
    if (data instanceof Float32Array) {
      console.error(
        'sendAudioPCM2ASRRecognizer: data is Float32Array, please use DataView'
      );
      return;
    }

    this.tencentASRRecognizer.sendAudioPCM(data);
  }

  setOnVolumeChangeCallback = handler => {
    this.onVolumeChangeCallback = handler;
  };

  onMediaError(error) {
    if (this.options.onMediaError) {
      this.options.onMediaError(error);
    }
  }

  toggleShapeLayerVisible() {
    this.showShapeLayer = !this.showShapeLayer;
  }

  onRecorderStatusChange(status) {
    if (this.options.onRecorderStatusChange) {
      this.options.onRecorderStatusChange(status);
    }
  }

  onRecorderChunkDataChange = (currentIndex, currentChunk) => {
    this.options.onRecorderChunkDataChange(currentIndex, currentChunk);
  };

  startRecord = async () => {
    if (this.recordStatus !== 'init') {
      return;
    }

    this.startRecordTimestamp = Date.now();

    this.recordStatus = 'starting';

    // 开启视频/语音录制
    this.mediaRecorder.startRecord();
    this.onRecordStartCallbacks.forEach(cb => cb());

    // 开启语音音量和ASR转换监听
    if (this.options.isVoiceOn) {
      await this.tencentASRRecognizer.start();
    }

    // 计时器，记录录制时长
    this.recordTimer = setInterval(() => {
      this.recordSeconds += 1;

      const time = formatTime(this.recordSeconds);
      let text = `${time.hours}:${time.minutes}:${time.seconds}`;
      if (parseInt(time.hours, 10) === 0) {
        text = `${time.minutes}:${time.seconds}`;
      }
      this.onRecordProcessCallbacks.forEach(cb => cb(text));
    }, 1 * 1000);

    if (this.options.onRecordStart) {
      this.options.onRecordStart({
        message: 'start_succeed'
      });
    }
    this.recordStatus = 'recording';
  };

  stopRecord() {
    if (this.recordStatus !== 'recording') {
      return;
    }

    this.recordDurationInMs = Date.now() - this.startRecordTimestamp;

    this.recordStatus = 'stopping';

    clearInterval(this.recordTimer);

    if (this.options.isAIOn || this.options.isShowBodyShapeLayer) {
      this.soundMeter.stop();
    }

    if (this.options.isVoiceOn) {
      this.tencentASRRecognizer.stop();
    }

    this.mediaRecorder.stopRecord();
    this.onRecordStopCallbacks.forEach(cb => cb());
  }

  sendResultToCaller(aiResult, asrSentences) {
    this.recordStatus = 'stopped';

    const result = {
      aiResult,
      asrSentences,
      mediaBlobUrl: this.mediaRecorder.mediaBlobUrl,
      duration: this.recordDurationInMs / 1000,
      previewImageData: this.previewImageBlobs.splice(
        0,
        this.options.previewImageSize
      )
    };

    this.options.onRecordStop(result);
  }

  getMediaStream() {
    return this.mediaStream;
  }

  destroy() {
    Object.keys(componentEle).forEach(key => {
      const component = componentEle[key];
      if (component.unBindEvent) {
        component.unBindEvent();
      }
    });
  }

  setOnRecognitionResultChangeHandler = handler => {
    this.tencentASRRecognizer.setOnRecognitionResultChangeHandler(handler);
  };

  setPredictWorkerMessageHandler = handler => {
    this.worker.addPredictWorkerMessageHandler(handler);
  };

  toggleRecord = () => {
    this.isRecording = !this.isRecording;
    return true;
  };

  predictAIFaceWithData(predictData, previewData) {
    this.tempFaceList.push({ ...previewData, smileRate: 0 });
    this.worker.predictFaceWithData(predictData);
  }

  toggleAiLayerVisible() {
    this.showAiLayer = !this.showAiLayer;
  }

  onRecorderStart = () => {};

  onRecorderStop = () => {
    // 如果未开启AI评分且未开启语音转文字功能，回调数据不包括aiResult和asrResult
    if (!this.options.isAIOn && !this.options.isAIVoiceOn) {
      this.sendResultToCaller()
      return
    }

    // 如果未开启语音转文字功能，回调数据不包括asrResult
    if (!this.options.isAIVoiceOn) {
      const aiResult = calculateAIScore({
        recordSeconds: this.recordDurationInMs / 1000,
        aiPredictResult: this.aiPredictResult,
        soundVolumes: this.soundMeterResult,
        config: this.options.aiScoreSetting,
      })
      this.sendResultToCaller(aiResult)
    }
  };

  onRecognitionCompleteHandler = totalSentences => {
    const calcParams = {
      recordSeconds: this.recordDurationInMs / 1000,
      aiPredictResult: this.aiPredictResult,
      soundVolumes: this.soundMeterResult,
      config: this.options.aiScoreSetting,
      googleASR: undefined,
      totalSentences: undefined
    };

    calcParams.totalSentences = totalSentences;
    const aiResult = calculateAIScore(calcParams);
    this.sendResultToCaller(aiResult, totalSentences);
  };

  onAIFacePredicted = aiInputSlice => {
    if (
      this.recordStatus === 'init' ||
      this.recordStatus === 'stopping' ||
      this.recordStatus === 'stopped'
    ) {
      return;
    }

    const { output, id: imageId } = aiInputSlice;
    const previewFaceIndex = this.tempFaceList.findIndex(
      item => item.id === imageId
    );

    if (output) {
      const { faces } = output;
      if (faces.length === 0) {
        return;
      }
      const [{ smileRate }] = output.faces;
      const previewFaceData = this.tempFaceList[previewFaceIndex];

      this.previewImageBlobs.push({ ...previewFaceData, smileRate });

      if (this.previewImageBlobs.length > this.options.previewImageSize) {
        this.previewImageBlobs = this.previewImageBlobs
          .sort((a, b) => b.smileRate - a.smileRate)
          .slice(0, this.options.previewImageSize);
      }

      this.aiPredictResult.push({
        ...output,
        faces: output.faces.map(faceItem => ({
          ...faceItem,
          mouthPos: undefined,
          facePos: undefined
        }))
      });
    }
    this.tempFaceList.splice(0, previewFaceIndex);
  };
}
