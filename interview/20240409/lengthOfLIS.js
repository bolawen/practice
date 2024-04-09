function binarySearch(array, start, end, target){
    let left = start;
    let right = end;

    while(left < right){
        let middle = (left + right) >>> 1;
        if(array[middle] < target){
            left = middle + 1;
        }else{
            right = middle;
        }
    }
    return left;
}

function lengthOfLIS(array){
    let len = 1;
    const dp = new Array(array.length + 1);

    for(let i=0; i<array.length; i++){
        const num = array[i];
        if(num > dp[len]){
            dp[++len] = num;
        }else{
            const pos = binarySearch(array, 1, len, num);
            dp[pos] = num;
        }
    }

    return len;
}