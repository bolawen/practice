function quickSort(array, start, end, k){
  if(start >= end){
    return;
  }

  let left = start;
  let right = end;
  let pivot = array[left];

  while(left < right){
    while(left < right && array[right] < pivot){
      right--;
    }

    while(left < right && array[left] >= pivot){
      left++;
    }

    [array[left],array[right]] = [array[right],array[left]];
  }

  [array[start],array[left]] = [array[left],array[start]];
  
  if(left > k-1){
    quickSort(array, start, right - 1, k);
  }

  if(left < k-1){
    quickSort(array, left + 1, end, k);
  }

  return array[k-1];
}

function findKthLargest(array,k){
  return quickSort(array, 0, array.length - 1, k);
}