const fs    = require('fs')
const http  = require('http')


function urlDownload(url, dest){
    let file = fs.createWriteStream(dest)
    return new Promise((resolve, reject) => {
      let responseSent = false // flag to make sure that response is sent only once.
      http.get(url, response => {
        response.pipe(file)
        file.on('finish', () =>{
          file.close(() => {
            if(responseSent)  return
            responseSent = true
            resolve()
          })
        })
      }).on('error', err => {
          if(responseSent)  return
          responseSent = true
          reject(err)
      })
    })
}

module.exports = urlDownload

// https://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js-without-using-third-party-libraries
