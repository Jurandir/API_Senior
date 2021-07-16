const apiDados = require('./apiDados')

async function apiDados_GET( req, res ) {
    let retorno = {
        success: false,
        message: '',
        data: []
    }
    let params   = req.method = 'GET' ? req.query : req.body
    let { Base } = params

    if(!Base) {
        params.Base = `softran_termaco`
    }
    
    try {
        let code = 200
        let data = await apiDados(params)
         
        retorno.data = data
        if(!data || data.length==0){
            retorno.message = `Dados não localizados na Base (${Base})`
            retorno.rows    = 0
        } else {
            retorno.success = data.success
            retorno.message = data.message
            retorno.data    = data.data
            retorno.rows    = data.data.length
            code            = retorno.success ? 200 : 500
        }
               
        res.json(retorno).status(code) 
  
    } catch (err) { 
        retorno.message = err.message
        retorno.rows    =  -1
        retorno.rotine  = 'apiCliente_GET.js'
        retorno.params  =  params
        res.json(retorno).status(500) 
    }    
}

module.exports = apiDados_GET