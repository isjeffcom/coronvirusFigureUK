const fs = require("fs")
const DbClient = require("ali-mysql-client")
const conf = require('./conf')
const db = new DbClient(conf.getDB())


const dAll = fs.readFileSync("./death_fix.json", "utf-8")
let data = JSON.parse(dAll)
data = data.overview

async function all(){
    results = await getHistory()

    results.forEach(res => {
        let idate = dateConv(res.date)
        fixData(idate, res.id)
    })
}

all()
/*let data = JSON.parse(dAll)
data = data.overview
data.forEach(ds => {

    //let d = new Date(ds.reportingDate)
    console.log(ds.reportingDate)
})*/

function fixData(date, id){
    data.forEach(ds => {
        if(date == ds.reportingDate){
            //console.log(ds.reportingDate, id, ds.cumulativeDeaths)
            let ready = {death: ds.cumulativeDeaths}
            writeHistory(ready, id)
        }
    })
}

async function getHistory() {
    return await db
        .select("date, id")
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

function addZero(str){
    return str < 10 ? "0" + str : str
}

//console.log(JSON.parse(dAll))