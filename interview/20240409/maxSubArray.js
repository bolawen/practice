function maxSubArray(array){
    let prev = 0;
    let dp = array[0];

    for(let num of array){
        prev = Math.max(prev+num, num);
        dp = Math.max(dp, prev);
    }

    return dp;
}

console.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]))