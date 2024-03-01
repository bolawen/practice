function binarySearch(nums,target){
    let left = 0;
    let right = nums.length -1;
    while(left <= right){
        const middle = (left + right) >> 1;
        const num = nums[middle];
        if(num === target){
            return middle;
        }else if(num < target){
            left = middle + 1;
        }else{
            right = middle -1;
        }
    }
    return -1;
}

const array = [-1,0,3,5,9,12];
const result = binarySearch(array,9);
console.log(result)