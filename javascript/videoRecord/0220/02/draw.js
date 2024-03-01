const EYE_GROUP_LEN = 10;

const CANVAS_PALETTE = {
  face: {
    color: '#FFD92B',
    pointColor: '#FF9800',
    opacity: ['100%', '20%']
  },
  eye: {
    color: '#46D06E',
    pointColor: '#1F9E40',
    opacity: ['100%', '20%']
  },
  mouth: {
    color: '#FFA43E',
    pointColor: '#E56014',
    opacity: ['100%', '20%']
  },
  hand: {
    color: '#5ec8fe',
    pointColor: '#0b66f9',
    opacity: ['100%', '20%']
  },
  sound: {
    color: '#F5A623',
    pointColor: '',
    opacity: ['100%', '8%', '%0']
  }
};

export const VIDEO_WIDTH = 640;
export const VIDEO_HEIGHT = 480;
export const PREDICT_SIZE = 320;
export const SCALE_RATIO = VIDEO_WIDTH / PREDICT_SIZE;

function getSightAverage(totalEyeCount, passedEyeCount) {
  if (totalEyeCount === 0) {
    return 0;
  }

  return Number(totalEyeCount) === 0 ? 0 : passedEyeCount / totalEyeCount;
}

function getSightPassCount(workerResult) {
  let passedEyeCount = 0;
  const faces = workerResult.faces || [];
  faces.forEach(face => {
    const eyesCount = Math.round(face.eyesPos.length / EYE_GROUP_LEN);
    let ratio = 0;
    for (let i = 0; i < eyesCount; i++) {
      const startIndex = i * EYE_GROUP_LEN;
      const eyePos = face.eyesPos.slice(startIndex, startIndex + EYE_GROUP_LEN);

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

export function drawFaceCanvas(context, output, width, height) {
  const { hands, faces } = output;
  context.clearRect(0, 0, width, height);

  const sightAverage = getSightAverage(faces.length, getSightPassCount(output));
  const showSight = sightAverage > 0.2;
  faces.forEach(face => {
    const { faceRate, facePos } = face;

    // draw face border
    if (faceRate > 0.3) {
      const [x1, y1, x2, y2] = facePos;
      drawFaceBorder(context, x1, y1, x2, y2, 3, 'face');
    }

    if (showSight) {
      const offset = 0;
      // draw eyes border
      const { eyesPos } = face;

      const ex1 = eyesPos[4] - offset;
      const ey1 = eyesPos[1] - offset;
      const ex4 = eyesPos[16] + offset;
      const ey4 = eyesPos[13] + offset;
      drawFaceBorder(context, ex1, ey1, ex4, ey4, 3, 'eye');
    }

    const { mouthPos } = face;
    const mx1 = mouthPos[0];
    const my1 = mouthPos[7];
    const mx2 = mouthPos[12];
    const my2 = mouthPos[19];
    if (face.smileRate >= 0.4) {
      drawFaceBorder(context, mx1, my1, mx2, my2, 3, 'mouth');
    }
  });

  hands.forEach(hand => {
    const [x1, y1, x2, y2] = hand.handPos;
    drawFaceBorder(context, x1, y1, x2, y2, 3, 'hand');
  });
}
