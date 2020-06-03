/*
    Created by Jeff Wu
    Wales regional data one-key import script
    Download Data from https://public.tableau.com/profile/public.health.wales.health.protection#!/vizhome/RapidCOVID-19virology-Public/Headlinesummary
    Put the Excel File(.xlsx) in root dict, rename to "wales.xlsx"
*/


const readXlsxFile = require('read-excel-file/node');
const { addSlashes, stripSlashes } = require('slashes');

const DbClient = require("ali-mysql-client")
const conf = require('./conf')

const db = new DbClient(conf.getDB())

let p = []

readyToDB = []

let result

readXlsxFile('./wales.xlsx', { sheet: 'Tests by specimen date' }).then(async (res)=>{

    result = await getHistory()

    for(let c=0;c<res.length;c++){
        let row = res[c]
        console.log(row)
        let d = {location: row[0], number: row[3]}
        p.push(save(row[1], d, c));
    }

    Promise.all(p)
    .then((results) => {
        writeAll(result)
        console.log("All done", results);
    })
    .catch((e) => {
        // Handle errors here
    });

    
})

//saveToDb()



// Receive JS Date obj, {location: "", number: 0}
function save(date, data){

    return new Promise(async function(resolve, reject) {

        // Get
        for(let i=0;i<result.length;i++){

            // Find Date
            let inputDate = new Date(date)
            inputDate = (inputDate.getMonth()+1) + "-" + inputDate.getDate()
            let resDate = new Date(result[i].date)
            resDate = (resDate.getMonth()+1) + "-" + resDate.getDate()

            if(inputDate == resDate){

                let area = result[i].area
                let ready = []

                // Some date dont have area data
                if(area == null || area == "null"){
                    
                    ready = [data]

                } else {
                    
                    area = stripSlashes(area)
                    area = JSON.parse(area)

                    // check if location already existed
                    let checkExisted = indexOfArrObj(data.location, "location", area) // return index if found

                    if(checkExisted == -1){
                        data = [data]
                        area = area.concat(data)
                    } else {
                        area[checkExisted].number = data.number
                    }

                    let hasWales = indexOfArrObj("Wales", "location", area) // return index if found
                    if(hasWales != -1){
                        area[hasWales].number = 0
                    }

                    ready = Object.assign(ready, area)
                }

                ready = { "area": addSlashes(JSON.stringify(ready)) }

                result[i].area = ready.area

                if(i== 0){
                    console.log(result[i].area)
                }

                resolve(true)

            }
        }
        resolve(false)

    })

    
}

async function writeAll(all){
    all.forEach(el => {
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
    //console.log("Inserting...")
    return await db
        .update("history", ready)
        .where("id", id)
        .execute()
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

function deepcopy(origin){
    return (origin).slice(0)
}
