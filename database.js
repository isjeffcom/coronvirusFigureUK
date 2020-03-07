const DbClient = require("ali-mysql-client")
const utils = require('./utils')
const { stripSlashes } = require('slashes')

const db = new DbClient({
    host     : 'localhost',
    user     : 'covid19',
    password : 'wuhanjiayou',
    database : 'corona',
    port: "8889"
})


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

async function saveHistory(){
    const result = await db
    .select("*")
    .from("current")
    .queryList()

    const ready = {
        date: utils.getTS(),
        confirm: result[0].confirm,
        death: result[0].death,
        cured: result[1].cured,
        icu: result[0].icu,
        nagative: result[0].nagative,
        suspect: result[0].suspect,
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


module.exports = {
    current: current,
    update: update,
    updateApprove: updateApprove,
    saveHistory: saveHistory,
    getApproveToken: getApproveToken
}