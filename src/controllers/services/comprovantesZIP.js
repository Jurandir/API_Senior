const fs                   = require('fs')
const crypto               = require('crypto')
const zip                  = require('express-zip')
const getImagemSenior      = require('../../metodsDB/getImagemSenior')

const server          = process.env.IP_EXTERNO || 'localhost'
const port            = process.env.PORT   || '4999'

const URL_DOWNLOAD    = `http://${server}:${port}/downloads`

const comprovantesZIP = async (req, res) => {
    let params                  = req.method == 'GET' ? req.query : req.body
    let { ctrc, DownloadLink }  = params
    let retTipo                 = 1 // (1) = downloadSeniorIMG(element), (2) = base64SeniorIMG(element)
    let zipList                 = []
    let nodezip                 = new require('node-zip')()
    let resposta                =  { success: false, message: '', ctrc: ctrc, rows: 0 }

    function delFiles() {
      zipList.map(itn=>{
        fs.unlink(itn.path,function(err){
          if(err) return console.log(err)
          console.log(`file "${itn.path}" deleted successfully`)
        })
      })
    }

    try {
      let ret = await getImagemSenior( { ctrc, retTipo } )
      if(ret.success) {
          for await (let itn of ret.data) {
            let url = itn.url
            zipList.push({ path: itn.fullName, name: itn.fileName })        
          }
      }

      let zipFile = 'Comprovantes.zip'
      
      if(DownloadLink=='D') {
         res.zip(zipList,zipFile, delFiles )
      } else {
        resposta.rows    = zipList.length
        if(resposta.rows>0) {
          for await (let itn of zipList ) {
            nodezip.file(itn.name, fs.readFileSync(itn.path))
          }
          let data    = nodezip.generate({ base64:false, compression: 'DEFLATE' })
          zipFile     = crypto.randomBytes(20).toString('hex')+'.zip'
          fs.writeFileSync(`./public/downloads/${zipFile}`, data, 'binary')
          delFiles()
          resposta.success =  true
        }
        
        resposta.message =  resposta.success ? 'Arquivo Gerado.' : 'Dados não localizados.'
        resposta.url     = resposta.success  ? `${URL_DOWNLOAD}/${zipFile}` : ''
        let code         = resposta.success ? 200 : 400
        res.json(resposta).status(code) 
      }
      return 0

    } catch (err) {
      resposta.message = err.message
      resposta.rows = -1
      res.json(resposta).status(500) 
      return 0
    }
}

module.exports = comprovantesZIP