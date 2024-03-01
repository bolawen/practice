const EYE_GROUP_LEN$1 = 10;
const VIDEO_WIDTH = 862;
const PREDICT_SIZE = 320;
const HIDDEN_TIME_IN_SECONDS = 3;
const RECORD_INTERVAL = 2 * 1000;
const EMIT_CHUNK_UNIT_SIZE = 1 * 1024 * 1024;
const SCALE_RATIO = VIDEO_WIDTH / PREDICT_SIZE;

const SOUND_COLOR = {
  best: '#21A564',
  better: '#FAB400',
  worst: '#B80000',
};

const ERecorderStatus = {
  IDLE: 'idle',
  ACQUIRING_MEDIA: 'acquiring_media',
  DELAYED_START: 'delayed_start',
  RECORDING: 'recording',
  PAUSED: 'paused',
  STOPPING: 'stopping',
  INACTIVE: 'inactive',
  STOPPED: 'stopped'
};

const EMediaError = {
  AbortError: 'media_aborted',
  NotAllowedError: 'permission_denied',
  NotFoundError: 'no_specified_media_found',
  NotReadableError: 'media_in_use',
  OverconstrainedError: 'invalid_media_constraints',
  TypeError: 'no_constraints',
  SecurityError: 'security_error',
  OtherError: 'other_error',
  NoRecorder: 'recorder_error',
  // 无法获取浏览器录音功能，请升级浏览器或使用Chrome
  NotChrome: 'not_chrome',
  // chrome下获取浏览器录音功能，因为安全性问题，需要在localhost或127.0.0.1或https下才能获取权限
  UrlSecurity: 'url_security',
  None: ''
};

const EWorkerMessage = {
  /**
   * 模型尚未加载完成
   */
  MODEL_NOT_LOADED: 'model_not_loaded',
  /**
   * 模型加载成功
   */
  LOAD_MODEL_SUCCESS: 'load_model_success',
  /**
   * 模型加载失败
   */
  LOAD_MODEL_FAILED: 'load_model_failed',
  /**
   * 模型预测成功
   */
  PREDICT_SUCCESS: 'predict_success',
  /**
   * 模型预测失败
   */
  PREDICT_FAILED: 'predict_failed'
};

const CANVAS_PALETTE = {
  face: {
    color: '#FFD92B',
    pointColor: '#FF9800',
    opacity: ['100%', '20%'],
  },
  eye: {
    color: '#46D06E',
    pointColor: '#1F9E40',
    opacity: ['100%', '20%'],
  },
  mouth: {
    color: '#FFA43E',
    pointColor: '#E56014',
    opacity: ['100%', '20%'],
  },
  hand: {
    color: '#5ec8fe',
    pointColor: '#0b66f9',
    opacity: ['100%', '20%'],
  },
  sound: {
    color: '#F5A623',
    pointColor: '',
    opacity: ['100%', '8%', '%0'],
  },
};

const noop = () => null;

const isInTouchableDevice = 'ontouchend' in document.documentElement;

function makeId(length) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function formatTime(timeInSeconds) {
  const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);
  return {
    hours: result.substr(0, 2),
    minutes: result.substr(3, 2),
    seconds: result.substr(6, 2)
  };
}

/**
 * @description: rms转换为分贝计算公式
 * @param {*} gain
 */
