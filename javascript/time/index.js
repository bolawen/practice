console.time('timer');

function doSomething() {
    let sum = 0;
    for(let i = 0; i < 10000; i++){
        sum += i;
    }
    return sum;
}

doSomething();

console.timeEnd('timer');