const sqlQuery     = require('../connection/sqlSENIOR')

async function veiculo_Base( NrPlaca ) {
    let retorno = {success: false, message:'', NrPlaca: NrPlaca, Base: 'softran_modelo' }
    let wsql = `
    SELECT TOP 1 Y.NrPlaca,Y.Base 
    FROM (
        SELECT NrPlaca,'softran_transporte' Base 
        FROM softran_transporte.dbo.GTCVEIDP A 
        UNION ALL
        SELECT NrPlaca,'softran_termaco' Base
        FROM softran_termaco.dbo.GTCVEIDP A 
    ) y
    WHERE Y.NrPlaca = '${NrPlaca}'
    ORDER BY Y.Base
    `
    try {
        let data = await sqlQuery(wsql)
  
        let { Erro } = data
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} - Params = [ ${Base}, ${NrPlaca} ]`)
        }
 
        retorno.success = (data.length > 0)
        retorno.Base    = retorno.success ? data[0].Base : retorno.Base
        retorno.message = retorno.success ? 'Sucesso. OK.' : 'Placa não localizada !!!'

        return retorno

    } catch (err) { 
        retorno.message = err.message
        retorno.rows    =  -1
        return retorno
    }    
}

module.exports = veiculo_Base