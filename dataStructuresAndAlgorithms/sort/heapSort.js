function sort(nums) {
  heapSort(nums);
  return nums;
}

function heapSort(nums) {
  // 将 nums 数组构建为大顶堆
  buildHeap(nums);
  // 从最后一个元素开始, 依次与堆顶元素进行交换, 然后重新调整堆
  for (let i = nums.length - 1; i > 0; i--) {
    [nums[0], nums[i]] = [nums[i], nums[0]];
    shiftDown(nums, 0, i);
  }
}

function buildHeap(nums) {
  const halfLength = nums.length >>> 1;
  for (let i = halfLength - 1; i >= 0; i--) {
    shiftDown(nums, i, nums.length);
  }
}

function shiftDown(nums, startIndex, endIndex) {
  let i = startIndex;
  const halfLength = endIndex >>> 1;

  while (i < halfLength) {
    const leftIndex = 2 * i + 1;
    const left = nums[leftIndex];
    const rightIndex = leftIndex + 1;
    const right = nums[rightIndex];

    if (left > nums[i]) {
      if (rightIndex < endIndex && right > left) {
        [nums[i], nums[rightIndex]] = [nums[rightIndex], nums[i]];
        i = rightIndex;
      } else {
        [nums[i], nums[leftIndex]] = [nums[leftIndex], nums[i]];
        i = leftIndex;
      }
    } else if (rightIndex < endIndex && right > nums[i]) {
      [nums[i], nums[rightIndex]] = [nums[rightIndex], nums[i]];
      i = rightIndex;
    } else {
      return;
    }
  }
}

const nums = [1, 3, 6, 10, 8, 12, 7, 4, 5, 9, 2];
console.log(sort(nums));
