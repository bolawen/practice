const DEFAULT_SCORE = 3;
const EYE_GROUP_LEN = 10;

function getHandAverage(handCount, recordSeconds) {
  const handAverage = (handCount / recordSeconds) * 60;
  return handAverage;
}

function getSightAverage(totalEyeCount, passedEyeCount) {
  if (totalEyeCount === 0) {
    return '0';
  }

  const average = totalEyeCount == 0 ? 0 : passedEyeCount / totalEyeCount;
  return average;
}

function getSmileAverage(smileCount, aiSize, smilePassLine) {
  let smileAverage = 0;

  if (smileCount < 1) {
    smileAverage = smilePassLine;
  } else if (smileCount < 2) {
    smileAverage = smilePassLine;
  } else {
    smileAverage = Math.min(
      1,
      smilePassLine + (1 - smilePassLine) * ((4 * smileCount) / aiSize)
    );
  }

  return smileAverage;
}

function getSmileScore(smileCount, aiSize) {
  let newScore = DEFAULT_SCORE * 10;
  if (!aiSize || !smileCount) {
    return 0;
  } else if (smileCount < 4) {
    newScore += smileCount;
    return newScore / 10;
  }
  const smileRate = smileCount / aiSize;
  const scoreLevelList = [
    1 / 300,
    2 / 300,
    3 / 300,
    4 / 300,
    1 / 60,
    4 / 180,
    5 / 180,
    6 / 180,
    1 / 10,
    2 / 10,
    3 / 10,
    4 / 10,
    5 / 10,
    0.6,
    0.8,
    1
  ];
  newScore = newScore + 4;
  for (let i = 0; i < scoreLevelList.length; i++) {
    const rate = scoreLevelList[i];
    newScore++;
    if (smileRate <= rate) {
      break;
    }
  }
  return newScore / 10;
}

function getSightScore(passedEyeCount, totalEyeCount) {
  if (!passedEyeCount) {
    return 0;
  } else {
    const ratio = passedEyeCount / totalEyeCount;
    const num = Math.round(1.9 * ratio * 10) / 10;
    return 3.1 + num;
  }
}

function getHandScore(handCount, aiSize) {
  if (!handCount) {
    return 0;
  }
  const handRate = handCount / aiSize;
  if (handRate > 0.52) {
    return 5;
  }
  const handLevelList = [
    0.005, 0.01, 0.015, 0.02, 0.04, 0.06, 0.08, 0.1, 0.12, 0.16, 0.2, 0.24,
    0.28, 0.32, 0.36, 0.4, 0.44, 0.48, 0.52
  ];
  let newScore = DEFAULT_SCORE * 10;

  for (let i = 0; i < handLevelList.length; i++) {
    const rate = handLevelList[i];
    newScore++;
    if (handRate <= rate) {
      break;
    }
  }

  return newScore / 10;
}

function parseAIFacePredictData({ predictResult, smileThreshold }) {
  let smileCount = 0;
  let handCount = 0;
  let totalEyeCount = 0;
  let passedEyeCount = 0;

  predictResult.forEach(item => {
    const { hands, faces } = item;
    if (hands.length > 0) {
      handCount += item.hands.length;
    }
    if (faces.length > 0) {
      // 累加脸部数量
      totalEyeCount += faces.length;

      faces.forEach(face => {
        // 微笑程度大于0.2判断为微笑，微笑数量加1。
        if (face.smileRate > smileThreshold) {
          smileCount += 1;
        }

        // 眼珠偏移水平中心点距离占水平半径的比例，与眼珠偏移垂直中心点距离占垂直半径的比例，两者平均值小于0.2，当作眼睛居中了，认为眼神自信，自信数量加一。
        const eyesCount = Math.round(face.eyesPos.length / EYE_GROUP_LEN);
        let ratio = 0;
        for (let i = 0; i < eyesCount; i++) {
          const startIndex = i * EYE_GROUP_LEN;
          const eyePos = face.eyesPos.slice(
            startIndex,
            startIndex + EYE_GROUP_LEN
          );

          const ey1 = eyePos[1];
          const ey2 = eyePos[3];
          const ey3 = eyePos[9];

          const ex1 = eyePos[4];
          const ex2 = eyePos[6];
          const ex3 = eyePos[8];

          const horizontalRatio = Math.abs(
            ((ey1 + ey2) / 2 - ey3) / (ey1 - ey2)
          );
          const verticalRatio = Math.abs(((ex1 + ex2) / 2 - ex3) / (ex1 - ex2));
          const sightRatio = horizontalRatio + verticalRatio;
          ratio += sightRatio;
        }
        ratio /= eyesCount;

        if (ratio < 0.2) {
          passedEyeCount += 1;
        }
      });
    }
  });

  return {
    smileCount,
    handCount,
    totalEyeCount,
    passedEyeCount
  };
}

export function calculate({
  recordSeconds,
  predictResult,
  config: { smileThreshold, smilePassLine }
}) {
  const aiSize = predictResult.length;

  const { smileCount, handCount, totalEyeCount, passedEyeCount } =
    parseAIFacePredictData({
      predictResult,
      smileThreshold
    });

  const handAverage = getHandAverage(handCount, recordSeconds);
  const sightAverage = getSightAverage(totalEyeCount, passedEyeCount);
  const smileAverage = getSmileAverage(smileCount, aiSize, smilePassLine);

  const smileScore = getSmileScore(smileCount, aiSize);
  const sightScore = getSightScore(passedEyeCount, totalEyeCount);
  const handScore = getHandScore(handCount, aiSize);

  return {
    handAverage,
    sightAverage,
    smileAverage,

    scoreMap: {
      smileScore,
      sightScore,
      handScore
    }
  };
}
