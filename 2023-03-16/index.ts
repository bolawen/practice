function once<T extends (...args: any[]) => any>(fn:T):T{
    let called = false;
    return function(){
        if(!called){
            called = true;
            fn.apply(this,arguments as any);
        }
    } as any
}

const pay = once(function(money){
    console.log(`支付了 ${ money } RMB`);
});
pay(5);
pay(10)