function union(array1, array2) {
    let result = [];
    let i = 0;
    let j = 0;

    while (i < array1.length && j < array2.length) {
        if (array1[i] < array2[j]) {
            result.push(array1[i]);
            i++;
        } else if (array1[i] > array2[j]) {
            result.push(array2[j]);
            j++;
        } else {
            result.push(array1[i]);
            i++;
            j++;
        }
    }

    while (i < array1.length) {
        result.push(array1[i]);
        i++;
    }

    while (j < array2.length) {
        result.push(array2[j]);
        j++;
    }

    return result;
}