function selectSort(nums) {
  let minIndex;

  for (let i = 0; i < nums.length; i++) {
    minIndex = i;
    for (let j = minInde + 1; j < nums.length; j++) {
      if (nums[i] > nums[j]) {
        minIndex = j;
      }
    }
    [nums[i], nums[minIndex]] = [nums[minIndex], nums[i]];
  }
}
