const fs           = require('fs')
const axios        = require('axios')
const loadAPI      = require('../../helpers/loadAPI')
const localDAE     = process.env.DAE_LOCAL
const localdir     = localDAE=='DIRETORIO' ?  process.env.DIRETORIO_DAE : 
                     localDAE=='NETWORK'   ?  process.env.NETWORK_DAE   : 
                     localDAE=='API'       ?  process.env.API_DAE       : 'ERRO'

async function DAEpdfBase64( req, res ) {
    let params = req.method == 'GET' ? req.query : req.body 
    let  { dae } = params
    let token    = req.token
    let resposta = {
        success: false,
        message: 'DAE não localizado !!!',
        base64: undefined
    }
    
    if(localDAE=='API') {
        try {

            let config = {
                headers: { "Content-Type": 'application/json',"authorization" : `Bearer ${token}` },
            }
            let api = await axios.get( `${localdir}?dae=${dae}`, config )
            
            resposta.success = api.data.success
            resposta.message = api.data.message
            resposta.base64  = api.data.base64
            
            let code = api.data.success ? '200' : '400'

            res.json(resposta).status(code)
            return 0

        } catch(err) {
            resposta.message = `API Interna = ${err.message}`
            res.json(resposta).status(400)
        } 
        return 0 
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