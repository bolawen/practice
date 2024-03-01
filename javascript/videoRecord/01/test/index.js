import Recorder from '../dist/recorder.js';

Recorder.createRecorder({
  isAIOn: true,
  container: '#video-recorder-container',
  video: {
    width: 862,
    height: 485,
    deviceId: 'default'
  },
  audio: {
    deviceId: 'default'
  },
  workerUrl: './worker/worker.js',
  keywords: ['这是', '测试', '内容', '锄禾日当午', '汗滴禾下土'],

  onRecordStart: start => {
    console.log('------------_> onRecordStart', start);
  },
  onRecordStop: result => {
    console.log('------------_> onRecordStop', result);
  },
  onCountdownStart: () => {
    console.log('----> onCountdownStart');
  },
  onRecorderChunkDataChange: (chunkIndex, chunkData) => {
    console.log(
      '------------_> onRecorderChunkDataChange',
      chunkIndex,
      chunkData
    );
  }
});
