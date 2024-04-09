function mergeSortArray(array1, m, array2,n){
    let p1 = m - 1;
    let p2 = n - 1;
    let tail = m + n - 1;
    let curr;

    while(p1 !== 0 || p2 !== 0){
        if(p1 === -1){
            curr = array2[p2--];
        }else if(p2 === -1){
            curr = array1[p1--];
        }else if(array1[p1] > array2[p2]){
            curr = array1[p1--];
        }else{
            curr = array2[p2--];
        }

        array1[tail--] = curr;
    }
}