function binarySearch(left, right, target, array){
    let l = left;
    let r= right;
    while(l < r){
        const middle = (l + r) >> 1;
        const middleItem = array[middle];
        if(middleItem < target){
            l = middle + 1;
        }else{
            r = middle;
        }
    }
    return l;
}

const nums=[1,3,5,6];
const target=5;
console.log(binarySearch(0, nums.length, target, nums)); 