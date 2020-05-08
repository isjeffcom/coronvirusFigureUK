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
const { addSlashes, stripSlashes } = require('slashes')
//const csv = require('csv-parser')
const puppeteer = require('puppeteer')
const readXlsxFile = require('read-excel-file/node')

// File System
const fs = require('fs')
const path = require('path')

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
        id: "number-of-cases-and-deaths"
    },
    {
        source: "Worldometers",
        link: "https://www.worldometers.info/coronavirus/",
        id: "main_table_countries_today"
    }
]

const monthName = ['jan', 'feb', 'mar', 'april', 'may', 'june', 'july', 'aug', 'sep', 'nov', 'dec']

const tlData = { link: "https://www.gov.uk/guidance/coronavirus-covid-19-information-for-the-public", id: "full-history" }
const hospitalData = {source: "gov", link: "https://www.gov.uk/government/publications/slides-and-datasets-to-accompany-coronavirus-press-conference-", class: "attachment-details"}

const areaData = [
    {
        name: "england",
        link: "https://coronavirus.data.gov.uk/#category=utlas&map=rate",
        id: "utlas"
    },
    {
        name: "scotland",
        link: "https://www.gov.scot/publications/coronavirus-covid-19-tests-and-cases-in-scotland/",
        id: "preamble"
    },
    {
        name: "northernIreland",
        link: "https://www.publichealth.hscni.net/news/covid-19-coronavirus",
        id: "what-is-the-situation-in-northern-ireland"
    },
    {
        name: "wales",
        link: "https://bing.com/covid/data",
        id: "announcement-item__article"
    }
]

let allCountires = {
    name: "all",
    link: "https://coronavirus.data.gov.uk/#category=nations&map=rate",
    id: "nations"
}

function getData(){

    try {

        getDataFromNHS(figure[0])
        getDataFromWDM(figure[1])

        process.nextTick(()=>{
            getAreaData()
        })

        process.nextTick(()=>{
            getCountries(allCountires)
        })

        process.nextTick(()=>{
            getHospitalData(hospitalData)
        })

        process.nextTick(()=>{
            getTimeline(tlData)
        })

    } catch {
        console.log("major error")
    }

}

async function getAreaData(){
    const england = await getEnglandFromNHS(areaData[0])
    const scotland = await getScotlandFromNHS(areaData[1])
    const nIreland = await getNIreland(areaData[2])
    const wales = await getWales(areaData[3])

    if(england && scotland && nIreland && wales){
        
        let res = england.concat(scotland)
        res = res.concat(wales)
        
        // Northern Ireland is as one due to there is no regional data available
        res.push(nIreland)
        
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

            recordError(data.source, "timeout", err)
            return

        } else {

            let $ = cheerio.load(res.text)

            $(('h2#'+data.id)).each((idx, ele) => {

                let testReady = $(ele).next()
                let testTxt = testReady.text()
                testTxt = testTxt.split(" ")

                let posiReady = $(ele).next().next()
                let posiTxt = posiReady.text()
                posiTxt = posiTxt.split(" ")

                let txtDeath = $(posiReady).next().text()
                txtDeath = txtDeath.split(" ")

                // Check word 'positive' for getting positive number, both confirm and death use the word 'positive'
                let teMIdx = utils.idIdxsInArr("tests", testTxt) // return an array with position with word 'positive'
                let cMIdx = utils.idIdxsInArr("positive.", posiTxt) // return an array with position with word 'positive'
                let tMIdx = utils.idIdxsInArr("tested", posiTxt) // return an array with negative with word 'negative'
                let dMIdx = utils.idIdxsInArr("died.", txtDeath) // return an array with negative with word 'negative'

                if(cMIdx != -1 
                    && tMIdx != -1 
                    && cMIdx.length > 0 
                    && tMIdx.length > 0 
                    && posiTxt.length>0){

                    // Process and save to number
                    let testedDone = parseInt(testTxt[teMIdx[0] - 1].replace(/,/g, ""))
                    
                    let confirmed = parseInt(posiTxt[cMIdx[0] - 2].replace(/,/g, ""))
                    
                    let tested = parseInt(posiTxt[tMIdx[0] - 4].replace(/,/g, ""))
                    
                    let negative = tested - confirmed
                    let death = parseInt(txtDeath[dMIdx[0] - 2].replace(/,/g, ""))
                    
                    // 2 or 3, changing all the time
                    if(!death) death = parseInt(txtDeath[dMIdx[0] - 3].replace(/,/g, ""))
                    
                    // Debug Line
                    //console.log(confirmed, tested, negative, death, testedDone)

                    // Record if Error and return
                    if(isNaN(confirmed) || isNaN(negative)){
                        let errData = {
                            death: death,
                            confirmed: confirmed,
                            negative: negative,
                            tested: tested,
                            tested_done: testedDone
                        }
                        recordError(data.source, "source struct changed", errData)
                        //console.log(errData)
                        return
                    }

                    // Final check and put into database
                    
                    tmp.confirmed = confirmed ? confirmed : -1
                    tmp.negative = negative ? negative : -1
                    tmp.death = death ? death : -1
                    tmp.tested = tested ? tested : -1
                    tmp.test_done = testedDone ? testedDone : -1

                    

                    tmp.ts = utils.getTS()

                    database.update(1, tmp)
                
                
                }
    
            })

        }
    })
}

