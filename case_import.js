const fs = require("fs")
const DbClient = require("ali-mysql-client")
const conf = require('./conf')
const { addSlashes, stripSlashes } = require('slashes');
const db = new DbClient(conf.getDB())


const dAll = fs.readFileSync("./case.json", "utf-8")
let data = JSON.parse(dAll)
data = data.utlas

let p = []
let allc = []

async function fixCont(){
    results = await getHistory()

    for(let i=0;i<results.length;i++){
        p.push(aaa(results[i], i, results[i].id))
        //console.log(i)
    }

    Promise.all(p)
    .then((res) => {
        writeAll(allc)
        console.log("All done", res);
    })
    .catch((e) => {
        // Handle errors here
    });
}

function aaa(res, i, id){
    return new Promise(async function(resolve, reject) {
        let ar = JSON.parse(stripSlashes(res.area))
        if((i+1) < results.length){
            let nextArea = JSON.parse(stripSlashes(results[i+1].area))
            let arLen = ar.length

            //console.log(ar.length)

            for(let ii=0;ii<arLen;ii++){

                //console.log(ii)
                let el = ar[ii]
                let ifC = indexOfArrObj(el.location, 'location', nextArea)
                if(ifC == -1){
                    let tmp = {location: el.location, number: el.number}
                    nextArea.push(tmp)
                    console.log(tmp)
                }
                

            }

            allc.push({ area: addSlashes(JSON.stringify(nextArea)), id: id+1})
            resolve(true)
        }else{
            resolve(false)
        }
        
        
    })
}

fixCont()


async function noSpace(){
    
    results = await getHistory()

    for(let i=0;i<results.length;i++){
        let res = results[i]
        p.push(trimAll(res, res.id));
    }

    Promise.all(p)
    .then((res) => {
        writeAll(allc)
        console.log("All done", res);
    })
    .catch((e) => {
        // Handle errors here
    });
}

//noSpace()

async function all(){

    results = await getHistory()

    for(let i=0;i<results.length;i++){
        let res = results[i]
        let idate = dateConv(res.date)
        p.push(fixData(idate, res.id, res.area, i));
    }

    Promise.all(p)
    .then((res) => {
        writeAll(allc)
        console.log("All done", res);
    })
    .catch((e) => {
        // Handle errors here
    });
}

//all()
/*let data = JSON.parse(dAll)
data = data.overview
data.forEach(ds => {

    //let d = new Date(ds.reportingDate)
    console.log(ds.reportingDate)
})*/

function fixData(date, id, ar, hLidx){
    return new Promise(async function(resolve, reject) {

        let arc = stripSlashes(ar)
        arc = JSON.parse(arc)

        data.forEach((ds, index) => {
            if(date == ds.specimenDate){
                //console.log("Checking in: " + ds.areaName)
                let checkExisted = indexOfArrObj(ds.areaName, "location", arc)
                if(checkExisted == -1){
                    let d = { location: ds.areaName, number: ds.totalLabConfirmedCases }
                    arc.push(d)
                }else{
                    arc[checkExisted].number = ds.totalLabConfirmedCases
                }
                
            }

            if(index == data.length - 1){
                let ready = {area: addSlashes(JSON.stringify(arc)), id: id}
                allc.push(ready)
                resolve(true)
            }
        })

    })
    
}


async function writeAll(all){
    all.forEach((el, idx) => {
        let r = {area: el.area}
        writeHistory(r, el.id)
    });
}

async function getHistory() {
    return await db
        .select("date, id, area")
        .from("history")
        .queryList()
}

async function writeHistory(ready, id){
    return await db
        .update("history", ready)
        .where("id", id)
        .execute()
}


function dateConv(date){
    let inputDate = new Date(date)
    let y = inputDate.getFullYear()
    let m = addZero(inputDate.getMonth() + 1)
    let d = addZero(inputDate.getDate())
    return y + "-" + m + "-" + d
}

function dateMouthAndDay(date){
    let inputDate = new Date(date)
    let y = inputDate.getFullYear()
    let m = inputDate.getMonth() + 1
    let d = inputDate.getDate()
    return {mouth: m, date: d}
}

function addZero(str){
    return str < 10 ? "0" + str : str
}


function indexOfArrObj(target, key, obj){

    let resc = -1

    for(let ii=0;ii<obj.length;ii++){
        if(obj[ii][key] == target){
            resc = ii
        }
    }

    return resc
}
//console.log(JSON.parse(dAll))

function trimAll(obj, id){
    return new Promise(async function(resolve, reject) {
        let area = JSON.parse(stripSlashes(obj.area))
        for(let i=0;i<area.length;i++){
            
            area[i].location = Trim(area[i].location)
        }

        //console.log(area)
        allc.push({ area: addSlashes(JSON.stringify(area)), id: id})
        resolve(true)
    })
}

function Trim(str){ 
    return str.replace(/(^\s*)|(\s*$)/g, ""); 
}