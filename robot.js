// The code in this page could be change fast accroding to source website structure
// Keep Monitoring the data is important

// import
const superagent= require('superagent')
const cheerio = require('cheerio')
const fs = require('fs')
const utils = require('./utils')
const database = require('./database')
const { addSlashes } = require('slashes');

const struct = require('./struct.js')


var figure = [
    {
        source: "NHS",
        link: "https://www.gov.uk/guidance/coronavirus-covid-19-information-for-the-public",
        id: "number-of-cases"
    },
    {
        source: "Media",
        link: "https://www.worldometers.info/coronavirus/",
        id: "main_table_countries"
    }
]

var areaData = [
    {
        name: "england",
        link: "https://www.gov.uk/guidance/coronavirus-covid-19-information-for-the-public",
        id: "cases-identified-in-england"
    },
    {
        name: "scotland",
        link: "https://www.gov.scot/coronavirus-covid-19/",
        id: "overview"
    }
]

function getFigure(){

    return figure
}

function getADS(){
    return areaData
}

function getData(){
    getDataFromNHS(figure[0])
    getDataFromWDM(figure[1])
    //getEnglandFromNHS(areaData[0])
    //getScotlandFromNHS(areaData[1])
    setTimeout(()=>{
        getAreaData()
    }, 2000)
    
}

async function getAreaData(){
    const england = await getEnglandFromNHS(areaData[0])
    const scotland = await getScotlandFromNHS(areaData[1])
    
    const res = england.concat(scotland)
    var ready = {
        area: addSlashes(JSON.stringify(res))
    }

    database.update(1, ready)
    //console.log(addSlashes(JSON.stringify(ready)))
}

// get NHS offical data
function getDataFromNHS(data){


    superagent.get(data.link).end((err, res) => {

        var tmp = utils.deepCopy(struct.getStruct())

        if (err) {
            //console.log(`fail to update - ${err}`)
            fs.appendFile('log.txt', 'check link' + data.source + '\n')
        } else {

            let $ = cheerio.load(res.text)

            $(('h2#'+data.id)).each((idx, ele) => {
                let next = $(ele).next()
                let txt = next.text()
                txt = txt.split(" ")

                // Check word 'positive' for getting positive number, both confirm and death use the word 'positive'
                let cMIdx = utils.idIdxsInArr("positive", txt) // return an array with position with word 'positive'
                let nMIdx = utils.idIdxsInArr("negative", txt) // return an array with nagative with word 'nagative'

                // Process and save to number
                
                let confirm = parseInt(txt[cMIdx[0] - 4].replace(/,/g, ""))
                let nagative = parseInt(txt[nMIdx[0] - 3].replace(/,/g, ""))
                let death = parseInt(txt[cMIdx[1]-4].replace(/,/g, "")) ? parseInt(txt[cMIdx[1]-4].replace(/,/g, "")) : utils.matchNum(txt[cMIdx[1]-4])

                if(cMIdx != -1){
                    // Final check and put into database
                    tmp.confirm = confirm ? confirm : -1
                    tmp.nagative = nagative ? nagative : -1
                    tmp.death = death ? death : -1
                    tmp.ts = utils.getTS()

                    database.update(1, tmp)
                }

                if(!confirm){
                    fs.appendFile('log.txt', 'check data struct' + data.source + '\n')
                }
    
            })

        }
    })
}

function getEnglandFromNHS(data){

    return new Promise(resolve => {

        var result = []

        superagent.get(data.link).end((err, res) => {
            if(err){

            }else{
                
                let $ = cheerio.load(res.text)

                // Get table
                let locate = $('#' + data.id).next()
                
                // Get all tr in tbody
                let trs = $(locate).find('tr')

                // Loop all tr in tbody
                trs.each(function (idx, value){

                    $value = $(value).find('td')
                    let tmpSingle = {}
                    $value.each(function (idxx, single) {
                        
                        if(idxx == 0) tmpSingle.location = $(single).text()
                        if(idxx == 1) tmpSingle.number = parseInt($(single).text().replace(/,/g, ""))

                    })

                    // Has data
                    if(tmpSingle['location']){
                        // Not total or wait to be determined
                        // No idea why government put a unconfirm data into a confirm data sort by location chart...
                        if(tmpSingle.location != "Total" && tmpSingle.location != "To be determined"){
                            result.push(tmpSingle)
                        }
                    }

                })

                // Resolve promise
                resolve(result)

            }

            
        })

    })

    
}

function getScotlandFromNHS(data){

    return new Promise(resolve => {

        var result = []

        superagent.get(data.link).end((err, res) => {
            if(err){

            }else{
                
                let $ = cheerio.load(res.text)
                //console.log(res.text)
                let trs = $('#' + data.id + ' table tbody tr')
                
                trs.each(function (idx, value){
                    //console.log(value)
                    $value = $(value).find('td')
                    let tmpSingle = {}
                    $value.each(function (idxx, single) {
                        
                        if(idxx == 0) tmpSingle.location = $(single).text()
                        if(idxx == 1) tmpSingle.number = parseInt($(single).text().replace(/,/g, ""))
                        //console.log(single)

                        
                        
                    })

                    result.push(tmpSingle)
                })
                
                resolve(result)

            }
        })
        
        
        

      });

    
}


function getDataFromWDM(data){

    var tmp = utils.deepCopy(struct.getStruct())

    superagent.get(data.link).end((err, res) => {
        if(err){

        }else{
            let $ = cheerio.load(res.text)
            let trs = $('table#' + data.id + ' tbody tr')


            trs.each(function (idx, value){
                $value = $(value).find('td');
                $value.each(function (idxx, single) {
                    //console.log($(single).text())
                    if (0 === idxx) {
                        if($(single).text().indexOf("UK") != -1){
                            tmp.confirm = parseInt($($value[idxx+1]).text().replace(/,/g, ""))
                            tmp.death = parseInt($($value[idxx+3]).text().replace(/,/g, ""))
                            tmp.cured = parseInt($($value[idxx+6]).text().replace(/,/g, "")) 
                            tmp.ts = utils.getTS()
                        }
                    }
                })
            })

            database.update(2, tmp)

        }
    })
}



module.exports={
    getData: getData,
    getADS: getADS,
    getFigure: getFigure
}