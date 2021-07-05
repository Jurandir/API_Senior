const sqlQuery     = require('../connection/sqlSENIOR')

async function veiculo_GET( req, res ) {
    let par_where = `WHERE 1=1 `
    let retorno = {
        success: false,
        message: '',
        data: []
    }
    let { help, Base, NrPlaca, CdVeiculo } = req.query

    if(help) {
        retorno.success = true
        retorno.message = 'Uso da endpoint (veiculo) - GET'
        retorno.data.push({parametro:'Base', referencias:'softran_modelo, softran_termaco, softran_transporte'})
        retorno.data.push({parametro:'CdVeiculo', referencias:'Codigo do veiculo. (OPCIONAL)'})
        retorno.data.push({parametro:'NrPlaca'  , referencias:'Placa do veiculo. (OPCIONAL)'})
        res.json(retorno).status(200) 
        return 0
    }

    if(!Base) {
        Base = `softran_modelo`
    }
    
    if(NrPlaca) {
       par_where = `${par_where} AND NrPlaca = '${NrPlaca}'`
    }

    if(CdVeiculo) {
        par_where = `${par_where} AND CdVeiculo = '${CdVeiculo}'`
     }
 
    let wsql = `SELECT * FROM ${Base}.dbo.SISVeicu ${par_where}`
    try {
        let data = await sqlQuery(wsql)
  
        let { Erro } = data
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} - Params = [ ${Base}, ${NrPlaca} ]`)
        }
        
        retorno.data = data
        if(!data || data.length==0){
            retorno.message = `Veículo não localizado na Base (${Base})`
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
        retorno.rotine  = 'veiculo_GET.js'
        retorno.sql     =  wsql
        res.json(retorno).status(500) 
    }    
}

module.exports = veiculo_GET