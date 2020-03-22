/** 
 * Develop By Jeff Wu
 * 2020.03
 * isjeff.com
**/

/** 
 * IMPORTANCE
 * Functions are designed to be collected data from specific website, it could be change fast accroding to source website structure
 * Keep monitoring the source's data structure and 'current_shadow' table
**/

/** 
 * VOIDS AND FUNCTIONS
 * ENTRANCE: 
 * getData: get all data, main entrance
 * getAreaData:  main entrance for getting all area data
 * 
 * HELPER
 * getDataFromNHS: get cases data from Government website
 * getDataFromWDM: get cases data from Worldometer website
 * getEnglandFromNHS: get England's area data from Government website
 * getScotlandFromNHS: get Scotland's area data from Government website
 * 
**/


// The code in this page could be change fast accroding to source website structure
// Keep Monitoring the data is important

// import
const superagent= require('superagent')
const cheerio = require('cheerio')
const utils = require('./utils')
const database = require('./database')
const { addSlashes } = require('slashes')
const csv = require('csv-parser')
const fs = require('fs');

const { http, https } = require('follow-redirects');

const struct = require('./struct.js')

const timeoutDefault = {
    response: 0, //delay 0 second
    deadline: 100000 // 10 second timeout
}


const figure = [
    {
        source: "NHS",
        link: "https://www.gov.uk/guidance/coronavirus-covid-19-information-for-the-public",
        more: "http://www.arcgis.com/sharing/rest/content/items/bc8ee90225644ef7a6f4dd1b13ea1d67/data",
        id: "number-of-cases"
    },
    {
        source: "Worldometers",
        link: "https://www.worldometers.info/coronavirus/",
        id: "main_table_countries_today"
    }
]

const areaData = [
    {
        name: "england",
        link: "http://www.arcgis.com/sharing/rest/content/items/b684319181f94875a6879bbc833ca3a6/data",
        id: "download-csv-file"
    },
    {
        name: "scotland",
        link: "https://www.gov.scot/coronavirus-covid-19/",
        id: "overview"
    },
    {
        name: "northernIreland",
        link: "https://www.publichealth.hscni.net/news/covid-19-coronavirus",
        id: "what-is-the-situation-in-northern-ireland"
    },
    {
        name: "wales",
        link: "https://gov.wales/written-statement-coronavirus-covid-19-1",
        id: "announcement-item__article"
    }
]

function getData(){

    getDataFromNHS(figure[0])
    getMoreFromNHS(figure[0])
    getDataFromWDM(figure[1])
    getAreaData()


    //getEnglandFromNHS(areaData[0])
    //getScotlandFromNHS(areaData[1])
    //getWales(areaData[3])
    //getNIreland(areaData[2])
}

async function getAreaData(){
    const england = await getEnglandFromNHS(areaData[0])
    const scotland = await getScotlandFromNHS(areaData[1])
    const nIreland = await getNIreland(areaData[2])
    const wales = await getWales(areaData[3])

    if(england && scotland && nIreland && wales){

        
        let res = england.concat(scotland)

        // Wales and Northern Ireland are as one due to there is no regional data available
        if(wales) res.push(wales)
        if(nIreland) res.push(nIreland)
        
        let ready = {
            area: addSlashes(JSON.stringify(res))
        }


        if(ready.area != "" || ready.area.length > 0){
            database.update(1, ready)
        }
    }
}

function getMoreFromNHS(data){
    return new Promise(resolve => {

        var ready = {
            death: 0,
            england: 0,
            scotland: 0,
            wales: 0,
            nireland: 0
        }
        
        const readXlsxFile = require('read-excel-file/node');

        const file = fs.createWriteStream("nation.xlsx");

        const request = http.get(data.more, response => {
            if(response.statusCode == 200){
                var pipe = response.pipe(file)

                response.on('end', ()=>{
                    // Call only when pipe ended
                    let f = fs.createReadStream('nation.xlsx')
                    
                    readXlsxFile(f).then((rows) => {
                        if(rows.length > 0){
                            
                            for(let i=0;i<rows[0].length;i++){
                                
                                if(rows[0][i] == "TotalUKDeaths"){
                                    ready.death = rows[1][i]
                                    
                                } 

                                else if(rows[0][i] == "EnglandCases"){
                                    ready.england = rows[1][i]
                                }

                                else if(rows[0][i] == "ScotlandCases"){
                                    ready.scotland = rows[1][i]
                                }

                                else if(rows[0][i] == "WalesCases"){
                                    ready.wales = rows[1][i]
                                }

                                else if(rows[0][i] == "NICases"){
                                    ready.nireland = rows[1][i]
                                }
                                
                            }

                            database.update(1, ready)
                            resolve(true)
                        } else {
                            resolve(false)
                        }
                        
                    })
                })

            } else {
                resolve(false)
            }
        }).on('error', err => {
            console.error(err)
            resolve(false)
        })

    })
}

