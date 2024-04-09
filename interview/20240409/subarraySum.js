function subarraySum(array,k){
    let prev = 0;
    let count = 0;
    const map = new Map();
    map.set(0,1);

    for(let num of array){
        prev+= num;

        if(map.has(prev-k)){
            count += map.get(prev-k);
        }

        if(map.has(prev)){
            map.set(prev, map.get(prev) + 1);
        }else{
            map.set(prev,1);
        }
    }

    return count;
}

console.log(subarraySum([1,2,3], 3)); // 2