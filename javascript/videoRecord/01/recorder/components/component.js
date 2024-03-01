export default class Component {
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