// Get data from worldometers
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

                    if (0 === idxx) {
                        
                        if($(single).text().indexOf("UK") != -1){
                            
                            tmp.confirmed = parseInt($($value[idxx+1]).text().replace(/,/g, ""))
                            tmp.death = parseInt($($value[idxx+3]).text().replace(/,/g, ""))
                            tmp.cured = parseInt($($value[idxx+5]).text().replace(/,/g, "")) 
                            tmp.serious = parseInt($($value[idxx+7]).text().replace(/,/g, "")) 
                            tmp.ts = utils.getTS()
                            
                            // Record if Error and return
                            if(isNaN(tmp.confirmed) || isNaN(tmp.death) || isNaN(tmp.cured)){
                                let errData = {
                                    confirmed: tmp.confirmed,
                                    death: tmp.death,
                                    cured: tmp.cured,
                                    serious: tmp.serious
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

async function getEnglandFromNHS(data){
    return new Promise(async resolve => {


        (async () => {
            let result = []
            const browser = await puppeteer.launch({ args: ['--no-sandbox']});
            let page = await browser.newPage()
            page = await page.goto(data.link, {waitUntil: 'networkidle0'}).then(function() {
                return page.content();
            })

            const $ = cheerio.load(page);
            let tables = $('#' + data.id + ' table')
            let trs = $(tables[0]).find('tbody tr')

            //console.log(trs.text())
            trs.each(function (idx, value){
            
                $value = $(value).find('td')
                let tmpSingle = {}
                $value.each(function (idxx, single) {

                    if(idxx == 0){
                        let locText = $(single).text()
                        
                        tmpSingle.location = locText.replace(/\n/g,'')

                        // Remove both front and back space
                        tmpSingle.location = utils.removeFBSpace(tmpSingle.location)
                    } 

                    if(idxx == 1) {
                        let tx = $(single).text().replace(/,/g, "")

                        // Some are *
                        if(!tx || isNaN(tx)){
                            tmpSingle.number = 0
                        } else {
                            tmpSingle.number = parseInt(tx)
                        }
                        
                        // Some might completely none
                        if(isNaN(tmpSingle.number)){
                            tmpSingle.number = 0
                        }
                        
                    }
                    
                    
                })
            
                result.push(tmpSingle)

                
            })
            
            await browser.close()

            resolve(result)
          
            
        })();

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
                let tables = $('#' + data.id + ' table')
                let trs = $(tables[0]).find('tbody tr')
                //let trs = $('#' + data.id + ' table tbody tr')
                
                trs.each(function (idx, value){
                    
                    $value = $(value).find('td')
                    let tmpSingle = {}
                    $value.each(function (idxx, single) {
                        // Ignore first row as gov.scot dont know the first row of an HTML table should use: <th>
                        if(idx != 0){
                            if(idxx == 0){
                                let locText = $(single).text()
                                
                                tmpSingle.location = locText.replace(/\n/g,'')

                                // Remove both front and back space
                                tmpSingle.location = utils.removeFBSpace(tmpSingle.location)
                            } 

                            if(idxx == 1) {
                                let tx = $(single).text().replace(/,/g, "")

                                // Some are *
                                if(!tx || isNaN(tx)){
                                    tmpSingle.number = 0
                                } else {
                                    tmpSingle.number = parseInt(tx)
                                }
                                
                                // Some might completely none
                                if(isNaN(tmpSingle.number)){
                                    tmpSingle.number = 0
                                }
                                
                            }
                        }
                        
                    })
                
                    if(idx != 0)  result.push(tmpSingle)

                   
                })
                
                resolve(result)

            }
        })

    })

    
}

// As Wales gov didnt provided regional data (I couldt find it anyway, Wales was treat as a whole area)
// Only return wales number only
function getWales(data){

    return new Promise(async resolve => {

        let result = []
        let wales = await database.getWales()
        resolve({ location: "Wales", number: wales.wales})

    })
}

function getNIreland(data){

    return new Promise(async resolve => {
        let nireland = await database.getnIreland()
        resolve({location: "Northern Ireland", number: nireland.nireland})
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


// Get Hospital Data
function getHospitalData(data){
    return new Promise(async resolve => {

        var ready = {}

        let d = new Date()

        var now = await database.getHospitalArea()
        now = JSON.parse(stripSlashes(now.hospitalArea))

        //console.log(data.link + d.getDate() + '-' + monthName[d.getMonth()] + '-' + d.getFullYear())

        superagent.get(data.link + (d.getDate()-1) + '-' + monthName[d.getMonth()] + '-' + d.getFullYear()).timeout(timeoutDefault).end((err, res) => {
            
            if(err){
                // Wont update if link doesnt existd yet
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

                            const { getJsDateFromExcel } = require("excel-date-to-js")

                            readXlsxFile('./hospital.xlsx', { sheet: 5 }).then(async (res)=>{

                                let today = utils.tsToDate(new Date('2020-05-06').getTime())
                                let tmpArea = {england: 0, scotland: 0, nIreland: 0, wales: 0}
                                let tmpAll = { hospital: 0 }

                                for(let c=0;c<res.length;c++){
                                    let row = res[c]
                                    //console.log(isNaN(row[0]), isNaN(row[2]))
                                    if(!isNaN(row[0]) && !isNaN(row[2])){

                                        let thisDate = new Date(getJsDateFromExcel(row[0])).getTime()

                                        let num = row[2]
                                        let locName = row[1]

                                        // If is today
                                        if(utils.tsToDate(thisDate) == today){
                                            tmpAll.hospital += num

                                            if(locName == "Scotland" ){
                                                tmpArea.scotland = num
                                            }
                            
                                            else if(locName == "Wales"){
                                                tmpArea.wales = num
                                            }
                            
                                            else if(locName == "Northern Ireland"){
                                                tmpArea.nIreland = num
                                            }
                            
                                            else{
                                                tmpArea.england += num
                                            }
                                        }
                                    }
                                }

                                //console.log(tmpArea)
                                //console.log(tmpAll)


                                tmpArea.england = tmpArea.england == 0 ? now.england : tmpArea.england
                                tmpArea.scotland = tmpArea.scotland == 0 ? now.scotland : tmpArea.scotland
                                tmpArea.wales = tmpArea.wales == 0 ? now.wales : tmpArea.wales
                                tmpArea.nIreland = tmpArea.nIreland == 0 ? now.nIreland : tmpArea.nIreland

                                ready.hospital = tmpAll.hospital
                                ready.hospitalArea = addSlashes(JSON.stringify(tmpArea))

                                database.update(1, ready)

                                //console.log(ready)

                            })
                        })
                    })

                }
                
                
                resolve(true)

            }
        })

    })
}

