
/** 
 * Develop By Jeff Wu
 * 2020.03
 * isjeff.com
**/

/** 
 * DATABASES OPRATION 
 * why we need a database is for saving history, and for admin page.
 * its not have to be this way, you can use other design like nosql
 * as this part is quite easy to read, I will not explain how it works.
 * as you can follow https://www.npmjs.com/package/ali-mysql-client for known how ali-mysql-client works.
 * its writen in Chinese, however, if you know a little bit MySql, just read through the code would be enough.
**/


const DbClient = require("ali-mysql-client")
const utils = require('./utils')
const conf = require('./conf')
const { stripSlashes } = require('slashes')
const md5 = require('md5')

const db = new DbClient(conf.getDB())

// Get current number
async function current(){

    const result = await db
    .select("*")
    .from("current")
    .queryList()

    if(result){
        for(let i=0;i<result.length;i++){
            result[i].area = stripSlashes(result[i].area)
        }
        return { status: true, data: result}
    } else {
        return { status: false, data: null, err: result }
    }

}

// Get current number
async function shadow(){

    const result = await db
    .select("*")
    .from("current_shadow")
    .queryList()

    if(result){
        for(let i=0;i<result.length;i++){
            result[i].area = stripSlashes(result[i].area)
        }
        return { status: true, data: result}
    } else {
        return { status: false, data: null, err: result }
    }

}

async function locations(){
    const result = await db
    .select("*")
    .from("geo")
    .queryList()

    return result ? { status: true, data: result} : { status: false, data: null, err: result }

}


async function addLocation(ready){
    const save = await db
        .insert("geo", ready)
        .execute()

    return save ? { status: true, data: null} : { status: false, data: null, err: save }
}

async function updateLocation(id, data){
    const result = await db
    .update("geo", data)
    .where("id", id)
    .execute()

    return result ? { status: true, data: null} : { status: false, data: null, err: result }
}

// Get all histroy
async function history(){

    const result = await db
    .select("*")
    .from("history")
    .orderby("date asc")
    .queryList()

    if(result){
        return { status: true, data: result}
    } else {
        return { status: false, data: null, err: result }
    }
}

// Get all histroy (figures only)
async function historyFigures(){

    const result = await db
    .select([
        "id",
        "date",
        "confirmed",
        "death",
        "cured",
        "serious",
        "negative",
        "suspected",
    ])
    .from("history")
    .orderby("date asc")
    .queryList()

    if(result){
        return { status: true, data: result}
    } else {
        return { status: false, data: null, err: result }
    }
}

// Update, default to shadow waiting for approvement
async function update(sourceId, data){
    //console.log(data)

    const result = await db
    .update("current_shadow", data)
    .where("id", sourceId)
    .execute()

    return result ? { status: true, err: null } : { status: false, err: result }
}

// Get approve token
async function getApproveToken(){

    const result = await db
    .select("token")
    .from("user")
    .where('id', 1)
    .queryRow()

    return result ? { status: true, data: result } : { status: false, data:null, err: result }
}


// Verify pin for admin page
async function verifyPin(pin, token){
    const result = await db
    .select("*")
    .from("user")
    .where('token', token)
    .queryRow()

    if(result.psw == md5(pin)){
        return { status: true, data: result.id }
    } else {
        return {status: false, data: null}
    }
}

// Officially publish data
async function updateApprove(){

    const result = await db
    .select("*")
    .from("current_shadow")
    .queryList()

    if(result){

        result.forEach(async single => {

            let sid = single.id
            delete single.id;

            const copy = await db
            .update("current", single)
            .where("id", sid)
            .execute()
        })
    }

    return { status: true, data: null, err: null}
}

async function autoApprove(){
    const shadow = await db
    .select("*")
    .from("current_shadow")
    .queryList()

    const current = await db
    .select("*")
    .from("current")
    .queryList()

    let confirmed1 = compare(shadow[0].confirmed, current[0].confirmed)
    let death1 = compare(shadow[0].death, current[0].death)
    let confirmed2 = compare(shadow[1].confirmed, current[1].confirmed)
    let death2 = compare(shadow[1].death, current[1].death)

    if(confirmed1 && confirmed2 && death1 && death2 && noNull(shadow[0].area)){
        updateApprove()
        console.log("approved")
    } else {
        console.log("need approve")
    }

    return
}

function compare(num1, num2){

    if(num1 == null || num1 == "" || isNaN(num1) || num1 == "null" || typeof num1 == null || typeof num1 == undefined || num1 == undefined){
        return false
    }

    const notMuch = 70

    if(num1 >= num2 && (num1 - num2) < notMuch){
        return true
    } else {
        return false
    }
}

function noNull (a) {
    let d = JSON.parse(stripSlashes(a))
    for(let i=0;i<d.length;i++){
        if(d.location == "" || d.location == "null" || d.number == "" || d.number == "null" || !isNaN(d.number)){
            return false
        }
    }

    return true
}

async function saveHistory(){
    const result = await db
    .select("*")
    .from("current")
    .queryList()

    const ready = {
        date: utils.getTS(),
        confirmed: result[0].confirmed,
        death: result[0].death,
        cured: result[1].cured,
        serious: result[0].serious,
        negative: result[0].negative,
        suspected: result[0].suspected,
        england: result[0].england,
        scotland: result[0].scotland,
        wales: result[0].wales,
        nireland: result[0].nireland,
        area: result[0].area
    }

    const save = await db
        .insert("history", ready)
        .execute()

    if(save){
        return { status: true, data: null}
    } else {
        return { status: false, data: null, err: save}
    }

}

async function addHistory(ready){
    delete ready.id
    delete ready.england
    delete ready.scotland
    delete ready.wales
    delete ready.nireland
    const save = await db
        .insert("history", ready)
        .execute()

}

async function saveErr(ready){
    const save = await db
        .insert("err", ready)
        .execute()

    return
}




module.exports = {
    current: current,
    shadow: shadow,
    history: history,
    historyFigures: historyFigures,
    update: update,
    locations: locations,
    addLocation: addLocation,
    updateLocation: updateLocation,
    updateApprove: updateApprove,
    autoApprove: autoApprove,
    saveHistory: saveHistory,
    getApproveToken: getApproveToken,
    verifyPin: verifyPin,
    saveErr: saveErr,
    addHistory: addHistory
}