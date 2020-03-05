// import
const superagent= require('superagent')
const cheerio = require('cheerio')
const fs = require('fs')

const link = 'https://www.gov.uk/guidance/coronavirus-covid-19-information-for-the-public'
const idPoint = "number-of-cases"

let figure = {
    confirm: 0,
    dead: 0,
    update: 0
}

function getFigure(){

    /*if(figure.update == 0 || figure.update < getTS() - 1800){
        getData()
    }*/

    return figure
}


function getData(){


    superagent.get(link).end((err, res) => {
        if (err) {
            //console.log(`fail to update - ${err}`)
            fs.appendFile('log.txt', 'check link \n')
        } else {

            let $ = cheerio.load(res.text)
            var confirm

            $(('h2#'+idPoint)).each((idx, ele) => {
                let next = $(ele).next()
                let txt = next.text()
                txt = txt.split(",")
                txt = txt[4].split(" ")
                confirm = getNum(txt)[1]
            })

            figure.confirm = confirm ? confirm : figure.confirm
            figure.update = confirm ? getTS() : figure.update

            if(!confirm){
                fs.appendFile('log.txt', 'check data struct \n')
            }

            return figure

            /*$(('h2#' + idPoint).nextSibling).each((idx, ele) => {
                console.log(ele)
            })*/

        }
    });
}

function getNum (arr){
    let res = []
    for(let i=0;i<arr.length;i++){
        if(parseInt(arr[i])){
            res.push(arr[i])
        }
    }

    return res
}

function getTS () {
    return Date.parse( new Date())
}



module.exports={
    getData: getData,
    getFigure: getFigure
}