import Component from './component';
import { PREDICT_SIZE, EWorkerMessage } from '../constant';
import {
  drawFaceCanvas,
  addKeywordHighlight,
  drawSoundValueCanvas,
  getPreviewImageDataFromVideoElement,
  getPredictImageDataFromVideoElement
} from '../util';

export default class VideoCanvas extends Component {
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
