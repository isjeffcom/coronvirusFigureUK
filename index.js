/** 
 * Develop By Jeff Wu
 * 2020.03
 * isjeff.com
**/

/** 
 * THE WAY IT WORK
 * 
 * 1. update data by robot.js when first started and also scheduled excute
 * 2-1. IF data from robot has no changed too much, update to 'current' table, and build cache to data/data.json 
 * 2-2. ELSE save to 'current_shadow' table waiting for approve
 * 3. Approve data by using /approve with user token, which id: 1 is the admin user and only he can approve to update
 * 4. Data after update will cached into /data/xxx.json file as aim to reduce database I/O usage
 * **/

/**
 * ROUTER
 * 
 * /: Default api, output cached data from data/data.json
 * /locations: location api, output cached location geographic data
 * /history: history api, output cached history data
 * /approve: action, save data from 'current_shadow' > 'current'
 * /visual: send static website, this is for my own use
 * /admin: admin login, this is for my own use
 * /all: output both 'current' and 'current_shadow' table
**/

/** 
 * SCHEDULE TASKS 
 * 
 * updateAll: updaate data, run every hours
 * recordHistory: record history, run every day
**/

/** 
 * VOIDS AND FUNCTIONS
 * 
 * updateData: updaate data
 * put+xx: cache location to /data/xx.json
**/


// IMPORT LIST
// Database 
const database = require('./database')

// Node Schedule
const schedule = require('node-schedule-tz')

// File system
const fs = require('fs')
const path = require('path')

// Axios Request
const request = require('./request')

// Components
const robot = require('./robot.js')
const utils = require('./utils')

// Express JS
const express = require('express')
const app = express()
var bodyParser = require('body-parser');
//app.use(bodyParser.json()); // support json encoded bodies
//app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Runtime
const process = require('process')

// Conf 
const conf = require('./conf')

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
  console.log('Your App is running at http://%s:%s', host, port)

  // Start function
  onCreate()
  
})

// On create
function onCreate(){

  updateData()
  
  process.nextTick(()=>{
    putHistory()
  })

  process.nextTick(()=>{
    putLocation()
  })

}



// Main Data
app.get('/', async function (req, res) {

    let data = fs.readFile(path.join(__dirname, 'data/data.json'), 'utf-8', (err, data)=>{
      if(err){
        res.send('an error occur, try again')
        updateData()
      } else {
        res.send(data)
      }
      return
    })
    
})

// Get locations center
app.get('/locations', async function (req, res) {
  let data = fs.readFile(path.join(__dirname, 'data/locations.json'), 'utf-8', (err, data)=>{
    if(err){
      res.send('an error occur, try again')
      putLocation()
    } else {
      res.send(data)
    }
    return
  })
})


// Get history data
app.get('/history', async function (req, res) {
  let data = fs.readFile(path.join(__dirname, 'data/history.json'), 'utf-8', (err, data)=>{
    if(err){
      res.send('an error occur, try again')
      putHistory()
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

// Go to visual
app.get('/visual', async function (req, res) {
  res.sendFile(path.join(__dirname, 'visual/index.html'))
})


// FOR ADMIN PAGE
// Admin login
app.get('/admin', async function (req, res){
  
  if(req.query.pin && req.query.token){
    let q = await database.verifyPin(req.query.pin, req.query.token)
    if(q){
      res.send(JSON.stringify(q))
      return
    }
    
  } else {
    res.send({status: false, data: null})
    return
  }
})

// Get both current and current_shadow for admin
app.get('/all', async function (req, res) {


  if(!req.query.token){
    res.send(JSON.stringify({status: false, err: "denied"})) 
  }

  let tk = await database.getApproveToken()
  if(req.query.token == tk.data.token){
    var result
    let current = await database.current()
    let shadow = await database.shadow()

    if(current && shadow){
      result = {
        status: true, 
        data: {
          current: current, 
          shadow: shadow
        }
      }
    } else {
      result = {
        status: false, 
        data: null, 
        err: {
          current: current, 
          shadow: shadow
        }}
    }
  } else {
    result = {status: false, err: "denied"}
  }

  res.send(JSON.stringify(result))
  return
  
})

// Schedule Tasks
var updateAll = schedule.scheduleJob('updateall', '01 * * * *', 'Europe/London', function(){
  updateData()
  setTimeout(()=>{
    database.autoApprove()
  }, 20000)
  return
})

var recordHistory = schedule.scheduleJob('history', '10 50 23 * * *', 'Europe/London', async function(){
  let save = await database.saveHistory()
  if(save){
    putHistory()
  }
  return
})


async function getLocations(){

  const mapboxAPI = conf.getMapbox().api
  const mapboxToken = conf.getMapbox().token

  let data = await database.current()
  let area = JSON.parse(data.data[0].area)

  let geo = await database.locations()

  if(geo){

    area.forEach(async el => {
      // If doesnt exist
      
      if(utils.idIdxsInArrWithId(el.location, geo.data, 'name') == -1){
        
        let loca = encodeURI(el.location)
        
        await request.genGet(mapboxAPI+ loca +".json", [{name: "access_token", val: mapboxToken}], (res)=>{
          if(res.status){
            let center = res.data.features[0].center
            
            let ready = {
              name: el.location,
              lo: center[0],
              la: center[1]
            }
  
            database.addLocation(ready)

          }
        })
      }
    })
  }
  
}



// Update data
async function updateData(){

  let update = await robot.getData()

  setTimeout(async()=>{
    if(update){
      let data = await database.current()
      if(data){
        fs.writeFile(path.join(__dirname, 'data/data.json'), JSON.stringify(data), ()=>{
          // Do nothing
        })
      }
      database.autoApprove()
      // Get newer updated location data
      getLocations()
    }
  }, 5000)
  
}


// Cache history data into history.json
async function putHistory(){
  let data = await database.history()
  if(data){
    fs.writeFile(path.join(__dirname, 'data/history.json'), JSON.stringify(data), ()=>{
      return true
    })
  }
}

// Cache location data into location.json
async function putLocation(){
  let data = await database.locations()
  if(data){
    fs.writeFile(path.join(__dirname, 'data/locations.json'), JSON.stringify(data), ()=>{
      return true
    })
  }
}


