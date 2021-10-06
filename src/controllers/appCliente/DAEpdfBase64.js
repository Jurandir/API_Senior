const fs           = require('fs')
const localdir     = process.env.NETWORK_DAE || ''

async function DAEpdfBase64( req, res ) {
    let params = req.method == 'GET' ? req.query : req.body 
    let  { dae } = params
    let resposta = {
        success: false,
        message: 'DAE não localizado !!!',
        base64: undefined
    }

    try {  

        let filename  = `${localdir}/${dae}.pdf`
        let existFile = fs.existsSync(filename) 

        console.log('filename',filename)
        console.log('existFile',existFile)

        if(existFile) {
            let buff = fs.readFileSync(filename)
            resposta.base64  = buff.toString('base64')
            resposta.success = true
            resposta.message = `Sucesso - ${dae}`
            res.json(resposta).status(200)
         } else {
            res.json(resposta).status(400)
         }
        
    } catch (err) {  
        resposta.message = err.message
        res.send(resposta).status(500)  
    } 
}

module.exports = DAEpdfBase64