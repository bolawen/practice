import { EWorkerMessage } from "./constant";

export function createPreflightPredictImageData() {
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

const defaultOptions = {
  sendPreflightOnModelLoad: true
};

export default class FacePredictWorker {
  constructor(workerUrl, options = {}) {
    this.workerUrl = workerUrl;
    this.options = { ...defaultOptions, ...options };
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
