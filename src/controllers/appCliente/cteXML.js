// 12/08/2021 09:52

const sqlQuery     = require('../../connection/sqlQuery')

async function cteXML( req, res ) {
    let userId_Token = req.userId

    let { Base, valoresParametros } = req.body
    
    if(!Base){
        Base = 'softran_termaco'
    }

    if (valoresParametros) {
        wempresa = valoresParametros[0]
        wserie   = valoresParametros[1]
        wctrc    = valoresParametros[2]
    } else {
        res.send({ "erro" : "body sem parâmetros", "rotina" : "cteXML", "sql" : "Sem Parâmetros" }).status(500) 
    }    

    let wsql = `
        SELECT TOP 1 
            XM1.DsRecibo XMLCTE 
        ,   CNH.CdEmpresa  
        ,   CNH.NrSeqControle 
        ,   CNH.NrDoctoFiscal 
        ,   CNH.CdRemetente
        ,   CNH.CdDestinatario
        ,   CNH.CdInscricao CdTomador 
        ,   XM1.DtIntegracao DtSefaz 
        FROM dbo.GTCCONSF XM1
        JOIN dbo.gtcconhe CNH ON CNH.CdEmpresa = XM1.CdEmpresa  AND CNH.NrSeqControle = XM1.NrSeqControle
        JOIN dbo.sisempre EMP ON EMP.CdEmpresa = CNH.CdEmpresa
        WHERE 
             EMP.DsApelido = '${wempresa}'
         AND CNH.NrDoctoFiscal = ${wctrc}
         AND XM1.InRemessaRetorno = 1   -- Tipo Retorno
         AND XM1.InSituacaoSefaz  = 100 -- Autorizado o uso do CT-e
        ORDER BY XM1.CdSequencia DESC
        `
    try {
        data = await sqlQuery(wsql)
  
        let { Erro } = data
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} - Params = [ ${wempresa}, ${wserie}, ${wctrc} ]`)
        }  
               
        res.json(data).status(200) 
  
    } catch (err) { 
        res.send({ "erro" : err.message, "rotina" : "cteXML", "sql" : wsql }).status(500) 
    }    
}

module.exports = cteXML