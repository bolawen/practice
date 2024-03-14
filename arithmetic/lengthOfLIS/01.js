function binarySearch(left, right, target, array) {
  let l = left;
  let r = right;
  while (l < r) {
    const middle = (l + r) >> 1;
    const middleItem = array[middle];
    if (middleItem < target) {
      l = middle + 1;
    } else {
      r = middle;
    }
  }
  return l;
}

function lengthOfLIS(nums) {
  let len = 1;
  const dp = new Array(nums.length + 1);
  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    if (num > dp[len]) {
      dp[++len] = num;
    } else {
      let pos = binarySearch(1, len, num, dp);
      dp[pos] = num;
    }
  }
  return len;
}

const nums = [10, 9, 2, 5, 3, 7, 101, 18];
console.log(lengthOfLIS(nums));
