const { parentPort } = require('worker_threads');

parentPort.on('message', msg=>{
    const robot = require('./robot')
    robot.getData()
})


