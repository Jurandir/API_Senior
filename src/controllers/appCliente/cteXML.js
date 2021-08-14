// 12/08/2021 09:52

const sqlQuery     = require('../../connection/sqlSENIOR')

async function cteXML( req, res ) {
    let userId_Token = req.userId
    let raiz_cnpj = `${userId_Token}`.substr(0,8)

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
        FROM ${Base}.dbo.GTCCONSF XM1
        JOIN ${Base}.dbo.gtcconhe CNH ON CNH.CdEmpresa = XM1.CdEmpresa  AND CNH.NrSeqControle = XM1.NrSeqControle
        JOIN ${Base}.dbo.sisempre EMP ON EMP.CdEmpresa = CNH.CdEmpresa
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

        let retorno = data

        if(data.length>0){
            // testar se Raiz do CNPJ compativel
            let CdRemetente    = `${data[0].CdRemetente}`.substr(0,8)
            let CdDestinatario = `${data[0].CdDestinatario}`.substr(0,8)
            let CdTomador      = `${data[0].CdTomador}`.substr(0,8)
            if( raiz_cnpj==CdRemetente || raiz_cnpj==CdDestinatario || raiz_cnpj==CdTomador ) {
                retorno = data
            } else {
                retorno = [{message:'Raiz do CNPJ, negada para pesquisa !!! '}]
            }
        } else {
            retorno = [{message:'Dados não localizados !!! '}]
        }
               
        res.json(retorno).status(200) 
  
    } catch (err) { 
        res.send({ "erro" : err.message, "rotina" : "cteXML", "sql" : wsql }).status(500) 
    }    
}

module.exports = cteXML