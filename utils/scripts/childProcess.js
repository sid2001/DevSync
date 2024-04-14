const {spawn} = require('child_process');
const fs = require('fs');
require('ws');
const process = require('process');

function startChildProcess({socket,sessionData,instructions}) {

  const baseDirectory = instructions.baseDirectory;
  const command = instructions.command;
  const fullCommand = `cd ${baseDirectory} && ${command}`;
  const childProcess = spawn(fullCommand,{
    shell:true
  })

  childProcess.stdout.on('data',(data)=>{
    // console.log(sessionData.socket);
    socket.send(JSON.stringify({
      type:"stdout",
      data:data.toString('utf8')
    }))
  })
  childProcess.stderr.on('data',(data)=>{
    // console.log(sessionData.socket);
    socket.send(JSON.stringify({
      type:"stderr",
      data:data.toString('utf8')
    }))
  })
  childProcess.on('close',(code)=>{
    console.log(`child process exited with code ${code}`);
    socket.send(JSON.stringify({
      type:"close",
      data:code
    }))
  })
}

module.exports.startChildProcess = startChildProcess;