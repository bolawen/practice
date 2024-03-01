import PubSub from './pubSub.js';

let microChannel;

export default class MicroChannel extends PubSub {
  static getInstance() {
    if (!microChannel) {
      microChannel = new MicroChannel();
    }
    return microChannel;
  }
  constructor() {
    super();
  }

  sendMessage(params) {
    this.publish(params.type, params.msg);
  }
  onMessage(eventType, handle) {
    this.subscribe(eventType, handle);
  }
}
