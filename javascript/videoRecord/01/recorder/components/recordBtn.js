import Component from './component';
import { isInTouchableDevice } from "../util";

export default class RecordBtn extends Component {
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
