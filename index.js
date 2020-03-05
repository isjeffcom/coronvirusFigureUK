const robot = require('./robot.js')

const express = require('express')
const app = express()


let server = app.listen(8003, function () {
  let host = server.address().address;
  let port = server.address().port;
  console.log('Your App is running at http://%s:%s', host, port);
})

app.get('/', function (req, res) {
    //res.send('Hello World!');
    res.send(JSON.stringify(robot.getFigure()))
    //console.log(JSON.parse(robot.getFigure()))
})


robot.getData()

setInterval(()=>{
    robot.getData()
}, 1800000)