function rmsToDb(gain) {
  return 20 * Math.log10(gain);
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

function getVolumeShownPercent(dbValue) {
  const minDb = -80;

  if (dbValue < minDb) {
    return 0;
  } else if (dbValue > 1) {
    return 1;
  }

  const volumePercent = (Math.abs(minDb) - Math.abs(dbValue)) / Math.abs(minDb);

  return volumePercent;
}

function addKeywordHighlight(oText, keyWords) {
  let returnVal = oText;
  const sortedKeywords = keyWords.sort(compareWordLength);

  for (let i = 0; i < sortedKeywords.length; i++) {
    const keyword = sortedKeywords[i];
    if (keyword !== '') {
      const regExp = new RegExp(`(≤*)${keyword}(≥*)`, 'g');
      returnVal = returnVal.replace(regExp, `≤${keyword}≥`);
    }
  }
  returnVal = returnVal
    .replace(/≤/g, '<span class="highlight">')
    .replace(/≥/g, '</span>');
  return returnVal;
}

function getColor(sound) {
  if (sound > 0.9 || sound < 0.3) {
    return SOUND_COLOR.worst;
  }
  if (sound > 0.6 || sound < 0.4) {
    return SOUND_COLOR.better;
  }
  return SOUND_COLOR.best;
}

/**
 * 绘制音量Canvas动画
 * @param audioCtx 音量画布
 * @param xEndPos 音量值转换为的进度长度
 */
function drawSoundValueCanvas(audioCtx, xEndPos, sound) {
  audioCtx.lineWidth = 20;

  const gradient = audioCtx.createLinearGradient(0, 0, xEndPos, 0);
  const color = getColor(sound);

  gradient.addColorStop(0, color);
  gradient.addColorStop(0.8, `${color}88`);
  gradient.addColorStop(1, `${color}00`);

  audioCtx.beginPath();
  audioCtx.moveTo(0, 0);
  audioCtx.lineTo(xEndPos, 0);
  audioCtx.strokeStyle = gradient;
  audioCtx.stroke();
  audioCtx.closePath();
}

function getSightAverage$1(totalEyeCount, passedEyeCount) {
  if (totalEyeCount === 0) {
    return 0;
  }

  return Number(totalEyeCount) === 0 ? 0 : passedEyeCount / totalEyeCount;
}

function getSightPassCount(workerResult) {
  let passedEyeCount = 0;
  const faces = workerResult.faces || [];
  faces.forEach(face => {
    const eyesCount = Math.round(face.eyesPos.length / EYE_GROUP_LEN$1);
    let ratio = 0;
    for (let i = 0; i < eyesCount; i++) {
      const startIndex = i * EYE_GROUP_LEN$1;
      const eyePos = face.eyesPos.slice(startIndex, startIndex + EYE_GROUP_LEN$1);

      const ey1 = eyePos[1];
      const ey2 = eyePos[3];
      const ey3 = eyePos[9];

      const ex1 = eyePos[4];
      const ex2 = eyePos[6];
      const ex3 = eyePos[8];

      const horizontalRatio = Math.abs(((ey1 + ey2) / 2 - ey3) / (ey1 - ey2));
      const verticalRatio = Math.abs(((ex1 + ex2) / 2 - ex3) / (ex1 - ex2));
      const sightRatio = horizontalRatio + verticalRatio;
      ratio += sightRatio;
    }
    ratio /= eyesCount;
    if (ratio < 0.035) {
      passedEyeCount += 1;
    }
  });
  return passedEyeCount;
}

function drawFaceCanvas(
  videoCtx,
  output,
  videoCtxWidth,
  videoCtxHeight
) {
  const { hands, faces } = output;
  videoCtx.clearRect(0, 0, videoCtxWidth, videoCtxHeight);

  const sightAverage = getSightAverage$1(faces.length, getSightPassCount(output));
  const showSight = sightAverage > 0.2;
  faces.forEach(face => {
    const { faceRate, facePos } = face;

    // draw face border
    if (faceRate > 0.3) {
      const [x1, y1, x2, y2] = facePos;
      drawFaceBorder(videoCtx, x1, y1, x2, y2, 3, 'face');
    }

    if (showSight) {
      const offset = 0;
      // draw eyes border
      const { eyesPos } = face;

      const ex1 = eyesPos[4] - offset;
      const ey1 = eyesPos[1] - offset;
      const ex4 = eyesPos[16] + offset;
      const ey4 = eyesPos[13] + offset;
      drawFaceBorder(videoCtx, ex1, ey1, ex4, ey4, 3, 'eye');
    }

    const { mouthPos } = face;
    const mx1 = mouthPos[0];
    const my1 = mouthPos[7];
    const mx2 = mouthPos[12];
    const my2 = mouthPos[19];
    if (face.smileRate >= 0.4) {
      drawFaceBorder(videoCtx, mx1, my1, mx2, my2, 3, 'mouth');
    }
  });

  hands.forEach(hand => {
    const [x1, y1, x2, y2] = hand.handPos;
    drawFaceBorder(videoCtx, x1, y1, x2, y2, 3, 'hand');
  });
}

function drawFaceBorder(
  videoCtx,
  xPos,
  yPos,
  x2Pos,
  y2Pos,
  lineWidth,
  type = 'face'
) {
  const { color: lineColor, pointColor } = CANVAS_PALETTE[type];

  xPos *= SCALE_RATIO;
  yPos *= SCALE_RATIO;

  x2Pos *= SCALE_RATIO;
  y2Pos *= SCALE_RATIO;

  drawRectBorder(
    videoCtx,
    xPos,
    yPos,
    x2Pos,
    y2Pos,
    lineWidth,
    lineColor,
    pointColor
  );
}

function drawRectBorder(
  videoCtx,
  xPos,
  yPos,
  x2Pos,
  y2Pos,
  lineWidth,
  lineColor,
  pointColor
) {
  videoCtx.lineWidth = lineWidth; // 设置线条宽度

  drawLine(videoCtx, xPos, yPos, xPos, y2Pos, lineColor, pointColor);
  drawLine(videoCtx, xPos, y2Pos, x2Pos, y2Pos, lineColor, pointColor);
  drawLine(videoCtx, x2Pos, y2Pos, x2Pos, yPos, lineColor, pointColor);
  drawLine(videoCtx, x2Pos, yPos, xPos, yPos, lineColor, pointColor);

  videoCtx.closePath();
}

function drawLine(
  videoCtx,
  xStartPos,
  yStartPos,
  xEndPos,
  yEndPos,
  lineColor,
  pointColor
) {
  drawStartPoint(videoCtx, xStartPos, yStartPos, pointColor, 2);
  drawGradientLine(videoCtx, xStartPos, yStartPos, xEndPos, yEndPos, lineColor);
}

function drawGradientLine(
  videoCtx,
  xStartPos,
  yStartPos,
  xEndPos,
  yEndPos,
  lineColor
) {
  const gradient = videoCtx.createLinearGradient(
    xStartPos,
    yStartPos,
    xEndPos,
    yEndPos
  );

  gradient.addColorStop(0, lineColor);
  gradient.addColorStop(0.8, `${lineColor}88`);
  gradient.addColorStop(1, `${lineColor}00`);

  videoCtx.beginPath();
  videoCtx.moveTo(xStartPos, yStartPos);
  videoCtx.lineTo(xEndPos, yEndPos);
  videoCtx.strokeStyle = gradient;
  videoCtx.stroke();
}

function drawStartPoint(videoCtx, x, y, color, radius) {
  videoCtx.fillStyle = color;

  videoCtx.beginPath();
  videoCtx.arc(x, y, radius, 0, 2 * Math.PI);
  videoCtx.fill();
  videoCtx.closePath();
}

function getPredictImageDataFromVideoElement({
  ctx,
  videoElement,
  videoWidth,
  videoHeight,
  predictSize
}) {
  ctx.clearRect(0, 0, predictSize, predictSize);
  ctx.save();
  ctx.translate(predictSize, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(
    videoElement,
    0,
    0,
    videoWidth,
    videoHeight,
    0,
    0,
    predictSize,
    (predictSize * videoHeight) / videoWidth
  );
  ctx.restore();

  const imageData = ctx.getImageData(0, 0, predictSize, predictSize);
  const imageDataBuffer = imageData.data.buffer;
  const imageWidth = imageData.width;
  const imageHeight = imageData.height;

  return {
    id: makeId(4),
    buffer: imageDataBuffer,
    width: imageWidth,
    height: imageHeight
  };
}

function getPreviewImageDataFromVideoElement({
  id,
  videoElement,
  videoWidth,
  videoHeight,
  width = 640,
  height = 360,
  previewCanvasCtx
}) {
  previewCanvasCtx.clearRect(0, 0, width, height);
  previewCanvasCtx.save();
  previewCanvasCtx.translate(width, 0);
  previewCanvasCtx.scale(-1, 1);
  previewCanvasCtx.drawImage(
    videoElement,
    0,
    0,
    videoWidth,
    videoHeight,
    0,
    0,
    width,
    height
  );
  previewCanvasCtx.restore();

  const previewImageData = previewCanvasCtx.getImageData(0, 0, width, height);

  return {
    id,
    previewImageData
  };
}

class MediaRecorder {
  constructor(options) {
    const {
      recorderScreen = false,
      mediaRecorderOptions,
      mediaStreamConstraints,
      recordInterval = RECORD_INTERVAL,
      emitChunkUnitSize = EMIT_CHUNK_UNIT_SIZE
    } = options;

    this.mediaChunks = [];
    this.mediaStream = null;
    this.mediaBlobUrl = null;
    this.audioContext = null;
    this.mediaRecorder = null;
    this.emittedChunkSlices = 0;

    this.recorderScreen = recorderScreen;
    this.recordInterval = recordInterval;
    this.emitChunkUnitSize = emitChunkUnitSize;
    this.mediaRecorderOptions = mediaRecorderOptions;
    this.mediaStreamConstraints = mediaStreamConstraints;

    this.onMediaError = noop;
    this.onRecorderStart = noop;
    this.onRecorderStop = noop;
    this.onRecorderStatusChange = noop;
    this.onRecorderChunkChange = noop;
  }

  configCallbacks({
    onMediaError,
    onRecorderStart,
    onRecorderStop,
    onRecorderStatusChange,
    onRecorderChunkChange
  }) {
    this.onMediaError = onMediaError || noop;
    this.onRecorderStart = onRecorderStart || noop;
    this.onRecorderStop = onRecorderStop || noop;
    this.onRecorderStatusChange = onRecorderStatusChange || noop;
    this.onRecorderChunkChange = onRecorderChunkChange || noop;
  }

  createAudioContext(sampleRate = 16000) {
    this.audioContext = new AudioContext({ sampleRate });
    return this.audioContext;
  }

  checkConstraints(mediaType) {
    let supportedMediaConstraints = null;

    try {
      supportedMediaConstraints =
        navigator.mediaDevices.getSupportedConstraints();

      if (supportedMediaConstraints === null) {
        return;
      }

      let unSupportedMediaConstraints = Object.keys(mediaType).filter(
        constraint => !supportedMediaConstraints[constraint]
      );

      if (unSupportedMediaConstraints.length !== 0) {
        let toText = unSupportedMediaConstraints.join(',');
        console.log(
          'checkConstraints',
          `The following constraints ${toText} are not supported on this browser.`
        );
      }
    } catch (error) {
      console.log(checkConstraints, error);
    }
  }

  checkMediaConstraints() {
    if (!window.MediaRecorder) {
      throw new Error('Unsupported Browser');
    }

    if (
      isObject(this.mediaStreamConstraints.audio) &&
      typeof this.mediaStreamConstraints.audio !== 'boolean'
    ) {
      this.checkConstraints(this.mediaStreamConstraints.audio);
    }
    if (
      isObject(this.mediaStreamConstraints.video) &&
      typeof this.mediaStreamConstraints.video !== 'boolean'
    ) {
      this.checkConstraints(this.mediaStreamConstraints.video);
    }
  }

  checkMediaRecorderOptions() {
    if (this.mediaRecorderOptions && this.mediaRecorderOptions.mimeType) {
      if (
        typeof window.MediaRecorder.isTypeSupported === 'function' &&
        !window.MediaRecorder.isTypeSupported(
          this.mediaRecorderOptions.mimeType
        )
      ) {
        console.log(
          'checkMediaRecorderOptions',
          `The specified MIME type you supplied for MediaRecorder doesn't support this browser`
        );
      }
    }
  }

  async requestUserMedia() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      this.recorderStatus = ERecorderStatus.ACQUIRING_MEDIA;

      try {
        let stream;

        if (this.recorderScreen) {
          stream = await window.navigator.mediaDevices.getDisplayMedia(
            this.mediaStreamConstraints
          );
        } else {
          stream = await window.navigator.mediaDevices.getUserMedia(
            this.mediaStreamConstraints
          );
        }

        if (this.recorderScreen && this.mediaStreamConstraints.audio) {
          let audioStream = await window.navigator.mediaDevices.getUserMedia({
            audio: this.mediaStreamConstraints.audio
          });

          audioStream
            .getAudioTracks()
            .forEach(audioTrack => stream.addTrack(audioTrack));
        }

        this.mediaStream = stream;
        this.recorderStatus = ERecorderStatus.IDLE;
      } catch (err) {
        console.error(err);
        const errName = err.name;
        if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
          // required track is missing
          // 找不到满足请求参数的媒体类型。
          this.mediaError = EMediaError.NotFoundError;
        } else if (
          errName === 'NotReadableError' ||
          errName === 'TrackStartError'
        ) {
          // 媒体设备已经被其他的应用所占用了
          // 操作系统上某个硬件、浏览器或者网页层面发生的错误导致设备无法被访问。
          // webcam or mic already in use
          this.mediaError = EMediaError.NotReadableError;
        } else if (
          errName === 'OverConstrainedError' ||
          errName === 'ConstraintNotSatisfiedError'
        ) {
          // 当前设备不满足constraints条件
          this.mediaError = EMediaError.OverconstrainedError;
        } else if (
          errName === 'NotAllowedError' ||
          errName === 'permissionDeniedError'
        ) {
          // permission denied in browser
          // 用户拒绝了当前的浏览器实例的访问请求；或者用户拒绝了当前会话的访问；或者用户在全局范围内拒绝了所有媒体访问请求。
          this.mediaError = EMediaError.NotAllowedError;
        } else if (errName === 'TypeError') {
          // 类型错误，constraints对象未设置［空］，或者都被设置为false。
          this.mediaError = EMediaError.TypeError;
        } else if (errName === 'AbortError') {
          // 硬件问题
          this.mediaError = EMediaError.AbortError;
        } else if (errName === 'SecurityError') {
          // 安全错误，在getUserMedia() 被调用的 Document 上面，使用设备媒体被禁止。这个机制是否开启或者关闭取决于单个用户的偏好设置。
          this.mediaError = EMediaError.SecurityError;
        } else {
          // other errors
          this.mediaError = EMediaError.OtherError;
        }

        this.recorderStatus = ERecorderStatus.IDLE;
      }
    } else {
      if (
        navigator.userAgent.toLowerCase().match(/chrome/) &&
        location.origin.indexOf('https://') < 0
      ) {
        this.mediaError = EMediaError.UrlSecurity;
      } else {
        this.mediaError = EMediaError.NotChrome;
      }
    }
  }

  startRecord() {
    this.mediaError = EMediaError.None;
    if (!this.mediaStream) {
      return;
    }

    // 如果已经有了recorder，先暂停再开始
    if (this.mediaRecorder) {
      if (this.recorderStatus === ERecorderStatus.DELAYED_START) {
        return;
      }
      this.recorderStatus = ERecorderStatus.DELAYED_START;
      this.mediaRecorder.start(this.recordInterval);

      return;
    }

    if (this.mediaRecorderOptions) {
      this.mediaRecorder = new window.MediaRecorder(
        this.mediaStream,
        this.mediaRecorderOptions
      );
    } else {
      this.mediaRecorder = new window.MediaRecorder(this.mediaStream);
    }

    this.mediaRecorder.ondataavailable = this.onRecordingDataAvailable;
    this.mediaRecorder.onstop = this.onRecordingStop;
    this.mediaRecorder.onerror = this.onRecordingError;
    this.mediaRecorder.onstart = this.onRecordingStart;

    if (this.recorderStatus === ERecorderStatus.DELAYED_START) {
      return;
    }
    this.recorderStatus = ERecorderStatus.DELAYED_START;
    this.mediaRecorder.start(this.recordInterval);
  }

  onRecordingDataAvailable = evt => {
    const { data } = evt;
    this.mediaChunks.push(data);

    // 融合全部的chunks为整体
    let tmpAllBlobs = new Blob(this.mediaChunks, { type: data.type });

    // 可以向外传出的chunks个数
    const availableChunkSlices = Math.floor(
      tmpAllBlobs.size / this.emitChunkUnitSize
    );

    // 应该向外传出的chunks个数
    const shouldEmittedChunkSlices =
      availableChunkSlices - this.emittedChunkSlices;

    // 传出应该传出的chunks
    for (let i = 0; i < shouldEmittedChunkSlices; i++) {
      const startChunkIndex = this.emittedChunkSlices + i;
      const startIndex = startChunkIndex * this.emitChunkUnitSize;
      const endIndex = (startChunkIndex + 1) * this.emitChunkUnitSize;
      const emitChunk = tmpAllBlobs.slice(startIndex, endIndex, data.type);

      this.onRecorderChunkChange(
        startChunkIndex + 1,
        emitChunk,
        this.mediaChunks
      );
    }
    // 更新已传出chunks数量
    this.emittedChunkSlices += shouldEmittedChunkSlices;

    // 当结束记录时，可能有一小部分大小达不到this.emitChunkUnitSize的值，这里进行单独的传出
    if (
      this.recorderStatus === ERecorderStatus.STOPPED ||
      this.recorderStatus === ERecorderStatus.STOPPING
    ) {
      const startIndex = this.emittedChunkSlices * this.emitChunkUnitSize;
      const endIndex = tmpAllBlobs.size;
      const emitChunks = tmpAllBlobs.slice(startIndex, endIndex, data.type);

      this.onRecorderChunkChange(
        this.emittedChunkSlices + 1,
        emitChunks,
        this.mediaChunks
      );
    }
    tmpAllBlobs = null;
  };

  onRecordingStop = () => {
    const { url, blob } = this.createBlobUrl();
    this.recorderStatus = ERecorderStatus.STOPPED;
    this.mediaBlobUrl = url;
    this.onRecorderStop(url, blob);

    this.emittedChunkSlices = 0;
    this.mediaChunks = [];
  };

  onRecordingStart = evt => {
    this.clearBlobUrl();
    this.recorderStatus = ERecorderStatus.RECORDING;
    this.onRecorderStart();
  };

  onRecordingError = event => {
    console.error(event);
    this.mediaError = EMediaError.NoRecorder;
    this.recorderStatus = ERecorderStatus.IDLE;
  };

  pauseRecord() {
    if (
      this.mediaRecorder &&
      this.mediaRecorder.state === ERecorderStatus.RECORDING
    ) {
      this.mediaRecorder.pause();
      this.recorderStatus = ERecorderStatus.PAUSED;
    }
  }

  resumeRecord() {
    if (
      this.mediaRecorder &&
      this.mediaRecorder.state === ERecorderStatus.PAUSED
    ) {
      this.mediaRecorder.resume();
      this.recorderStatus = ERecorderStatus.RECORDING;
    }
  }

  stopRecord() {
    if (
      this.mediaRecorder &&
      this.mediaRecorder.state !== ERecorderStatus.INACTIVE &&
      this.recorderStatus === ERecorderStatus.RECORDING
    ) {
      this.mediaRecorder.stop();
      this.recorderStatus = ERecorderStatus.STOPPING;

      this.mediaStream &&
        this.mediaStream.getTracks().forEach(track => track.stop());
    }
  }

  muteAudio(mute) {
    this.isAudioMuted = mute;
    if (this.mediaStream) {
      this.mediaStream
        .getAudioTracks()
        .forEach(audioTrack => (audioTrack.enabled = !mute));
    }
  }

  createBlobUrl() {
    const [firstChunk] = this.mediaChunks;

    const other =
      this.blobPropertyBag ||
      (this.mediaStreamConstraints.video
        ? { type: 'video/webm' }
        : { type: 'audio/wav' });

    const blobProperty = {
      type: firstChunk.type,
      ...other
    };

    const blob = new Blob(this.mediaChunks, blobProperty);
    const url = URL.createObjectURL(blob);

    return {
      url,
      blob
    };
  }

  clearBlobUrl() {
    URL.revokeObjectURL(this.mediaBlobUrl);
    this.mediaBlobUrl = '';
  }

  getMediaStream() {
    if (this.mediaStream) {
      return this.mediaStream;
    }
    return null;
  }

  clearMediaStream() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  getAudioContext() {
    return this.audioContext;
  }

  get recorderStatus() {
    return this._recorderStatus;
  }

  set recorderStatus(value) {
    this._recorderStatus = value;
    this.onRecorderStatusChange(value);
  }

  get mediaError() {
    return this._mediaError;
  }

  set mediaError(value) {
    this._mediaError = value;
    this.onMediaError(value);
  }
}

