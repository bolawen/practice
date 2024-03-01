export const EYE_GROUP_LEN = 10;
export const DEFAULT_SCORE = 3;
export const VIDEO_WIDTH = 862;
export const VIDEO_HEIGHT = 485;
export const PREDICT_SIZE = 320;
export const HIDDEN_TIME_IN_SECONDS = 3
export const RECORD_INTERVAL = 2 * 1000;
export const EMIT_CHUNK_UNIT_SIZE = 1 * 1024 * 1024;
export const SCALE_RATIO = VIDEO_WIDTH / PREDICT_SIZE

export const SOUND_COLOR = {
  best: '#21A564',
  better: '#FAB400',
  worst: '#B80000',
}

export const ERecorderStatus = {
  IDLE: 'idle',
  ACQUIRING_MEDIA: 'acquiring_media',
  DELAYED_START: 'delayed_start',
  RECORDING: 'recording',
  PAUSED: 'paused',
  STOPPING: 'stopping',
  INACTIVE: 'inactive',
  STOPPED: 'stopped'
};

export const EMediaError = {
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

export const EWorkerMessage = {
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

export const CANVAS_PALETTE = {
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
}