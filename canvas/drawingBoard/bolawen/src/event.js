export const downInvoker = e => {
  downInvoker?.value?.(e);
};
export const moveInvoker = e => {
  moveInvoker?.value?.(e);
};
export const upInvoker = e => {
  upInvoker?.value?.(e);
};
export const outInvoker = e => {
  outInvoker?.value?.(e);
};

export const scaleInvoker = e => {
  scaleInvoker?.value?.(e);
};

export const keydownInvoker = e => {
  keydownInvoker?.value?.(e);
};

export const keyupInvoker = e => {
  keyupInvoker?.value?.(e);
};

export default class Event {
  constructor(options) {
    this.downInvoker = downInvoker;
    this.moveInvoker = moveInvoker;
    this.upInvoker = upInvoker;
    this.outInvoker = outInvoker;
    this.scaleInvoker = scaleInvoker;
    this.keydownInvoker = keydownInvoker;
    this.keyupInvoker = keyupInvoker;

    this.drawingBoard = options.drawingBoard;
  }

  addEventListener() {
    this.drawingBoard.canvas.addEventListener('mousedown', this.downInvoker);
    document.addEventListener('mousemove', this.moveInvoker);
    document.addEventListener('mouseup', this.upInvoker);
    this.drawingBoard.canvas.addEventListener('mouseleave', this.outInvoker);

    this.drawingBoard.canvas.addEventListener('touchstart', this.downInvoker);
    document.addEventListener('touchmove', this.moveInvoker);
    document.addEventListener('touchend', this.upInvoker);

    document.addEventListener('mousewheel', this.scaleInvoker, {
      passive: false
    });

    document.addEventListener('keydown', this.keydownInvoker);
    document.addEventListener('keyup', this.keyupInvoker);
  }

  removeEventListener() {
    this.drawingBoard.canvas.removeEventListener('mousedown', this.downInvoker);
    document.removeEventListener('mousemove', this.moveInvoker);
    document.removeEventListener('mouseup', this.upInvoker);
    this.drawingBoard.canvas.removeEventListener('mouseleave', this.outInvoker);

    this.drawingBoard.canvas.removeEventListener(
      'touchstart',
      this.downInvoker
    );
    document.removeEventListener('touchmove', this.moveInvoker);
    document.removeEventListener('touchend', this.upInvoker);

    document.removeEventListener('mousewheel', this.scaleInvoker, {
      passive: false
    });

    document.removeEventListener('keydown', this.keydownInvoker);
    document.removeEventListener('keyup', this.keyupInvoker);
  }

  setEvent(type, fn) {
    switch (type) {
      case 'down':
        this.downInvoker.value = fn;
        break;
      case 'move':
        this.moveInvoker.value = fn;
        break;
      case 'up':
        this.upInvoker.value = fn;
        break;
      case 'out':
        this.outInvoker.value = fn;
        break;
      case 'scale':
        this.scaleInvoker.value = fn;
        break;
      case 'keydown':
        this.keydownInvoker.value = fn;
        break;
      case 'keyup':
        this.keyupInvoker.value = fn;
        break;
      default:
        break;
    }
  }
}
