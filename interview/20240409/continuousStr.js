function maxPower(s){
    let ans = 1;
    let cnt = 1;

    for(let i=1; i<s.length; i++){
        if(s[i] === s[i-1]){
            ++cnt;
            ans = Math.max(ans, cnt);
        }else{
            cnt = 1;
        }
    }

    return ans;
}

const str = "abbcccddddeeeeedcba"
console.log(maxPower(str));

function maxPower(str){
    let cnt = 1;
    let ans = 1;

    for(let i=1; i<str.length; i++){
        if(s[i] === s[i-1]){
            cnt++;
            ans = Math.max(ans,cnt);
        }else{
            cnt = 1;
        }
    }

    return ans;
}