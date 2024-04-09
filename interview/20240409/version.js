function compareVersion(version1,version2){
    const v1 = version1.split('.');
    const v2 = version2.split('.');

    const len = Math.max(v1.length, v2.length);

    for(let i=0; i<len; i++){
        let x = 0;
        let y = 0;

        if(i < v1.length){
            x = parseInt(v1[i])
        }

        if(i < v2.length){
            y = parseInt(v2[i])
        }

        if(x > y){
            return 1;
        }

        if(x < y){
            return -1;

        }
    }

    return 0;
}

console.log(compareVersion('1.0.1.3', '1.0.1'))

function compareVersion(version1,version2){
    const v1 = version1.split('.');
    const v2 = version2.split('.');

    const len = Math.max(v1.length, v2.length);

    for(let i=0; i<len; i++){
        let x = 0;
        let y = 0;

        if(i < v1.length){
            x = parseInt(v1[i]);
        }

        if(i < v2.lenth){
            y = parseInt(v2[i]);
        }

        if(x > y ){
            return 1;
        }

        if(x < y){
            return -1;
        }
    }

    return 0;
}