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

const struct = require('./struct.js')

const timeoutDefault = {
    response: 0, //delay 0 second
    deadline: 100000 // 10 second timeout
}


const figure = [
    {
        source: "NHS",
        link: "https://www.gov.uk/guidance/coronavirus-covid-19-information-for-the-public",
        id: "number-of-cases"
    },
    {
        source: "Worldometers",
        link: "https://www.worldometers.info/coronavirus/",
        id: "main_table_countries"
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
        id: "situation-in-northern-ireland"
    },
    {
        name: "wales",
        link: "https://gov.wales/written-statement-coronavirus-covid-19-1",
        id: "announcement-item__article"
    }
]

function getData(){
    return new Promise(resolve => {
        getDataFromNHS(figure[0])
        getDataFromWDM(figure[1])
        getAreaData()

        //getEnglandFromNHS(areaData[0])
        //getScotlandFromNHS(areaData[1])
        //getWales(areaData[3])
        //getNIreland(areaData[2])
        

        resolve(true)
    })
    
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

// get NHS offical data
function getDataFromNHS(data){

    superagent.get(data.link).timeout(timeoutDefault).end((err, res) => {

        var tmp = utils.deepCopy(struct.getStruct())

        if (err) {

            recordError(data.name, "timeout", err)
            return

        } else {

            let $ = cheerio.load(res.text)

            $(('h2#'+data.id)).each((idx, ele) => {
                let next = $(ele).next()
                let txt = next.text()
                txt = txt.split(" ")

                // Check word 'positive' for getting positive number, both confirm and death use the word 'positive'
                let cMIdx = utils.idIdxsInArr("positive", txt) // return an array with position with word 'positive'
                let nMIdx = utils.idIdxsInArr("negative", txt) // return an array with negative with word 'negative'

                // Process and save to number
                let confirmed = parseInt(txt[cMIdx[0] - 4].replace(/,/g, ""))
                let negative = parseInt(txt[nMIdx[0] - 3].replace(/,/g, ""))
                let death = parseInt(txt[cMIdx[1]-4].replace(/,/g, "")) ? parseInt(txt[cMIdx[1]-4].replace(/,/g, "")) : utils.matchNum(txt[cMIdx[1]-4])

                // Record if Error and return
                if(isNaN(confirmed) || isNaN(negative) || isNaN(death)){
                    let errData = {
                        confirmed: confirmed,
                        negative: negative,
                        death: death
                    }
                    recordError(data.name, "source struct changed", errData)
                    return
                }

                if(cMIdx != -1){
                    // Final check and put into database
                    tmp.confirmed = confirmed ? confirmed : -1
                    tmp.negative = negative ? negative : -1
                    tmp.death = death ? death : -1
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
            recordError(data.name, "timeout", err)
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
                                recordError(data.name, "source struct changed", errData)
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
        const fs = require('fs');

        const file = fs.createWriteStream("england_data.csv");
        const request = http.get(data.link, function(response) {
            if(response.statusCode == 200){

                response.pipe(file)
                //console.log(csv(file))

                fs.createReadStream('england_data.csv')
                .pipe(csv())
                .on('data', (data) => {
                    let tmp = {location: data.GSS_NM, number: data.TotalCases}
                    results.push(tmp)
                })
                .on('end', () => {
                    //console.log(results)
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


/*function getEnglandFromNHS(data){

    return new Promise(resolve => {

        var result = []

        superagent.get(data.link).timeout(timeoutDefault).end((err, res) => {
            if(err){
                recordError(data.name, "timeout", err)
                resolve(false)
            }else{
                
                let $ = cheerio.load(res.text)

                // Get table
                let locate = $('#' + data.id).next().next()
                
                // Get all tr in tbody
                let trs = $(locate).find('tr')


                // Loop all tr in tbody
                trs.each(function (idx, value){

                    $value = $(value).find('td')
                    let tmpSingle = {}
                    $value.each(function (idxx, single) {
                        //console.log($(single).text())
                        if(idxx == 0) tmpSingle.location = $(single).text()
                        if(idxx == 1) tmpSingle.number = $(single).text()
                            
                    })

                    // Has data
                    if(tmpSingle['location']){
                        // Not total or wait to be determined
                        // No idea why government put a unconfirm data into a confirm data sort by location chart...
                        if(tmpSingle.location.indexOf("Awaiting confirmation") == -1){
                            result.push(tmpSingle)
                        }
                    }

                })

                // Resolve promise
                resolve(result)

            }

            
        })

    })
}*/

function getScotlandFromNHS(data){

    return new Promise(resolve => {

        var result = []

        superagent.get(data.link).timeout(timeoutDefault).end((err, res) => {
            if(err){
                recordError(data.name, "timeout", err)
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
                recordError(data.name, "timeout", res)
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
                /*trs.each(function (idx, value){

                    $value = $(value)

                    let tmpSingle = {}

                    $value.each(function (idxx, single) {
                        let txt = $(single).text()
                        if(txt.indexOf('total number of confirmed cases') != -1){
                            let txtBuff = txt.split(' ')
                            let txtBuffIndex = txtBuff.indexOf('cases')

                            result = parseInt(txtBuff[txtBuffIndex+4])
                        }
                    })

                })*/

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
                recordError(data.name, "timeout", res)
                resolve(false)
            }else{
                
                let $ = cheerio.load(res.text)
                let trs = $('h2#' + data.id).next().next()
                let txt = $(trs).text()
                txt = txt.split(" ")

                let txtIndex = txt.indexOf("positive")

                // Maybe with ending period, ready for not
                txtIndex = txtIndex == -1 ? txt.indexOf("positive.") : txtIndex
                result = parseInt(txt[txtIndex-1])

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
        if(ready.data.length > 1000){
            ready.data = "too many, check: " + source
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