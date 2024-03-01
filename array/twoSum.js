function sortArray(nums) {
  let start = 0;
  let end = nums.length - 1;
  let stack = [[start, end]];
  while (stack.length > 0) {
    let range = stack.pop();
    if (range[0] >= range[1]) {
      continue;
    }
    let left = range[0];
    let right = range[1];
    let pivot = nums[left];
    while (left < right) {
      while (left < right && nums[right] > pivot) {
        right--;
      }
      while (left < right && nums[left] <= pivot) {
        left++;
      }
      [nums[left], nums[right]] = [nums[right], nums[left]];
    }
    [nums[range[0]], nums[left]] = [nums[left], nums[range[0]]];
    if (range[0] < right) {
      stack.push([range[0], left - 1]);
    }
    if (range[1] > left) {
      stack.push([right + 1, range[1]]);
    }
  }
  return nums;
}

function twoSum(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  const result = [];
  sortArray(nums);

  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) {
      return [nums[left], nums[right]];
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }
}

const array = [3, 2, 4];
// const array = [1, 2, 7, 8, 11, 15];
const result = twoSum(array, 6);
console.log(result);
