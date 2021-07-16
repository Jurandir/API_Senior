const sqlQuery     = require('../../connection/sqlSENIOR')

async function empresa_GET( req, res ) {
    let par_where
    let retorno = {
        success: false,
        message: '',
        data: []
    }
    let { help, Base, CDEMPRESA } = req.query

    if(help) {
        retorno.success = true
        retorno.message = 'Uso da endpoint (empresa) - GET'
        retorno.data.push({parametro:'Base', referencias:'softran_modelo, softran_termaco, softran_transporte'})
        retorno.data.push({parametro:'CDEMPRESA', referencias:'Numerico com o codigo da empresa. (OPCIONAL)'})
        res.json(retorno).status(200) 
        return 0
    }

    if(!Base) {
        Base = `softran_modelo`
    }
    
    if(CDEMPRESA) {
       par_where = `Where CDEMPRESA = '${CDEMPRESA}'`
    }

    let wsql = `SELECT * FROM ${Base}.dbo.SISEMPRE ${par_where}`
    try {
        let data = await sqlQuery(wsql)
  
        let { Erro } = data
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} - Params = [ ${Base}, ${CDEMPRESA} ]`)
        }
        
        retorno.data = data
        if(!data || data.length==0){
            retorno.message = `Empresa não encontrada na Base (${Base})`
            retorno.rows    = 0
        } else {
            retorno.success = true
            retorno.message = `Sucesso. Ok.`
            retorno.rows    =  data.length
        }
               
        res.json(retorno).status(200) 
  
    } catch (err) { 
        retorno.message = err.message
        retorno.rows    =  -1
        retorno.rotine  = 'empresa_GET.js'
        retorno.sql     =  wsql
        res.json(retorno).status(500) 
    }    
}

module.exports = empresa_GET