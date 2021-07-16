const sqlQuery     = require('../../connection/sqlSENIOR')

async function motivoEntradaSaida_GET( req, res ) {
    let par_where
    let retorno = {
        success: false,
        message: '',
        data: []
    }
    let { help, Base, CdMotivo } = req.query

    if(help) {
        retorno.success = true
        retorno.message = 'Uso da endpoint (motivoEntradaSaida) - GET'
        retorno.data.push({parametro:'Base', referencias:'softran_modelo, softran_termaco, softran_transporte'})
        retorno.data.push({parametro:'CdMotivo', referencias:'codigo do motivo entrada ou saida. (OPCIONAL)'})
        res.json(retorno).status(200) 
        return 0
    }

    if(!Base) {
        Base = `softran_modelo`
    }
    
    if(CdMotivo) {
       par_where = `Where CdMotivo = ${CdMotivo}`
    }

    let wsql = `SELECT * FROM ${Base}.dbo.TRAMOTES ${par_where}`
    try {
        let data = await sqlQuery(wsql)
  
        let { Erro } = data
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} - Params = [ ${Base}, ${CdMotivo} ]`)
        }
        
        retorno.data = data
        if(!data || data.length==0){
            retorno.message = `Motivo não encontrado na Base (${Base})`
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
        retorno.rotine  = 'motivoEntradaSaida_GET.js'
        retorno.sql     =  wsql
        res.json(retorno).status(500) 
    }    
}

module.exports = motivoEntradaSaida_GET