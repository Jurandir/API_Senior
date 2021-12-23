const sqlQuery     = require('../connection/sqlSENIOR')

async function getMapaEntrega( params ) {
    let par_where = `WHERE C.InColetaEntrega = 2 ` // (ENTREGA = 2)
    let retorno = {
        success: false,
        message: '',
        data: []
    }
    let { Base, NrDoctoFiscal, CdEmpresa } = params


    if(!Base) {
        Base = `softran_termaco`
    }
    
    if(CdEmpresa) {
       par_where = `${par_where} AND A.CdEmpresa  = ${CdEmpresa } `
    }

    if(NrDoctoFiscal) {
        par_where = `${par_where} AND A.NrDoctoFiscal = '${NrDoctoFiscal}' `
     }
 
    let wsql = `
        SELECT TOP 1
             CONCAT(A.CdEmpresa,'-',B.CdRota,'-',B.CdRomaneio)                             AS codigo
        ,    CAST(CONCAT(FORMAT(C.DtRomaneio,'yyyy-MM-dd'),' ',FORMAT(C.DtRomaneio,'HH:mm:ss')) AS DATETIME) AS data
        ,    (CASE WHEN B.CdRedespacho IS NULL THEN 'N' ELSE 'R' END)                      AS tipo
        ,    C.NrPlaca                                                                     AS veiculo
        ,    C.NrCPFMotorista                                                              AS motorista
        --,    A.DtEntrega                                                                   AS entrega
        ,(SELECT MAX(CAST(CONCAT(FORMAT(MOV.DtMovimento,'yyyy-MM-dd'),' ', FORMAT(MOV.HrMovimento,'HH:mm:ss')) as datetime)) 
            FROM softran_termaco.dbo.GTCMOVEN MOV
           WHERE MOV.CDOCORRENCIA IN (1,24,105)
             AND MOV.CdEmpresa = A.cdempresa
             AND MOV.NrSeqControle = A.nrseqcontrole )       AS entrega

             FROM ${Base}.dbo.GTCCONHE A  -- CONHECIMENTO
        LEFT JOIN ${Base}.dbo.CCEROMIT B ON B.CdEmpresaColetaEntrega = A.CdEmpresa AND B.NrSeqControle = A.NrSeqControle	 -- ITENS DO ROMANEIO COLETA/ENTREGA
        LEFT JOIN ${Base}.dbo.CCEROMAN C ON C.CdEmpresa = B.CdEmpresa AND C.CdRota        = B.CdRota    AND C.CdRomaneio = B.CdRomaneio -- ROMANEIO COLETA/ENTREGA
        ${par_where}
        ORDER BY B.CdRomaneio DESC 
        `
    try {
        let data = await sqlQuery(wsql)
  
        let { Erro } = data
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} - Params = [ ${Base}, ${par_where} ]`)
        }
        
        retorno.data = data
        if(!data || data.length==0){
            retorno.message = `Mapa de entrega não localizado na Base (${Base})`
            retorno.rows    = 0
        } else {
            retorno.success = true
            retorno.message = `Sucesso. Ok.`
            retorno.rows    =  data.length
        }
               
        return retorno 
  
    } catch (err) { 
        retorno.message = err.message
        retorno.rows    =  -1
        retorno.rotine  = 'getMapaEntrega.js'
        retorno.sql     =  wsql
        return retorno
    }    
}

module.exports = getMapaEntrega