function getTimeline(data){
    superagent.get(data.link).timeout(timeoutDefault).end((err, res) => {


        if (err) {

            //recordError("timeline", "timeout", err)
            return

        } else {

            let allRes = {timeline: []}

            let $ = cheerio.load(res.text)

            $(('div#'+data.id)).each((idx, ele) => {

                let all = $(ele).find("li")
                if(all && all.length > 99){

                    let last

                    for(let i=0;i<all.length;i++){
                        let el = all[i]
                        let s = $(el).find("time").attr("datetime")
                        allRes.timeline.push(s)
                    }
    
                    if(allRes.timeline.length > 99){
                        fs.writeFileSync(path.join(__dirname, 'data/timeline.json'), JSON.stringify(allRes), ()=>{
                            // Do nothing
                        })
                    }
                }
                
            })


        }
    })
}


async function getCountries(data){

        (async () => {
            let result = []
            const browser = await puppeteer.launch({ args: ['--no-sandbox']});
            let page = await browser.newPage()
            page = await page.goto(data.link, {waitUntil: 'networkidle0'}).then(function() {
                return page.content();
            })

            const $ = cheerio.load(page);
            let tables = $('#' + data.id + ' table')
            let trs = $(tables[0]).find('tbody tr')

            //console.log(trs.text())
            trs.each(function (idx, value){
            
                $value = $(value).find('td')
                
                let tmpSingle = {}
                $value.each(function (idxx, single) {
                    if(idxx == 0){
                        let locText = $(single).text()
                        
                        tmpSingle.location = locText.replace(/\n/g,'')

                        // Remove both front and back space
                        tmpSingle.location = utils.removeFBSpace(tmpSingle.location)
                    } 

                    if(idxx == 1) {
                        let tx = $(single).text().replace(/,/g, "")

                        // Some are *
                        if(!tx || isNaN(tx)){
                            tmpSingle.number = 0
                        } else {
                            tmpSingle.number = parseInt(tx)
                        }
                        
                        // Some might completely none
                        if(isNaN(tmpSingle.number)){
                            tmpSingle.number = 0
                        }
                        
                    }
                    
                })
            
                result.push(tmpSingle)

                
            })

            tmp = {
                england: result[0].number,
                nIreland: result[1].number,
                scotland: result[2].number,
                wales: result[3].number
            }
            
            database.update(1, tmp)
            await browser.close()
        })();
}

module.exports={
    getData: getData
}