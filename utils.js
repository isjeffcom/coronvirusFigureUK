// Var for convert text number to arabic number
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

// Deep copy an object
function deepCopy(val){
    return JSON.parse(JSON.stringify(val))
}


// Get a timestamp
function getTS () {
    return Date.parse( new Date())
}

// Convert text number to arabic number
function matchNum(str){
    var res = -1
    for(let i=0; i<mTxtNumber.length; i++){
        if(str.toLowerCase() == mTxtNumber[i][1]){
            res =  mTxtNumber[i][0]
        }
    }

    return res
}


// Id index in array, output all index as an array
function idIdxsInArr(target, arr){
    var res = []
    for(let i=0;i<arr.length;i++){
        if(arr[i].indexOf(target) != -1){
            res.push(i)
        }
    }
    return res.length > 0 ? res : -1
}


// Id index in array object, output all index as an array
function idIdxsInArrWithId(target, arr, id){
    
    var res = []
    for(let i=0;i<arr.length;i++){
        if(arr[i][id].indexOf(target) != -1){
            res.push(i)
        }
    }

    
    return res.length > 0 ? res : -1
}

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


module.exports = {
    deepCopy: deepCopy,
    getTS: getTS,
    idIdxsInArr: idIdxsInArr,
    idIdxsInArrWithId: idIdxsInArrWithId,
    matchNum: matchNum,
    isJson: isJson
}