/**
 * @description:  选择排序思想: 双重循环遍历数组, 每经过一轮比较, 找到最大或者最小元素, 将其交换至首位
 */

function selectSort(nums) {
  let minIndex;

  for (let i = 0; i < nums.length; i++) {
    minIndex = i;
    for (j = minIndex + 1; j < nums.length; j++) {
      if (nums[i] > nums[j]) {
        minIndex = j;
      }
    }

    [nums[i], nums[minIndex]] = [nums[minIndex], nums[i]];
  }
}
