// import
const superagent= require('superagent')
const cheerio = require('cheerio')
const database = require('./database')
const { addSlashes } = require('slashes')
const readXlsxFile = require('read-excel-file/node')
const { getJsDateFromExcel } = require("excel-date-to-js")
// File System
const fs = require('fs')

const { http, https } = require('follow-redirects')

let hospitalData = {source: "gov", link: "https://www.gov.uk/government/publications/slides-and-datasets-to-accompany-coronavirus-press-conference-", class: "attachment-details"}
let monthName = ['jan', 'feb', 'mar', 'april', 'may', 'june', 'july', 'aug', 'sep', 'nov', 'dec']

const timeoutDefault = {
    response: 0, //delay 0 second
    deadline: 100000 // 10 second timeout
}

writeHospitalData()
//getHospitalData(hospitalData)

async function writeHospitalData(){
    let all = JSON.parse(fs.readFileSync('./hospital.json', 'utf-8'))
    all.forEach(el => {
        let ready = {
            hospital: el.all,
            hospitalArea: addSlashes(JSON.stringify({england: el.england, scotland: el.scotland, wales: el.wales, nIreland:el.nIreland}))
        }

        database.updateHistoryByDate(ready, el.dateStr)
    })
}


function getHospitalData(data){
    return new Promise(resolve => {

        var result = []

        let d = new Date()
        const monthName = ['jan', 'feb', 'mar', 'april', 'may', 'june', 'july', 'aug', 'sep', 'nov', 'dec']

        // data.link + d.getDate() + '-' + monthName[d.getMonth()] + '-' + d.getFullYear()

        superagent.get(data.link + 19 + '-' + monthName[d.getMonth()] + '-' + d.getFullYear()).timeout(timeoutDefault).end((err, res) => {
            console.log(data.link + 19 + '-' + monthName[d.getMonth()] + '-' + d.getFullYear())
            if(err){
                console.log("err")
                //recordError(data.source, "timeout", err)
                resolve(false)
            }else{
                
                let $ = cheerio.load(res.text)
                let att = $('.' + data.class + ' a')

                let link = false
                // Search download link contains .xlsx
                for(let i=0;i<att.length;i++){
                    let tmpLink = $(att[i]).attr('href')

                    if(tmpLink.indexOf('.xlsx') != -1){
                        link = tmpLink
                    }
                }

                if(link){
                    const file = fs.createWriteStream("hospital.xlsx")
                    const request = https.get(link, function(response) {
                        response.pipe(file)

                        file.on('finish', ()=>{

                            let allDate = []
                            let all = []

                            readXlsxFile('./hospital.xlsx', { sheet: 'People in Hospital (UK)' }).then(async (res)=>{
                                
                                for(let c=0;c<res.length;c++){
                                    let row = res[c]
                                    
                                    if(!isNaN(row[0]) && !isNaN(row[2]) && row[0] != null && row[2] != null){

                                        let ts = new Date(ExcelDateToJSDate(row[0])).getTime()

                                        let idx = allDate.indexOf(ts)

                                        for(let ci=0;ci<row.length;ci++){
                                            row[ci] = parseInt(row[ci])

                                            // Sometime is null, fuck this data
                                            if(isNaN(row[ci]) || row[ci] == null || row[ci] == "null"){
                                                // If a single item is null, set as last day, or 0
                                                if(res[c-1]){
                                                    row[ci] = res[c-1][ci]
                                                } else{
                                                    row[ci] = 0
                                                }
                                                
                                            }
                                        }

                                        // Check if this date already added
                                        if(idx == -1){
                                            
                                            let tmpRes = {date: ts, dateStr: tsToDate(ts), all: 0, england: 0, scotland: 0, nIreland: 0, wales: 0}
                                            tmpRes.all = row[1]+row[2]+row[3]+row[4]+row[5]+row[6]+row[7]+row[8]+row[9]+row[10]
                                            tmpRes.england = row[1]+row[2]+row[3]+row[4]+row[5]+row[6]+row[7]
                                            tmpRes.scotland = row[8]
                                            tmpRes.wales = row[9]
                                            tmpRes.nIreland = row[10]

                                            allDate.push(ts)
                                            all.push(tmpRes)

                                        } else {
                                            
                                            all[idx].all = row[1]+row[2]+row[3]+row[4]+row[5]+row[6]+row[7]+row[8]+row[9]+row[10]
                                            all[idx].england = row[1]+row[2]+row[3]+row[4]+row[5]+row[6]+row[7]
                                            all[idx].scotland = row[8]
                                            all[idx].wales = row[9]
                                            all[idx].nIreland = row[10]
                                            
                                            //console.log("existed")
                                        }

                                        //console.log(num)
                                        //console.log(getJsDateFromExcel(row[0]))
                                    }
                                    
                                }

                                fs.writeFileSync('hospital.json', JSON.stringify(all));

                            })
                        })
                    })

                }
                
                
                resolve(true)

            }
        })

    })
}

function tsToDate(ts){
    let d = new Date(ts)
    return d.getFullYear() + "-" + addZero(d.getMonth() + 1) + "-" + addZero(d.getDate())
}

function addZero(str){
    if(str < 10){
        return "0" + str
    } else {
        return str
    }
}

function foundAll(res, date){
    
    let rcs = {all: 0, england: 0, scotland: 0, nIreland: 0, wales: 0}

    for(let i=0;i<res.length;i++){

        let el = res[i]

        if(!isNaN(el[0]) && !isNaN(el[2])){

            let cts = new Date(getJsDateFromExcel(el[0])).getTime()
            let locName = el[1]
            let num = el[2]

            rcs.all += num
            
            if(cts = date){

                if(locName == "Scotland" ){
                    rcs.scotland = num
                }

                else if(locName == "Wales"){
                    rcs.wales = num
                }

                else if(locName == "Northern Ireland"){
                    rcs.nIreland = num
                }

                else{
                    rcs.england += num
                }
            }

            
        }

    }

    console.log(rcs)

    return rcs
}

function ExcelDateToJSDate(serial) {
    var utc_days  = Math.floor(serial - 25569);
    var utc_value = utc_days * 86400;                                        
    var date_info = new Date(utc_value * 1000);
 
    var fractional_day = serial - Math.floor(serial) + 0.0000001;
 
    var total_seconds = Math.floor(86400 * fractional_day);
 
    var seconds = total_seconds % 60;
 
    total_seconds -= seconds;
 
    var hours = Math.floor(total_seconds / (60 * 60));
    var minutes = Math.floor(total_seconds / 60) % 60;
 
    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
 }