class Component {
  constructor(recorder) {
    this.recorder = recorder;
    this.options = recorder.options;

    this.bindEvent = this.bindEvent.bind(this);
    this.unBindEvent = this.unBindEvent.bind(this);
  }

  init() {
    this.bindEvent();
  }

  bindEvent() {}

  unBindEvent() {}
}

class RecordBtn extends Component {
  constructor(recorder) {
    super(recorder);

    this.recordBtn = document.querySelector('.icon-record');
    this.countdownCircleEl = document.querySelector('.countdown');
    this.recordTimerEl = document.querySelector('.record-timer');
    this.recordStatus = 'not_start';
    this.secondsRemain = this.options.countDownSeconds;

    this.update = this.update.bind(this);
    this.togglePlay = this.togglePlay.bind(this);
    this.clickTogglePlay = this.clickTogglePlay.bind(this);
    this.startCountDown = this.startCountDown.bind(this);
    this.startRecord = this.startRecord.bind(this);
    this.stopRecord = this.stopRecord.bind(this);
    this.processRecord = this.processRecord.bind(this);

    this.recorder.onRecordProcessCallbacks.push(this.processRecord);
  }

  startRecord() {
    this.recorder.startRecord();
    this.recordStatus = 'recording';
  }

  stopRecord() {
    this.recorder.stopRecord();
    this.recordStatus = 'stopped';
  }

  processRecord(time) {
    if (this.recordStatus === 'recording') {
      this.recordTimerEl.innerText = time;
    } else {
      this.recordTimerEl.innerText = '';
    }
  }

  startCountDown() {
    this.secondsRemain = this.options.countDownSeconds;
    this.recordTimerEl.classList.remove('hidden');
    this.countdownCircleEl.classList.remove('hidden');
    this.countdownCircleEl.innerText = `${this.secondsRemain}`;
    this.recordStatus = 'counting_down';
    this.recorder.options.onCountdownStart();

    this.remainTimer = setInterval(() => {
      if (this.secondsRemain > 1) {
        this.secondsRemain -= 1;
        this.countdownCircleEl.innerText = `${this.secondsRemain}`;
      } else {
        this.countdownCircleEl.classList.add('hidden');
        clearInterval(this.remainTimer);
        this.startRecord();
      }
    }, 1 * 1000);
  }

  clickTogglePlay() {
    if (isInTouchableDevice) {
      return;
    }
    this.togglePlay();
  }

  togglePlay() {
    // 正在倒计时中
    if (this.recordStatus === 'counting_down') {
      return;
    }

    if (
      this.recorder.recordStatus !== 'init' &&
      this.recorder.recordStatus !== 'recording'
    ) {
      return;
    }

    if (
      this.recorder.recordStatus === 'recording' &&
      this.recorder.recordSeconds <
        this.recorder.options.miniRecordingSeconds
    ) {
      const { onStopLessThanMiniRecordingSeconds } = this.recorder.options;
      onStopLessThanMiniRecordingSeconds &&
        onStopLessThanMiniRecordingSeconds();
      return;
    }

    if (this.recorder.toggleRecord()) {
      this.update();
    }
  }

  bindEvent() {
    this.recordBtn.addEventListener('click', this.clickTogglePlay);
    this.recordBtn.addEventListener('touchend', this.togglePlay);
  }

  unBindEvent() {
    this.recordBtn.removeEventListener('click', this.clickTogglePlay);
    this.recordBtn.removeEventListener('touchend', this.togglePlay);
  }

  update() {
    const { isRecording } = this.recorder;

    if (isRecording) {
      this.startCountDown();
      this.recordBtn.classList.add('stop');
    } else {
      this.stopRecord();
      this.recordBtn.classList.remove('stop');
    }
  }
}

const defaultOptions$2 = {
  bufferSize: 0,
  numberOfInputChannels: 1,
  numberOfOutputChannels: 1,
  useBuiltin16BitTransformer: true,
  dbToVolumeTransformer: getVolumeShownPercent
};

