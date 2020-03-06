const robot = require('./robot.js')
const database = require('./database')
const schedule = require('node-schedule-tz');

const express = require('express')
const app = express()


let server = app.listen(8003, function () {
  let host = server.address().address;
  let port = server.address().port;
  console.log('Your App is running at http://%s:%s', host, port);
})

app.get('/', async function (req, res) {
    let data = await database.current()
    data.areaDataSource = robot.getADS()
    res.send(data)
    return
})

// Approve shadow data become official data
app.get('/approve', async function (req, res) {

  let token = await database.getApproveToken()

  token = token.data.token

  if(req.query.token != token){

    res.send("not allow")
    return 

  } else {
    database.updateApprove()
    res.send(JSON.stringify({status: true, data: null}))
    return
  }
})

robot.getData()

var updateAll = schedule.scheduleJob('updateall', '01 * * * *', 'Europe/London', function(){
  robot.getData()
  return
})

var recordHistory = schedule.scheduleJob('history', '10 50 23 * * *', 'Europe/London', function(){
  database.saveHistory()
  return
})
