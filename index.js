const robot = require('./robot.js')
const database = require('./database')
const schedule = require('node-schedule-tz')
const fs = require('fs')
var path = require('path')

const express = require('express')
const app = express()

// Set CROS
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Credentials", "true")
  res.header("Access-Control-Allow-Headers", "X-Requested-With")
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS")
  res.header("X-Powered-By",' 3.2.1')
  //res.header("Content-Type", "application/json;charset=utf-8")
  next()
})

// Start HTTP server
let server = app.listen(8003, function () {
  let host = server.address().address;
  let port = server.address().port;
  console.log('Your App is running at http://%s:%s', host, port);
})

app.get('/', async function (req, res) {
    //let data = await database.current()
    //data.areaDataSource = robot.getADS()
    let data = fs.readFile(path.join(__dirname, 'data/data.json'), 'utf-8', (err, data)=>{
      if(err){
        res.send('an error occur')
      } else {
        res.send(data)
      }
      return
    })
    
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
    updateData()
    res.send(JSON.stringify({status: true, data: null}))
    return
  }
})

// Approve shadow data become official data
app.get('/visual', async function (req, res) {
  res.sendFile(path.join(__dirname, 'visual/index.html'))
})

// Approve shadow data become official data
app.get('/history', async function (req, res) {
  let data = fs.readFile(path.join(__dirname, 'data/history.json'), 'utf-8', (err, data)=>{
    if(err){
      res.send('an error occur')
    } else {
      res.send(data)
    }
    return
  })
})


// On create
updateData()
putHistory()

// Update data
async function updateData(){
  let update = await robot.getData()
  if(update){
    let data = await database.current()
    if(data){
      fs.writeFile(path.join(__dirname, 'data/data.json'), JSON.stringify(data), ()=>{
        return true
      })
    }
  }
}


// Put data into history json
async function putHistory(){
  let data = await database.history()
  if(data){
    fs.writeFile(path.join(__dirname, 'data/history.json'), JSON.stringify(data), ()=>{
      return true
    })
  }
}


// Schedule Tasks
var updateAll = schedule.scheduleJob('updateall', '10 * * * *', 'Europe/London', function(){
  updateData()
  database.autoApprove()
  return
})

var recordHistory = schedule.scheduleJob('history', '10 50 23 * * *', 'Europe/London', async function(){
  let save = await database.saveHistory()
  if(save){
    putHistory()
  }
  return
})