class MediaSoundMeter {
  constructor(audioContext, options) {
    this.audioContext = audioContext;
    this.options = { ...defaultOptions$2, ...options };

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

var template1 = "<style>\n    #profile {\n      width: 640px;\n      margin: 0 auto;\n      font-size: 16px;\n      font-weight: bold;\n      height: 100px;\n      overflow: hidden;\n      padding: 20px;\n    }\n  \n    #profile span {\n      color: #ff0000;\n    }\n  \n    video {\n      -webkit-transform: scaleX(-1);\n      transform: scaleX(-1);\n    }\n  \n    .video-wrap {\n      background-color: #5a5b5f;\n      position: relative;\n      width: 862px;\n      height: 485px;\n      font-family: noto_sansregular, Arial, Microsoft Yahei, Hiragino Sans GB;\n    }\n  \n    .video-wrap video {\n      width: 862px;\n      height: 485px;\n      left: 0;\n      top: 0;\n    }\n  \n    .video-wrap .audio-wrap {\n      position: absolute;\n      top: 12px;\n      left: 12px;\n      width: 180px;\n      height: 34px;\n      background: #000000;\n      border-radius: 17px;\n      opacity: 0.8;\n      z-index: 1;\n    }\n  \n    .video-wrap .audio-wrap #audio-canvas {\n      position: absolute;\n      top: 13px;\n      left: 36px;\n      width: 110px;\n      height: 8px;\n      border-radius: 4px;\n    }\n  \n    .video-wrap .audio-wrap i {\n      display: inline-block;\n      position: absolute;\n      top: 9px;\n      left: 12px;\n      width: 16px;\n      height: 16px;\n      background-size: 16px;\n      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAApRJREFUWEfVl0uIjWEYx39/5DJRJpRioXFr0ohyL7eFQkNTcg8LlyKllJVyKdmq2Qgb14xJCUWxICmXwmbKfcGCBbMxCgv+evV+09dxznfOd07H5F1+vc/z/N7/87zP836ij5f6OD7/P4DtJcB7SS+rUbNqBWwPBE4Bm4HXkib9MwDbjcAVYGEq6BBJ3/NC5FbAdhNwA5hcEGyYpK91BbA9F7gKjCoSqL4AtlcDZ4HBJU5ZFMD2FmApsFtSd6Ft0RTY3grsAyamDPqVkbcUwDNgGnA7gEj6lfbzF4DtdcDFvLkE/gDYngqsBNolfYkKnI7+9khqLwfwGJhZA8B1oDUWaqsk274ErAE+AU3pYi2mQA8wtAaAHcCJaL9eUoftkMrnQH9gk6Tzif9iAN8yCi2LK0lBqJWHUcUHkuYFI9v3gPlAp6S1dQOIwUKADiAU3HBJPbYPAweALkkt9QYIbTmZDc2SXtjeDpwEuiWNrDfAeOBNDDJB0lvb2+Ls+CBpTBZA6OeDqi3CmIJVwGUg1FOjpB+2DwEHgSeSZtRNAduhsO8CC0LbltQWoe4Ai4DjknZlAXwGRlSrgO0wns9E+zmSHsUB9ipew+WSbmYBhEm3rAaApBEdlbQ/nj7c+42xF7RI+pkFMB24DzTkhEj6wKw4fI6Evm97A3Ah+mqTFKZp7yo1jJqBnXEYJXumAGMzoEoNo6dAONQxSXsL7St+kNgeDdwCeptIgbNSAGGyBsnPpaUvmYIs2eNTLBTQ7CL76vsgSQLaDoPqGrC4EgXK1VHFKUg7sh1eRZ3AitT3Bkmh8eRaVQHEqzUACA+NcL3eSRqXK3LcXDVAKiXhx+SjpK4+AagmaNk+UKvTPPY1pyBPsGJ7fwOUxRUwHcES2gAAAABJRU5ErkJggg==');\n    }\n  \n    .video-wrap .audio-wrap i.crackle {\n      left: auto;\n      right: 12px;\n      visibility: hidden;\n      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAwlJREFUWEfFl01IVFEUx///p4OmhmRGIKQzbyBCiClCcxWahkWYFs2iyFUQJBhBEK7CPlYRtWkRFdWiiJgs3xWKTGdexYj0QR+roNQGpUWEgVHm15yY50xMNuPU5HPu7j7uPf/fPefcc+4j/nMMNm2uRBhluvL70jHFjwca8uI3llzs+h4/H9pVV+W609OfyHhEXES6KTyjK/+ptAAGdlRL/Ea3Mhk/H2ysHsqmVlfa6R/47XtUHCKFBM7rymy1BWCgsXqMwEhhwZKq5Tfuj0VEYiePiEfmJG7rhum1DQCCpSDv6es2NXx49bgiDDyIiUcBnuiGucleAOukvCXA1njxqOg7tzJXJwOQ1m05odBUeT7y3q9Q6mv8OqbKgUgILA/MOzjmVgErHIN7aldiXDwIiweERyAeCNYQDOoqUD3XzAIBWN7phliCK/9gJSe1bIfH1dH91jaA+RxE8KSuAscSrVkwD8wD8F4rcq51Xbv2IzMAzNriNnp7kgHa6gEC13VlNs8bnoW5BYklIrF35RQfp883kxEPWEUKfK2RLU7D35eZHLAgIACv5OYXtJXc7PpsQyH6uyJMchTCNpfRe5mk1QRtTcKkcQf6NWS3OFXPy4wARMGmSRxeRABOAHgOIKhloS8ntyAYyQf7AMhPgPQRWlDTGCzLLnpBn29y0XoBoR3Qlf9SqvS0zQMEnunKrMwYgHXFHFkevaP3TQZLcerHqm0hmC3D+MIiZ0myVrxwhYiYonA3KK0iqJvj8n1uZd6wtxkRw27DLI2IhBpry6cRPkRBs0DyCD5K9BaMAf1jCDhByhERtAMo/mWEfKobgY3xpwzt3b5s5tv4fki4xeFw1K/qePjuv7ohyRkN9DoN/93BnTUehOEXkaJoyzV0FWhKJCBeb9YIxgpX+R6Mpg1AQQGp7XcZ/qsxIx921K0PY7pXgGUgLrgN82CqO58QYNhbb50iNuaSzv4XsN2tAmfnGgg11WyYEekheM5lBE6kBZBq01BTzVFXZ+B0snUDu2orOC3OdH/PfwIOBMsI+NmQOQAAAABJRU5ErkJggg==');\n    }\n  \n    .video-wrap .body-shape {\n      position: absolute;\n      top: 68px;\n      left: 50%;\n      width: 492px;\n      height: 417px;\n      margin-left: -246px;\n      background-image: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"445\" height=\"438\" viewBox=\"0 0 445 438\" fill=\"none\"> <path opacity=\"0.6\" d=\"M225.29 750.094V967H360.482L358.787 399.828V638.852C358.787 662.328 377.818 681.359 401.293 681.359V681.359C424.863 681.359 443.931 662.318 443.775 638.748C443.118 540.081 441.319 303.894 439.108 298.729C431.5 257.5 381.131 251.304 345.787 241.454C323.147 235.145 300.686 228.682 278.189 221.882C274.948 220.903 272.831 219.024 272.484 215.562C272.075 211.465 274.084 207.609 277.572 205.57C311.082 185.977 333.284 149.07 331.914 107.064C330.053 49.9885 283.905 3.36202 226.994 1.08944C164.507 -1.40603 113.067 48.6429 113.067 110.738C113.067 151.178 134.901 186.487 167.383 205.518C170.892 207.574 172.97 211.438 172.564 215.491C172.211 219.024 170.094 220.903 166.851 221.882C144.355 228.683 121.894 235.145 99.2553 241.454C63.9086 251.303 13 261 5.93229 298.729C3.72357 303.892 1.92501 539.939 1.26811 638.66C1.11095 662.277 20.2176 681.359 43.8355 681.359V681.359C67.2912 681.359 86.3324 662.395 86.4278 638.939L87.4005 399.828L86.2553 967H222.521\" stroke=\"white\" stroke-opacity=\"60%\" stroke-width=\"2\"/></svg>');\n      background-position: center top;\n      background-repeat: no-repeat;\n    }\n  \n    .video-wrap .body-shape-container.full-mode .body-shape {\n      width: 250px;\n      height: 417px;\n      margin-left: -125px;\n      background-image: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"255\" height=\"418\" viewBox=\"0 0 255 418\" fill=\"none\">  <path opacity=\"0.4\" d=\"M129.131 489.743V569H208.774L207.775 215.508V390.704C207.775 403.441 218.101 413.766 230.837 413.766V413.766C243.613 413.766 253.954 403.461 253.885 390.685C253.573 332.296 252.626 182.844 251.093 176.062C248.5 156.5 220.043 147.928 200.117 142.385C186.78 138.675 173.548 134.875 160.295 130.877C158.385 130.301 157.138 129.196 156.934 127.161C156.692 124.752 157.876 122.485 159.931 121.285C179.672 109.765 192.751 88.0639 191.945 63.3645C190.848 29.8049 163.662 2.38885 130.135 1.05259C93.3236 -0.414726 63.0199 29.0136 63.0199 65.525C63.0199 89.3034 75.8824 110.065 95.0176 121.255C97.0848 122.464 98.3088 124.736 98.0701 127.119C97.8621 129.196 96.6148 130.301 94.7043 130.877C81.4515 134.876 68.2198 138.675 54.883 142.385C34.9554 147.927 7 156 3.90566 176.062C1.57182 184.044 1.11253 332.555 1.02215 390.699C1.00227 403.485 11.3653 413.766 24.1516 413.766V413.766C36.9072 413.766 47.2597 403.449 47.3031 390.693L47.8993 215.508L47.2246 569H127.5\" stroke=\"white\" stroke-opacity=\"60%\" stroke-width=\"2\"/></svg>');\n      background-size: 250px 417px;\n      background-position: center top;\n      background-repeat: no-repeat;\n    }\n  \n    .video-wrap .body-shape-container.full-mode .body-horizontal-line {\n      display: none;\n    }\n  \n    .video-wrap .body-horizontal-line {\n      position: absolute;\n      top: 160px;\n      left: 0;\n      right: 0;\n      border-bottom: 2px solid #ffffff66;\n    }\n  \n    .video-wrap #body-horizontal-text {\n      padding: 0;\n      margin: 0;\n      color: white;\n      text-align: center;\n      font-size: 14px;\n      padding-bottom: 4px;\n    }\n  \n    .video-wrap #video-canvas {\n      left: 0;\n      top: 0;\n      position: absolute;\n      width: 862px;\n      height: 485px;\n      opacity: 0.8;\n    }\n  \n    .video-wrap .icon-record {\n      display: inline-block;\n      position: absolute;\n      bottom: 15px;\n      left: 50%;\n      margin-left: -40px;\n      width: 80px;\n      height: 80px;\n      background-size: 80px;\n      background-image: url('data:image/png;base64,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');\n      cursor: pointer;\n    }\n  \n    .video-wrap .icon-record.stop {\n      background-image: url('data:image/png;base64,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');\n    }\n  \n    .video-wrap .icon-act {\n      position: absolute;\n      display: inline-block;\n      top: 12px;\n      width: 32px;\n      height: 32px;\n      background-size: 32px;\n      cursor: pointer;\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n    }\n  \n    .video-wrap .icon-act.shape.disabled {\n      background-image: url('data:image/png;base64,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');\n    }\n  \n    .video-wrap .icon-act.shape {\n      right: 16px;\n      background-image: url('data:image/png;base64,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');\n    }\n  \n    .video-wrap .icon-act.ai.disabled {\n      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAABRtJREFUeF7tm38s42ccx5/6rTncWdWtiNWuVQttJM6cDrEx3LjULbk6pyEy4w+S/oOUdJKmBJEIiQSJPzg9d73smE1TyXWrbamMEaqomx8zK5qW5o6bdeuP5WseaW5+L3f5tv1+/2n7/Pj28359n+f5fL7PDxz497oCAPgUAEAFAPgdpDnqx3MAwDMAwJcAAAPuQPwXAAC8oyo+RtcfAAABAuAzAMB1JxMP5Y4jABqdoNkf93yfIwA6nPTp78vGAGAtAOsC2BiADYKYF3BiApgbxNwg5gYxN4i5QSd2Aq/3ZSgoKMhjdXWV4+rq6opANhqNf5NIpPvb29umi0K3Wq2f29bF4XCdF73Xa38bbGhoiKioqEiwNbCmpuY7gUDwy0WNtisAarX6Vnh4+FVbsTMzMxo6nT7k8ACio6MvTU5O3j2YczjUa7VarXQ6/YFKpXp5EQh20wK6urqiCwsLj5xr7Ojo+KmkpGTaoQFoNJo7JBLp8lEiNRqNITg4+LHDAsjKyiIMDg7ehgKNRuNfyHdPT08PmJaZmflkaGhIf14IdtEF+vv7b7BYrCgoTiaTLVgsFmtqaioNpg0MDKiys7MVDgfA3d0dp9fr7/n6+h4utHA4nK9NJpO1r6/vFhS8u7u7RyAQeo1Go/U8EFDfAoqKioI7OztvQlFbW1u7RCLxgcViAVqtNodIJPrCvNLSUmlbW9tvDgVALpcnJyUlUaAokUg0mZeX9zPy+1XPoFAolplM5lOHAeDv7++2sbHB8fDwcIeimEzmI4VCgSxIAjqdfml6evowNjCZTObQ0ND76+vr+4PkWS5UdwE+n08RCATJUMji4qKWQqF8ZStMqVR+EhUVFQTT6uvrv+fxeOqziEfKoBrA1NTUTQaDEQzFNDY2/lhZWTlnK666uvqaUCj8EKYtLCxs0mi0QbsHQKVSvdVq9T0cDueCiDGbzWYymdy7trZmtBXn5+fnurm5yfHy8jqMCWJjYx+Oj4+/OAsE1LaA1tbWqLKyshtQxOjo6HJ8fPyRA5xUKk1MS0s7jAm6u7snCgoKJuwawPLy8m0ymUyAIsbGxn5VqVS6o0RRKJQrCQkJ12CeTqd7QSQSH9otgMTExMsjIyN3ziLguDJsNntQLBZvnnYPVHYBkUh0PTc3N/o040/KHx4enk9PT//htHugDoCLiwsS4d0lEAg+pxl/Uv7e3p4xMDCwd2dnx3xSOdQByMnJuWob4+v1+h2pVHqmKa+kpKTQkJCQt6Dg8vLyp01NTct2BUAikSRkZGREQKPPM9nB4/Heraur+wjWnZiYWI2JiRm2GwB4PN5Fp9Nx8Hi850GUZo2MjBTNzc0hW9BOvXx8fFy1Wi3H29t7PyawWCwWKpXau7S09OdxlVHVBbhc7jvNzc0fQ2OVSuXvDAZDcqpymwISieSDjIyM92BSS0uLgsvlquwCwOjoaGpcXBwZGsvn878VCoWL5wHAYrGI/f39LFhnZWVFHxYW9gT1AEgk0v6ih5ub2/9e9Hh1/jA5OfmxXC43HAUBNV2gtraWVlVVlQiNlMlkz1JSUuTnefqwbHt7O6O4uPh9+FssFk+x2ewxVAOYn5/PotFob0Mj8/Pzv+np6Vm/CICIiAj87OxsLnyRMhgMLwMCAkRm839DAtS0gIsIRWMdbIsMtkUG2yKDbZHBtsigcXR+UzZhXgDzApgXwLwA5gXe1IiLxv/BvAB2cBI7Ort/ctypD08jY5PTHp//BzmvQdXtKMj7AAAAAElFTkSuQmCC');\n    }\n  \n    .video-wrap .icon-act.shape .tooltip,\n    .video-wrap .icon-act.ai .tooltip {\n      visibility: hidden;\n    }\n  \n    .video-wrap .icon-act.ai:hover .tooltip,\n    .video-wrap .icon-act.shape:hover .tooltip {\n      visibility: visible;\n    }\n  \n    .video-wrap .tooltip {\n      visibility: hidden;\n      display: inline-block;\n      margin-top: 38px;\n      width: fit-content;\n      padding: 4px 6px;\n      font-size: 12px;\n      font-weight: 400;\n      color: #ffffff;\n      line-height: 16px;\n      background: #00000099;\n      border-radius: 2px;\n      margin-left: -100px;\n      margin-right: -100px;\n      font-style: normal;\n    }\n  \n    .video-wrap .icon-act.ai {\n      right: 56px;\n      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAABSBJREFUeF5jZIAAQQYGhmAGBgY1BgYGfqjYcKU+MjAw3GJgYFjLwMDwnhHq+ToGBgau4epjHP76xsDA0AQKgBQGBgbTEeZ5mHdPgwKgawQke1zx+xEUADNHaOyDvT0aAKMpYDQLjJYBo4XgaC0wgkNgtBocrQZHq8HRanC0GhzBlQBtO0PSoqxsD5epxTIzMTCDAvnnn/+/pcJuLn738e8fcgP9/17tNGS9jM5XZ5FrFs17g53pEpplYcK2yA6sX/hqf9Oi17fJdfSQCoAbC9X81GVYJZA9e/nBz6d6yXe2DvsAMFTl5Dk3UymS4T84m8HBfwaG/3opd5dduf/jKzmBMGRSwNwSacMkTwGsY40zt3w4mdH/9OKwDoCnq9XDpIRYBLB58umbP+9lwm+uHrYB4GvJK7KpRS4I5sGfv///ArHZWRnZYGI+1Y/WbT3x+Q2pgTAkssD6JjnLAGteXZjn9p77evMfA8N/VyNuDZjYhmOfrwTWPjo27AKAlZWJ8c06jWg+Lkb4REtsx9PNf/4y/F9eLe0H8/CX7/++iwTeXPLz97//pATCoE8BqT5CMrMKJb1gnnr76e8XseBby/79+8fwcp1GhBg/Mx9MLmfK8x1T1797NKwC4EC/oqO9HpcqzFNL9346F9P2+AyIj14zHLv27Z517v09wyYAhPiZWZ6v0ohlY2FghXnKOv/BymNXvoImJBn0VDh5Ls5CtA3+/GX4Kx95a/Gzt7/BhSQxYFBngdpYUdWmBDFHmEfuPPv1UjX29kZkj12aq+Ktq8AuDRPrWP72UOWcFzeI8TxIzaAOgAuzVbz0ldhlYJ7pWvn2SPmsF9eQPVcdI6bSkijqBBO7+eT3C434W5uGfACoyXBw3ligHM3IyMAE8szffwx/FaNvL3n86tdPZM/xczMzv1ijHsvBhmgTmGXfW3H6xvdPxATCoE0Bk3KkdHMDBS1hnjh+/cc9q5y7WAu4HR0Kdu6miDbBwl0fziZ0Pj07pAPg3lK1IEUJVhGYJ07d/P7gyr2fr7F5SlWGXdBWl1MFJvf6499PYkE3VgzZALDT5xY42KcQRowHcKkJb3m6adX+Dy8ImTEos8DSahnTKCd+Q0KOxye/88yX6x7lDw8TMmPQBQATExPDy7VqkSJ8zLyEHI9P/vuv/z/Fg28u+fzt71986gZdAEQ4CUggt/HffPr7ecfpr0QNednrcsnLirEIwzxcOvPlnp5Vb+4NqQDY1iFv62nKowlzNCmDHZVRYsptyaLOML1nb/14aJJ5d+eQCQAuDmam1+vUY7nYGdnBrTQGhv86KXeXXrv/A7QEjSDg5WJmfrlGPZaTHdIm+Pef4Z9a/O0ld5/++oFL86DKAgUhwgr9mRJuMMdeuvfziX7qnW0EfY6kYFu7vI2nGY8WTGjiunfHCqY+vzIkAuD4FCVXC01ORZhjaxe83tey+NUdUgIgwIZfbH2jTABMz/0Xv98oRd9aN+gDQEqYle3hcrVYFmbKJz3Qxw8dix+uPnDhy3tsgTBoskBrsoRGVZSwHcyRe89/veVS8uAAKbEPUzujUFo/3UfAHMZfdfDzhfCmR6cGdQBcX6DqqyHLJglzZHznsy2Ldr1/Rk4AaMpzcF2dqxwF60i9//Lvq2jQzaV///7DMG7QpAByPDoY9YwukRldIjO6RGZ0iczoEpnBWDrTy02jtcBoLTBaC4zWAqO1AL1K3MFoz2gtMLpxcnTrLHjn+IjePA0qm0bs9nkAIYI51Zc27kMAAAAASUVORK5CYII=');\n    }\n  \n    .video-wrap .countdown {\n      position: absolute;\n      top: 94px;\n      left: 50%;\n      margin-left: -120px;\n      width: 240px;\n      height: 240px;\n      border-radius: 120px;\n      background: rgba(0, 0, 0, 0.5);\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      font-size: 120px;\n      font-family: DINAlternate-Bold, DINAlternate;\n      font-weight: bold;\n      color: #ffffff;\n    }\n  \n    .video-wrap .record-timer {\n      position: absolute;\n      top: 11px;\n      left: 50%;\n      margin-left: -40px;\n      display: inline-block;\n      width: 80px;\n      text-align: center;\n      height: 21px;\n      font-size: 18px;\n      font-family: DINAlternate-Bold, DINAlternate;\n      font-weight: bold;\n      color: #ffffff;\n      line-height: 21px;\n      text-shadow: 0px 2px 3px rgba(0, 0, 0, 0.5);\n    }\n  \n    #asr-result-wrapper {\n      position: absolute;\n      left: 0;\n      right: 0;\n      top: 330px;\n      height: 50px;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      text-align: center;\n      overflow: hidden;\n    }\n  \n    #asr-result {\n      font-size: 18px;\n      font-weight: 400;\n      color: #ffffff;\n      line-height: 25px;\n      text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.5);\n      margin: 0;\n      bottom: 0;\n      left: 0;\n      right: 0;\n      padding: 0 40px;\n      position: absolute;\n    }\n  \n    #asr-result .highlight {\n      color: #f5a623;\n      font-weight: bold;\n    }\n  \n    .hidden {\n      opacity: 0 !important;\n    }\n  </style>\n  \n  <div class=\"video-wrap\">\n    <div class=\"audio-wrap\">\n      <i class=\"icon voice\"></i>\n      <canvas id=\"audio-canvas\" width=\"110px\" height=\"8px\"></canvas>\n      <i id=\"volume-crackle\" class=\"icon crackle\"></i>\n    </div>\n    <video id=\"video\" muted></video>\n    <div class=\"body-shape-container\">\n      <div class=\"body-horizontal-line\">\n        <p id=\"body-horizontal-text\"></p>\n      </div>\n      <div class=\"body-shape\"></div>\n    </div>\n    <canvas id=\"video-canvas\" width=\"862px\" height=\"485px\"></canvas>\n    <div id=\"asr-result-wrapper\">\n      <p id=\"asr-result\"></p>\n    </div>\n    <i class=\"icon-act shape\">\n      <span class=\"tooltip\" id=\"tooltip-shape\">参考线</span>\n    </i>\n    <i class=\"icon-act ai\">\n      <span class=\"tooltip\" id=\"tooltip-ai\">AI视图</span>\n    </i>\n    <i class=\"icon-record\"></i>\n    <div class=\"countdown hidden\">5</div>\n    <span class=\"record-timer hidden\">00:00</span>\n  </div>\n  ";

class VideoCanvas extends Component {
  constructor(recorder) {
    super(recorder);

    this.videoEl = document.querySelector('#video');
    this.videoElWidth = this.videoEl.getBoundingClientRect().width;
    this.videoElHeight = this.videoEl.getBoundingClientRect().height;

    this.audioCanvasWrapEl = document.querySelector('.video-wrap .audio-wrap');
    this.audioCanvasEl = document.getElementById('audio-canvas');
    this.audioCanvasElWidth = this.audioCanvasEl.width;
    this.audioCanvasElHeight = this.audioCanvasEl.height;
    this.audioCtx = this.audioCanvasEl.getContext('2d');

    this.videoCanvasEl = document.getElementById('video-canvas');
    this.videoCanvasElWidth = this.videoCanvasEl.width;
    this.videoCanvasElHeight = this.videoCanvasEl.height;
    this.videoCtx = this.videoCanvasEl.getContext('2d');

    this.fakeCanvas = document.createElement('canvas');
    this.fakeCanvas.width = PREDICT_SIZE;
    this.fakeCanvas.height = PREDICT_SIZE;
    this.fakeCanvasCtx = this.fakeCanvas.getContext('2d', {
      alpha: false,
      willReadFrequently: true
    });

    this.previewCanvas = document.createElement('canvas');
    this.previewCanvas.width = this.options.preview.width;
    this.previewCanvas.height = this.options.preview.height;
    this.previewCanvasCtx = this.previewCanvas.getContext('2d', {
      alpha: false,
      willReadFrequently: true
    });

    this.asrResultEl = document.getElementById('asr-result');
    this.horizontalLineHintText = document.getElementById(
      'body-horizontal-text'
    );
    this.horizontalLineHintText.innerText = this.options.horizontalLineHintText;
    this.volumeCrackleEl = document.getElementById('volume-crackle');

    this.videoEl.onloadeddata = this.options.onPreviewVideoLoadedData;
    this.videoEl.srcObject = this.recorder.getMediaStream();
    this.videoEl.play();

    this.recorder.setPredictWorkerMessageHandler(
      this.onFacePredictWorkerMessage
    );

    this.recorder.setOnVolumeChangeCallback(this.onVolumeChange);

    this.recorder.setOnRecognitionResultChangeHandler(
      this.onASRRecognitionResultChange
    );

    if (this.options.isDisplayAsrText) {
      this.asrResultEl.classList.remove('hidden');
    } else {
      this.asrResultEl.classList.add('hidden');
    }

    this.recorder.onRecordStartCallbacks.push(this.onRecordStart);
    this.recorder.onRecordStopCallbacks.push(this.onRecordStop);
  }

  onRecordStart = () => {
    this.startPredict();
  };

  onRecordStop = () => {
    const mediaStream = this.videoEl.srcObject;
    if (mediaStream) {
      const tracks = mediaStream.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  onVolumeChange = dbValue => {
    this.drawSoundValue(dbValue);
  };

  onFacePredictWorkerMessage = data => {
    const { recordStatus } = this.recorder;
    if (
      recordStatus === 'init' ||
      recordStatus === 'stopping' ||
      recordStatus === 'stopped'
    ) {
      return;
    }

    const { message } = data;

    if (message === EWorkerMessage.PREDICT_SUCCESS) {
      if (this.recorder.showAiLayer) {
        drawFaceCanvas(
          this.videoCtx,
          data.output,
          this.videoCanvasElWidth,
          this.videoCanvasElHeight
        );
      } else {
        this.videoCtx.clearRect(0, 0, this.videoElWidth, this.videoElHeight);
      }

      this.startPredict();
      if (this.options.onGetOriginPredictData) {
        this.options.onGetOriginPredictData(data.originData);
      }
    }
  };

  onASRRecognitionResultChange = currentText => {
    const { keywords } = this.options;
    if (keywords.length === 0 || !this.options.needHighlightKeywords) {
      this.asrResultEl.innerText = currentText;
    } else {
      this.asrResultEl.innerHTML = addKeywordHighlight(currentText, keywords);
    }
  };

  drawSoundValue = volume => {
    // 清空音量画布
    this.audioCtx.clearRect(
      0,
      0,
      this.audioCanvasElWidth,
      this.audioCanvasElHeight
    );

    if (volume > 0.95) {
      this.volumeCrackleEl.style.visibility = 'visible';
    } else {
      this.volumeCrackleEl.style.visibility = 'hidden';
    }

    const xEndPos = volume * this.audioCanvasElWidth;
    drawSoundValueCanvas(this.audioCtx, xEndPos, volume);
  };

  drawVideoFrame = id => {
    const videoWidth = this.options.video.width;
    const videoHeight = this.options.video.height;
    const previewData = getPreviewImageDataFromVideoElement({
      id,
      videoElement: this.videoEl,
      videoWidth,
      videoHeight,
      width: this.options.preview.width,
      height: this.options.preview.height,
      previewCanvas: this.previewCanvas,
      previewCanvasCtx: this.previewCanvasCtx
    });
    return previewData;
  };

  startPredict = () => {
    const videoWidth = this.options.video.width;
    const videoHeight = this.options.video.height;

    const predictData = getPredictImageDataFromVideoElement({
      ctx: this.fakeCanvasCtx,
      videoElement: this.videoEl,
      videoWidth,
      videoHeight,
      predictSize: PREDICT_SIZE
    });

    const previewData = this.drawVideoFrame(predictData.id);
    this.recorder.predictAIFaceWithData(predictData, previewData);
  };
}

function createPreflightPredictImageData() {
  const width = 320;
  const height = 320;

  const imageData = {
    id: 'preflight',
    buffer: new ArrayBuffer(width * height * 4),
    width,
    height
  };

  return imageData;
}

const defaultOptions$1 = {
  sendPreflightOnModelLoad: true
};

class FacePredictWorker {
  constructor(workerUrl, options = {}) {
    this.workerUrl = workerUrl;
    this.options = { ...defaultOptions$1, ...options };
    this.onWorkerMessageHandlers = [];
    this.setupWorker();
  }

  setupWorker = () => {
    this.worker = new Worker(this.workerUrl);
    this.worker.onmessage = this.onWorkerMessage;
  };

  onWorkerMessage = evt => {
    const data = evt.data;

    if (
      data.message === EWorkerMessage.LOAD_MODEL_SUCCESS &&
      this.options.sendPreflightOnModelLoad
    ) {
      this.sendPreflightPredict();
    }

    if (this.onWorkerMessageHandlers.length > 0) {
      this.onWorkerMessageHandlers.forEach(handler => {
        if (handler && typeof handler === 'function') {
          handler(data);
        }
      });
    }
  };

  sendPreflightPredict() {
    this.predictFaceWithData(createPreflightPredictImageData());
  }

  addPredictWorkerMessageHandler = handler => {
    this.onWorkerMessageHandlers.push(handler);
  };

  clearPredictWorkerMessageHandlers() {
    this.onWorkerMessageHandlers = [];
  }

  predictFaceWithData = data => {
    this.worker.postMessage(
      {
        id: data.id,
        buffer: data.buffer,
        width: data.width,
        height: data.height
      },
      [data.buffer]
    );
  };
}

const DEFAULT_SCORE = 3;
const EYE_GROUP_LEN = 10;

/**
 * 获取ARS返回结果的录制时长 分钟为单位
 * @param sentences 腾讯ASR返回数据
 * @returns 录制分钟数
 */
function getASRSentencesDuration(sentences) {
  const sentencesCount = sentences.length;
  if (sentencesCount === 0) {
    return 0;
  }

  const firstSentences = sentences[0];
  const lastSentences = sentences[sentencesCount - 1];

  const startTime = firstSentences.start_time;
  const endTime = lastSentences.end_time;
  const duration = endTime - startTime; // ms

  const minutes = duration / 1000 / 60;

  return minutes;
}

/**
 * 计算腾讯语音转文字每分钟多少字符
 * @param 腾讯ASR
 * @returns 每分钟多少字符
 */
function getASRSentencesSpeed(sentences) {
  const duration = getASRSentencesDuration(sentences);
  if (duration === 0) {
    return '0';
  }

  // 总体的字符数，包括逗号、句号、问号
  let totalText = '';
  sentences.forEach(sentence => {
    totalText += sentence.voice_text_str;
  });

  // 去除逗号、句号、问号后的字符总长度
  // const totalCharLength = totalText.replace(/，|。|？/g, '').length
  const totalCharLength = totalText.length;
  const charLengthPerMinutes = totalCharLength / duration;

  return charLengthPerMinutes;
}

function parseSentenceData(sentenceData) {
  return sentenceData.map((sentence) => ({ start_time: sentence.start_time, end_time: sentence.end_time }));
}

function getHandAverage(handCount, recordSeconds) {
  const handAverage = (handCount / recordSeconds) * 60;
  return handAverage;
}

function getSightAverage(totalEyeCount, passedEyeCount) {
  if (totalEyeCount === 0) {
    return '0';
  }

  const average = totalEyeCount == 0 ? 0 : passedEyeCount / totalEyeCount;
  return average;
}

function getSmileAverage(smileCount, aiSize, smilePassLine) {
  let smileAverage = 0;

  if (smileCount < 1) {
    smileAverage = smilePassLine;
  } else if (smileCount < 2) {
    smileAverage = smilePassLine;
  } else {
    smileAverage = Math.min(
      1,
      smilePassLine + (1 - smilePassLine) * ((4 * smileCount) / aiSize)
    );
  }

  return smileAverage;
}

function getVolumeAverage(soundVolumes, volumeThreshold) {
  if (soundVolumes.length === 0) {
    return '0';
  }
  let valueTotal = 0;
  let volumeCount = 0;

  soundVolumes.forEach(item => {
    if (item > volumeThreshold) {
      volumeCount += 1;
      valueTotal += item;
    }
  });

  const volumeAverage = (valueTotal / volumeCount) * 100;
  return volumeAverage;
}

function getSmileScore(smileCount, aiSize) {
  let newScore = DEFAULT_SCORE * 10;
  if (!aiSize || !smileCount) {
    return 0;
  } else if (smileCount < 4) {
    newScore += smileCount;
    return newScore / 10;
  }
  const smileRate = smileCount / aiSize;
  const scoreLevelList = [
    1 / 300,
    2 / 300,
    3 / 300,
    4 / 300,
    1 / 60,
    4 / 180,
    5 / 180,
    6 / 180,
    1 / 10,
    2 / 10,
    3 / 10,
    4 / 10,
    5 / 10,
    0.6,
    0.8,
    1
  ];
  newScore = newScore + 4;
  for (let i = 0; i < scoreLevelList.length; i++) {
    const rate = scoreLevelList[i];
    newScore++;
    if (smileRate <= rate) {
      break;
    }
  }
  return newScore / 10;
}

function getSightScore(passedEyeCount, totalEyeCount) {
  if (!passedEyeCount) {
    return 0;
  } else {
    const ratio = passedEyeCount / totalEyeCount;
    const num = Math.round(1.9 * ratio * 10) / 10;
    return 3.1 + num;
  }
}

function getHandScore(handCount, aiSize) {
  if (!handCount) {
    return 0;
  }
  const handRate = handCount / aiSize;
  if (handRate > 0.52) {
    return 5;
  }
  const handLevelList = [
    0.005, 0.01, 0.015, 0.02, 0.04, 0.06, 0.08, 0.1, 0.12, 0.16, 0.2, 0.24,
    0.28, 0.32, 0.36, 0.4, 0.44, 0.48, 0.52
  ];
  let newScore = DEFAULT_SCORE * 10;

  for (let i = 0; i < handLevelList.length; i++) {
    const rate = handLevelList[i];
    newScore++;
    if (handRate <= rate) {
      break;
    }
  }

  return newScore / 10;
}

function parseAIFacePredictData({ aiPredictResult, smileThreshold }) {
  let smileCount = 0;
  let handCount = 0;
  let totalEyeCount = 0;
  let passedEyeCount = 0;

  aiPredictResult.forEach(item => {
    const { hands, faces } = item;
    if (hands.length > 0) {
      handCount += item.hands.length;
    }
    if (faces.length > 0) {
      // 累加脸部数量
      totalEyeCount += faces.length;

      faces.forEach(face => {
        // 微笑程度大于0.2判断为微笑，微笑数量加1。
        if (face.smileRate > smileThreshold) {
          smileCount += 1;
        }

        // 眼珠偏移水平中心点距离占水平半径的比例，与眼珠偏移垂直中心点距离占垂直半径的比例，两者平均值小于0.2，当作眼睛居中了，认为眼神自信，自信数量加一。
        const eyesCount = Math.round(face.eyesPos.length / EYE_GROUP_LEN);
        let ratio = 0;
        for (let i = 0; i < eyesCount; i++) {
          const startIndex = i * EYE_GROUP_LEN;
          const eyePos = face.eyesPos.slice(
            startIndex,
            startIndex + EYE_GROUP_LEN
          );

          const ey1 = eyePos[1];
          const ey2 = eyePos[3];
          const ey3 = eyePos[9];

          const ex1 = eyePos[4];
          const ex2 = eyePos[6];
          const ex3 = eyePos[8];

          const horizontalRatio = Math.abs(
            ((ey1 + ey2) / 2 - ey3) / (ey1 - ey2)
          );
          const verticalRatio = Math.abs(((ex1 + ex2) / 2 - ex3) / (ex1 - ex2));
          const sightRatio = horizontalRatio + verticalRatio;
          ratio += sightRatio;
        }
        ratio /= eyesCount;

        if (ratio < 0.2) {
          passedEyeCount += 1;
        }
      });
    }
  });

  return {
    smileCount,
    handCount,
    totalEyeCount,
    passedEyeCount
  };
}

function calculateAIScore({
  recordSeconds,
  aiPredictResult,
  soundVolumes,
  totalSentences,
  config: { smileThreshold, volumeThreshold, smilePassLine }
}) {
  const aiSize = aiPredictResult.length;

  const { smileCount, handCount, totalEyeCount, passedEyeCount } =
    parseAIFacePredictData({
      aiPredictResult,
      smileThreshold
    });

  const handAverage = getHandAverage(handCount, recordSeconds);
  const sightAverage = getSightAverage(totalEyeCount, passedEyeCount);
  const smileAverage = getSmileAverage(smileCount, aiSize, smilePassLine);
  const volumeAverage = getVolumeAverage(soundVolumes, volumeThreshold);

  const asr = totalSentences
    ? {
        charLengthPerMinutes: getASRSentencesSpeed(totalSentences),
        duration: getASRSentencesDuration(totalSentences),
        totalSentences: parseSentenceData(totalSentences)
      }
    : undefined;

  const smileScore = getSmileScore(smileCount, aiSize);
  const sightScore = getSightScore(passedEyeCount, totalEyeCount);
  const handScore = getHandScore(handCount, aiSize);

  return {
    handAverage,
    sightAverage,
    smileAverage,
    volumeAverage,
    asr,

    scoreMap: {
      smileScore,
      sightScore,
      handScore
    }
  };
}

class LayerVisibleIcons extends Component {
  constructor(recorder) {
    super(recorder);

    this.bodyShapeLayer = document.querySelector('.body-shape-container');
    this.bodyShapeHintText = document.getElementById('body-horizontal-text');
    this.aiIconEl = document.querySelector('.icon-act.ai');
    this.shapeIconEl = document.querySelector('.icon-act.shape');
    this.aiIconTooltipEl = document.getElementById('tooltip-ai');
    this.shapeIconTooltipEl = document.getElementById('tooltip-shape');


    if (this.options.isAIOn || this.options.isShowBodyShapeLayer) {
      this.toggleAiStatus = this.toggleAiStatus.bind(this);
      this.clickToggleAiStatus = this.clickToggleAiStatus.bind(this);
      this.toggleShapeStatus = this.toggleShapeStatus.bind(this);
      this.clickToggleShapeStatus = this.clickToggleShapeStatus.bind(this);
      this.startHintHiddenTimer = this.startHintHiddenTimer.bind(this);

      this.startHintHiddenTimer();
      this.aiIconTooltipEl.innerText = this.options.tooltipText.ai;
      this.shapeIconTooltipEl.innerText = this.options.tooltipText.shape;
      this.bodyShapeLayer.classList.add(recorder.options.recordingMode);
    } else {
      this.bodyShapeLayer.classList.add('hidden');
      this.bodyShapeLayer.classList.add(recorder.options.recordingMode);
      this.bodyShapeHintText.classList.add('hidden');
      this.aiIconEl.classList.add('hidden');
      this.shapeIconEl.classList.add('hidden');
    }
  }

  startHintHiddenTimer() {
    this.hiddenTimer = setInterval(() => {
      if (this.bodyShapeHintTimeRemain > 0) {
        this.bodyShapeHintTimeRemain -= 1;
      } else {
        this.bodyShapeHintText.classList.add('hidden');
        clearInterval(this.hiddenTimer);
      }
    }, 1 * 1000);
  }

  clickToggleAiStatus() {
    if (isInTouchableDevice) {
      return;
    }
    this.toggleAiStatus();
  }

  toggleAiStatus() {
    this.recorder.toggleAiLayerVisible();
    const { showAiLayer } = this.recorder;
    if (showAiLayer) {
      this.aiIconEl.classList.remove('disabled');
    } else {
      this.aiIconEl.classList.add('disabled');
    }
  }

  clickToggleShapeStatus() {
    if (isInTouchableDevice) {
      return;
    }
    this.toggleShapeStatus();
  }

  toggleShapeStatus() {
    this.recorder.toggleShapeLayerVisible();
    const { showShapeLayer } = this.recorder;

    if (showShapeLayer) {
      this.shapeIconEl.classList.remove('disabled');
      this.bodyShapeLayer.classList.remove('hidden');
      this.bodyShapeHintText.classList.remove('hidden');
      this.bodyShapeHintTimeRemain = HIDDEN_TIME_IN_SECONDS;
      this.startHintHiddenTimer();
    } else {
      this.shapeIconEl.classList.add('disabled');
      this.bodyShapeLayer.classList.add('hidden');
    }
  }

  bindEvent() {
    this.aiIconEl.addEventListener('click', this.clickToggleAiStatus);
    this.aiIconEl.addEventListener('touchend', this.toggleAiStatus);
    this.shapeIconEl.addEventListener('click', this.clickToggleShapeStatus);
    this.shapeIconEl.addEventListener('touchend', this.toggleShapeStatus);
  }

  unBindEvent() {
    this.aiIconEl.removeEventListener('click', this.clickToggleAiStatus);
    this.aiIconEl.removeEventListener('touchend', this.toggleAiStatus);
    this.shapeIconEl.removeEventListener('click', this.clickToggleShapeStatus);
    this.shapeIconEl.removeEventListener('touchend', this.toggleShapeStatus);
  }
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __values(o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

var Event = /** @class */ (function () {
    function Event(type, target) {
        this.target = target;
        this.type = type;
    }
    return Event;
}());
var ErrorEvent = /** @class */ (function (_super) {
    __extends(ErrorEvent, _super);
    function ErrorEvent(error, target) {
        var _this = _super.call(this, 'error', target) || this;
        _this.message = error.message;
        _this.error = error;
        return _this;
    }
    return ErrorEvent;
}(Event));
var CloseEvent = /** @class */ (function (_super) {
    __extends(CloseEvent, _super);
    function CloseEvent(code, reason, target) {
        if (code === void 0) { code = 1000; }
        if (reason === void 0) { reason = ''; }
        var _this = _super.call(this, 'close', target) || this;
        _this.wasClean = true;
        _this.code = code;
        _this.reason = reason;
        return _this;
    }
    return CloseEvent;
}(Event));

/*!
 * Reconnecting WebSocket
 * by Pedro Ladaria <pedro.ladaria@gmail.com>
 * https://github.com/pladaria/reconnecting-websocket
 * License MIT
 */
var getGlobalWebSocket = function () {
    if (typeof WebSocket !== 'undefined') {
        // @ts-ignore
        return WebSocket;
    }
};
/**
 * Returns true if given argument looks like a WebSocket class
 */
var isWebSocket = function (w) { return typeof w !== 'undefined' && !!w && w.CLOSING === 2; };
var DEFAULT = {
    maxReconnectionDelay: 10000,
    minReconnectionDelay: 1000 + Math.random() * 4000,
    minUptime: 5000,
    reconnectionDelayGrowFactor: 1.3,
    connectionTimeout: 4000,
    maxRetries: Infinity,
    maxEnqueuedMessages: Infinity,
    startClosed: false,
    debug: false,
};
var ReconnectingWebSocket = /** @class */ (function () {
    function ReconnectingWebSocket(url, protocols, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        this._listeners = {
            error: [],
            message: [],
            open: [],
            close: [],
        };
        this._retryCount = -1;
        this._shouldReconnect = true;
        this._connectLock = false;
        this._binaryType = 'blob';
        this._closeCalled = false;
        this._messageQueue = [];
        /**
         * An event listener to be called when the WebSocket connection's readyState changes to CLOSED
         */
        this.onclose = null;
        /**
         * An event listener to be called when an error occurs
         */
        this.onerror = null;
        /**
         * An event listener to be called when a message is received from the server
         */
        this.onmessage = null;
        /**
         * An event listener to be called when the WebSocket connection's readyState changes to OPEN;
         * this indicates that the connection is ready to send and receive data
         */
        this.onopen = null;
        this._handleOpen = function (event) {
            _this._debug('open event');
            var _a = _this._options.minUptime, minUptime = _a === void 0 ? DEFAULT.minUptime : _a;
            clearTimeout(_this._connectTimeout);
            _this._uptimeTimeout = setTimeout(function () { return _this._acceptOpen(); }, minUptime);
            _this._ws.binaryType = _this._binaryType;
            // send enqueued messages (messages sent before websocket open event)
            _this._messageQueue.forEach(function (message) { return _this._ws.send(message); });
            _this._messageQueue = [];
            if (_this.onopen) {
                _this.onopen(event);
            }
            _this._listeners.open.forEach(function (listener) { return _this._callEventListener(event, listener); });
        };
        this._handleMessage = function (event) {
            _this._debug('message event');
            if (_this.onmessage) {
                _this.onmessage(event);
            }
            _this._listeners.message.forEach(function (listener) { return _this._callEventListener(event, listener); });
        };
        this._handleError = function (event) {
            _this._debug('error event', event.message);
            _this._disconnect(undefined, event.message === 'TIMEOUT' ? 'timeout' : undefined);
            if (_this.onerror) {
                _this.onerror(event);
            }
            _this._debug('exec error listeners');
            _this._listeners.error.forEach(function (listener) { return _this._callEventListener(event, listener); });
            _this._connect();
        };
        this._handleClose = function (event) {
            _this._debug('close event');
            _this._clearTimeouts();
            if (_this._shouldReconnect) {
                _this._connect();
            }
            if (_this.onclose) {
                _this.onclose(event);
            }
            _this._listeners.close.forEach(function (listener) { return _this._callEventListener(event, listener); });
        };
        this._url = url;
        this._protocols = protocols;
        this._options = options;
        if (this._options.startClosed) {
            this._shouldReconnect = false;
        }
        this._connect();
    }
    Object.defineProperty(ReconnectingWebSocket, "CONNECTING", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket, "OPEN", {
        get: function () {
            return 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket, "CLOSING", {
        get: function () {
            return 2;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket, "CLOSED", {
        get: function () {
            return 3;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket.prototype, "CONNECTING", {
        get: function () {
            return ReconnectingWebSocket.CONNECTING;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket.prototype, "OPEN", {
        get: function () {
            return ReconnectingWebSocket.OPEN;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket.prototype, "CLOSING", {
        get: function () {
            return ReconnectingWebSocket.CLOSING;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket.prototype, "CLOSED", {
        get: function () {
            return ReconnectingWebSocket.CLOSED;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket.prototype, "binaryType", {
        get: function () {
            return this._ws ? this._ws.binaryType : this._binaryType;
        },
        set: function (value) {
            this._binaryType = value;
            if (this._ws) {
                this._ws.binaryType = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket.prototype, "retryCount", {
        /**
         * Returns the number or connection retries
         */
        get: function () {
            return Math.max(this._retryCount, 0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket.prototype, "bufferedAmount", {
        /**
         * The number of bytes of data that have been queued using calls to send() but not yet
         * transmitted to the network. This value resets to zero once all queued data has been sent.
         * This value does not reset to zero when the connection is closed; if you keep calling send(),
         * this will continue to climb. Read only
         */
        get: function () {
            var bytes = this._messageQueue.reduce(function (acc, message) {
                if (typeof message === 'string') {
                    acc += message.length; // not byte size
                }
                else if (message instanceof Blob) {
                    acc += message.size;
                }
                else {
                    acc += message.byteLength;
                }
                return acc;
            }, 0);
            return bytes + (this._ws ? this._ws.bufferedAmount : 0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket.prototype, "extensions", {
        /**
         * The extensions selected by the server. This is currently only the empty string or a list of
         * extensions as negotiated by the connection
         */
        get: function () {
            return this._ws ? this._ws.extensions : '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket.prototype, "protocol", {
        /**
         * A string indicating the name of the sub-protocol the server selected;
         * this will be one of the strings specified in the protocols parameter when creating the
         * WebSocket object
         */
        get: function () {
            return this._ws ? this._ws.protocol : '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket.prototype, "readyState", {
        /**
         * The current state of the connection; this is one of the Ready state constants
         */
        get: function () {
            if (this._ws) {
                return this._ws.readyState;
            }
            return this._options.startClosed
                ? ReconnectingWebSocket.CLOSED
                : ReconnectingWebSocket.CONNECTING;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket.prototype, "url", {
        /**
         * The URL as resolved by the constructor
         */
        get: function () {
            return this._ws ? this._ws.url : '';
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Closes the WebSocket connection or connection attempt, if any. If the connection is already
     * CLOSED, this method does nothing
     */
    ReconnectingWebSocket.prototype.close = function (code, reason) {
        if (code === void 0) { code = 1000; }
        this._closeCalled = true;
        this._shouldReconnect = false;
        this._clearTimeouts();
        if (!this._ws) {
            this._debug('close enqueued: no ws instance');
            return;
        }
        if (this._ws.readyState === this.CLOSED) {
            this._debug('close: already closed');
            return;
        }
        this._ws.close(code, reason);
    };
    /**
     * Closes the WebSocket connection or connection attempt and connects again.
     * Resets retry counter;
     */
    ReconnectingWebSocket.prototype.reconnect = function (code, reason) {
        this._shouldReconnect = true;
        this._closeCalled = false;
        this._retryCount = -1;
        if (!this._ws || this._ws.readyState === this.CLOSED) {
            this._connect();
        }
        else {
            this._disconnect(code, reason);
            this._connect();
        }
    };
    /**
     * Enqueue specified data to be transmitted to the server over the WebSocket connection
     */
    ReconnectingWebSocket.prototype.send = function (data) {
        if (this._ws && this._ws.readyState === this.OPEN) {
            this._debug('send', data);
            this._ws.send(data);
        }
        else {
            var _a = this._options.maxEnqueuedMessages, maxEnqueuedMessages = _a === void 0 ? DEFAULT.maxEnqueuedMessages : _a;
            if (this._messageQueue.length < maxEnqueuedMessages) {
                this._debug('enqueue', data);
                this._messageQueue.push(data);
            }
        }
    };
    /**
     * Register an event handler of a specific event type
     */
    ReconnectingWebSocket.prototype.addEventListener = function (type, listener) {
        if (this._listeners[type]) {
            // @ts-ignore
            this._listeners[type].push(listener);
        }
    };
    ReconnectingWebSocket.prototype.dispatchEvent = function (event) {
        var e_1, _a;
        var listeners = this._listeners[event.type];
        if (listeners) {
            try {
                for (var listeners_1 = __values(listeners), listeners_1_1 = listeners_1.next(); !listeners_1_1.done; listeners_1_1 = listeners_1.next()) {
                    var listener = listeners_1_1.value;
                    this._callEventListener(event, listener);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (listeners_1_1 && !listeners_1_1.done && (_a = listeners_1.return)) _a.call(listeners_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        return true;
    };
    /**
     * Removes an event listener
     */
    ReconnectingWebSocket.prototype.removeEventListener = function (type, listener) {
        if (this._listeners[type]) {
            // @ts-ignore
            this._listeners[type] = this._listeners[type].filter(function (l) { return l !== listener; });
        }
    };
    ReconnectingWebSocket.prototype._debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this._options.debug) {
            // not using spread because compiled version uses Symbols
            // tslint:disable-next-line
            console.log.apply(console, __spread(['RWS>'], args));
        }
    };
    ReconnectingWebSocket.prototype._getNextDelay = function () {
        var _a = this._options, _b = _a.reconnectionDelayGrowFactor, reconnectionDelayGrowFactor = _b === void 0 ? DEFAULT.reconnectionDelayGrowFactor : _b, _c = _a.minReconnectionDelay, minReconnectionDelay = _c === void 0 ? DEFAULT.minReconnectionDelay : _c, _d = _a.maxReconnectionDelay, maxReconnectionDelay = _d === void 0 ? DEFAULT.maxReconnectionDelay : _d;
        var delay = 0;
        if (this._retryCount > 0) {
            delay =
                minReconnectionDelay * Math.pow(reconnectionDelayGrowFactor, this._retryCount - 1);
            if (delay > maxReconnectionDelay) {
                delay = maxReconnectionDelay;
            }
        }
        this._debug('next delay', delay);
        return delay;
    };
    ReconnectingWebSocket.prototype._wait = function () {
        var _this = this;
        return new Promise(function (resolve) {
            setTimeout(resolve, _this._getNextDelay());
        });
    };
    ReconnectingWebSocket.prototype._getNextUrl = function (urlProvider) {
        if (typeof urlProvider === 'string') {
            return Promise.resolve(urlProvider);
        }
        if (typeof urlProvider === 'function') {
            var url = urlProvider();
            if (typeof url === 'string') {
                return Promise.resolve(url);
            }
            if (!!url.then) {
                return url;
            }
        }
        throw Error('Invalid URL');
    };
    ReconnectingWebSocket.prototype._connect = function () {
        var _this = this;
        if (this._connectLock || !this._shouldReconnect) {
            return;
        }
        this._connectLock = true;
        var _a = this._options, _b = _a.maxRetries, maxRetries = _b === void 0 ? DEFAULT.maxRetries : _b, _c = _a.connectionTimeout, connectionTimeout = _c === void 0 ? DEFAULT.connectionTimeout : _c, _d = _a.WebSocket, WebSocket = _d === void 0 ? getGlobalWebSocket() : _d;
        if (this._retryCount >= maxRetries) {
            this._debug('max retries reached', this._retryCount, '>=', maxRetries);
            return;
        }
        this._retryCount++;
        this._debug('connect', this._retryCount);
        this._removeListeners();
        if (!isWebSocket(WebSocket)) {
            throw Error('No valid WebSocket class provided');
        }
        this._wait()
            .then(function () { return _this._getNextUrl(_this._url); })
            .then(function (url) {
            // close could be called before creating the ws
            if (_this._closeCalled) {
                return;
            }
            _this._debug('connect', { url: url, protocols: _this._protocols });
            _this._ws = _this._protocols
                ? new WebSocket(url, _this._protocols)
                : new WebSocket(url);
            _this._ws.binaryType = _this._binaryType;
            _this._connectLock = false;
            _this._addListeners();
            _this._connectTimeout = setTimeout(function () { return _this._handleTimeout(); }, connectionTimeout);
        });
    };
    ReconnectingWebSocket.prototype._handleTimeout = function () {
        this._debug('timeout event');
        this._handleError(new ErrorEvent(Error('TIMEOUT'), this));
    };
    ReconnectingWebSocket.prototype._disconnect = function (code, reason) {
        if (code === void 0) { code = 1000; }
        this._clearTimeouts();
        if (!this._ws) {
            return;
        }
        this._removeListeners();
        try {
            this._ws.close(code, reason);
            this._handleClose(new CloseEvent(code, reason, this));
        }
        catch (error) {
            // ignore
        }
    };
    ReconnectingWebSocket.prototype._acceptOpen = function () {
        this._debug('accept open');
        this._retryCount = 0;
    };
    ReconnectingWebSocket.prototype._callEventListener = function (event, listener) {
        if ('handleEvent' in listener) {
            // @ts-ignore
            listener.handleEvent(event);
        }
        else {
            // @ts-ignore
            listener(event);
        }
    };
    ReconnectingWebSocket.prototype._removeListeners = function () {
        if (!this._ws) {
            return;
        }
        this._debug('removeListeners');
        this._ws.removeEventListener('open', this._handleOpen);
        this._ws.removeEventListener('close', this._handleClose);
        this._ws.removeEventListener('message', this._handleMessage);
        // @ts-ignore
        this._ws.removeEventListener('error', this._handleError);
    };
    ReconnectingWebSocket.prototype._addListeners = function () {
        if (!this._ws) {
            return;
        }
        this._debug('addListeners');
        this._ws.addEventListener('open', this._handleOpen);
        this._ws.addEventListener('close', this._handleClose);
        this._ws.addEventListener('message', this._handleMessage);
        // @ts-ignore
        this._ws.addEventListener('error', this._handleError);
    };
    ReconnectingWebSocket.prototype._clearTimeouts = function () {
        clearTimeout(this._connectTimeout);
        clearTimeout(this._uptimeTimeout);
    };
    return ReconnectingWebSocket;
}());

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

class SpeechRecognizer {
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

class WebAudioSpeechRecognizer {
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

class ASRRecognizer {
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

class Recorder {
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
    this.tencentASRRecognizer = new ASRRecognizer({
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
      this.sendResultToCaller();
      return
    }

    // 如果未开启语音转文字功能，回调数据不包括asrResult
    if (!this.options.isAIVoiceOn) {
      const aiResult = calculateAIScore({
        recordSeconds: this.recordDurationInMs / 1000,
        aiPredictResult: this.aiPredictResult,
        soundVolumes: this.soundMeterResult,
        config: this.options.aiScoreSetting,
      });
      this.sendResultToCaller(aiResult);
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

export { Recorder as default };
//# sourceMappingURL=recorder.js.map
