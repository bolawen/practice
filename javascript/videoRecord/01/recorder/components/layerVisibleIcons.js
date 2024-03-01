import Component from './component';
import { isInTouchableDevice } from '../util';
import { HIDDEN_TIME_IN_SECONDS } from "../constant";

export default class LayerVisibleIcons extends Component {
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
