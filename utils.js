const mTxtNumber = [
    [1, "one"],
    [2, "two"],
    [3, "three"],
    [4, "four"],
    [5, "five"],
    [6, "six"],
    [7, "seven"],
    [8, "eight"],
    [9, "nine"],
    [10, "ten"]
]

function deepCopy(val){
    return JSON.parse(JSON.stringify(val))
}

function getTS () {
    return Date.parse( new Date())
}

function matchNum(str){
    var res = -1
    for(let i=0; i<mTxtNumber.length; i++){
        if(str.toLowerCase() == mTxtNumber[i][1]){
            res =  mTxtNumber[i][0]
        }
    }

    return res
}

function idIdxsInArr(target, arr){
    var res = []
    for(let i=0;i<arr.length;i++){
        if(arr[i].indexOf(target) != -1){
            res.push(i)
        }
    }
    return res.length > 0 ? res : -1
}

function idIdxsInArrWithId(target, arr, id){
    
    var res = []
    for(let i=0;i<arr.length;i++){
        if(arr[i][id].indexOf(target) != -1){
            res.push(i)
        }
    }

    
    return res.length > 0 ? res : -1
}


module.exports = {
    deepCopy: deepCopy,
    getTS: getTS,
    idIdxsInArr: idIdxsInArr,
    idIdxsInArrWithId: idIdxsInArrWithId,
    matchNum: matchNum
}