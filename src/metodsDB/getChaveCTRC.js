// 30-09-2021 - GET CHAVE CTE VIA CTRC

const fs           = require('fs')
const sqlQuery     = require('../connection/sqlSENIOR')

async function getChaveCTRC( ctrc ){
    let retorno = {
      success : false,
      message : '',
      data:[],
      rows: 0
    }

    let sql = `
    SELECT 
	       CONCAT(d.DsApelido,'E',a.NrDoctoFiscal)  AS CTRC
	  ,      a.CdEmpresa
    ,      a.NrDoctoFiscal
    ,      a.NrSeqControle
	  ,      b.CdChaveCTe
	  ,      b.CdChaveAcesso
      FROM softran_termaco.dbo.gtcconhe      a                                                                    -- Conhecimento
      LEFT JOIN softran_termaco.dbo.sisempre d ON d.cdempresa = a.cdempresa                                       -- Filial Origem
      LEFT JOIN softran_termaco.dbo.gtcconce b ON b.CdEmpresa = a.CdEmpresa AND b.NrSeqControle = a.NrSeqControle -- CTe Fiscal
      WHERE 
         CONCAT(d.DsApelido,'E',a.NrDoctoFiscal) = '${ctrc}'
     `
    try {
      let data = await sqlQuery(sql)

      retorno.rows    = data.length
      retorno.success = retorno.rows > 0  
      retorno.message = retorno.success ? 'Sucesso. Ok.' : 'Dados não localizados'
      retorno.data    = data
      
      return retorno
    
  } catch (err) {
        retorno.rows    = -1
        retorno.success = false
        retorno.message = err.message
    return retorno
  }
}



module.exports = getChaveCTRC