// get NHS offical data
function getDataFromNHS(data){

    superagent.get(data.link).timeout(timeoutDefault).end((err, res) => {

        var tmp = utils.deepCopy(struct.getStruct())
        delete tmp.death


        if (err) {

            recordError(data.source, "timeout", err)
            return

        } else {

            let $ = cheerio.load(res.text)

            $(('h2#'+data.id)).each((idx, ele) => {
                let next = $(ele).next()
                let txt = next.text()
                txt = txt.split(" ")

                // Check word 'positive' for getting positive number, both confirm and death use the word 'positive'
                let cMIdx = utils.idIdxsInArr("positive.", txt) // return an array with position with word 'positive'
                let nMIdx = utils.idIdxsInArr("negative", txt) // return an array with negative with word 'negative'

                if(cMIdx != -1 
                    && nMIdx != -1 
                    && cMIdx.length > 0 
                    && nMIdx.length > 0 
                    && txt.length>0){

                    // Process and save to number
                    let confirmed = parseInt(txt[cMIdx[0] - 3].replace(/,/g, ""))
                    let negative = parseInt(txt[nMIdx[0] - 3].replace(/,/g, ""))
                    

                    // Record if Error and return
                    if(isNaN(confirmed) || isNaN(negative)){
                        let errData = {
                            confirmed: confirmed,
                            negative: negative
                        }
                        recordError(data.source, "source struct changed", errData)
                        return
                    }

                    // Final check and put into database
                    tmp.confirmed = confirmed ? confirmed : -1
                    tmp.negative = negative ? negative : -1
                    tmp.ts = utils.getTS()

                    database.update(1, tmp)
                
                
                }
    
            })

        }
    })
}

function getDataFromWDM(data){

    var tmp = utils.deepCopy(struct.getStruct())

    superagent.get(data.link).timeout(timeoutDefault).end((err, res) => {
        if(err){
            recordError(data.source, "timeout", err)
        }else{
            let $ = cheerio.load(res.text)
            let trs = $('table#' + data.id + ' tbody tr')


            trs.each(function (idx, value){
                $value = $(value).find('td');
                $value.each(function (idxx, single) {
                    //console.log($(single).text())
                    if (0 === idxx) {
                        
                        if($(single).text().indexOf("UK") != -1){
                            
                            tmp.confirmed = parseInt($($value[idxx+1]).text().replace(/,/g, ""))
                            tmp.death = parseInt($($value[idxx+3]).text().replace(/,/g, ""))
                            tmp.cured = parseInt($($value[idxx+5]).text().replace(/,/g, "")) 
                            tmp.ts = utils.getTS()
                            
                            // Record if Error and return
                            if(isNaN(tmp.confirmed) || isNaN(tmp.death) || isNaN(tmp.cured)){
                                let errData = {
                                    confirmed: tmp.confirmed,
                                    death: tmp.death,
                                    cured: tmp.cured,
                                }
                                recordError(data.source, "source struct changed", errData)
                                return
                            }


                            database.update(2, tmp)
                            return
                        }
                    }
                })
            })

            

        }
    })
}

function getEnglandFromNHS(data){
    return new Promise(resolve => {

        var results = []

        const http = require('http');

        const file = fs.createWriteStream("england_data.csv");
        const request = http.get(data.link, function(response) {
            if(response.statusCode == 200){

                response.pipe(file)


                fs.createReadStream('england_data.csv')
                .pipe(csv())
                .on('data', (data) => {
                    let tmp = {location: data.GSS_NM, number: data.TotalCases}
                    results.push(tmp)
                })
                .on('end', () => {

                    resolve(results)
                })
            } else {
                resolve(false)
            }
        }).on("error", ()=>{
            resolve(false)
        })

    })
}

function getScotlandFromNHS(data){

    return new Promise(resolve => {

        var result = []

        superagent.get(data.link).timeout(timeoutDefault).end((err, res) => {
            if(err){
                recordError(data.source, "timeout", err)
                resolve(false)
            }else{
                
                let $ = cheerio.load(res.text)
                let trs = $('#' + data.id + ' table tbody tr')
                
                trs.each(function (idx, value){
                    $value = $(value).find('td')
                    let tmpSingle = {}
                    $value.each(function (idxx, single) {
                        if(idxx == 0) tmpSingle.location = $(single).text()
                        if(idxx == 1) tmpSingle.number = parseInt($(single).text().replace(/,/g, ""))
                    })

                    result.push(tmpSingle)
                })
                
                resolve(result)

            }
        })

      })

    
}

// As Wales gov didnt provided regional data (I couldt find it anyway, Wales was treat as a whole area)
// Only return wales number only
function getWales(data){

    return new Promise(resolve => {

        var result = 0

        superagent.get(data.link).timeout(timeoutDefault).end((err, res) => {
            if(err){
                recordError(data.source, "timeout", res)
                resolve(false)
            }else{
                
                let $ = cheerio.load(res.text)
                let trs = $('#' + data.id + ' div')

                let c = $($(trs)[0]).find('div')[2]
                trs = ($(c).children()[2])

                let txt = $(trs).text()
                if(txt.indexOf("total") != -1){
                    txt = txt.split(" ")
                    let idx = txt.indexOf("cases")
                    result = parseInt(txt[idx+2])
                    
                } else {
                    result = null
                }

                resolve({location: "Wales", number: result})

            }
        })

    })
}

function getNIreland(data){

    return new Promise(resolve => {

        var result = 0

        superagent.get(data.link).timeout(timeoutDefault).end((err, res) => {
            if(err){
                recordError(data.source, "timeout", res)
                resolve(false)
            }else{
                
                let $ = cheerio.load(res.text)
                let trs = $('h2#' + data.id).next().next()
                let txt = $(trs).text()
                txt = txt.split(" ")

                
                

                let txtIndex = txt.indexOf("Ireland")

                // Maybe with ending period, ready for not
                result = parseInt(txt[txtIndex+2])
                resolve({location: "Northern Ireland", number: result})

            }
        })

    })
}

function recordError(source, reason, data){

    try{
        
        let ready = {
            source: source,
            reason: reason,
            detail: utils.isJson(data) ? JSON.stringify(data) : String(data)
        }

        
    
        // Prevent too long
        if(ready.detail.length > 1000){
            ready.detail = "too many, check: " + source
        }
        
        database.saveErr(ready)
    } catch{
        // do nothing...
        // dont stop main thread
    }

}


module.exports={
    getData: getData
}