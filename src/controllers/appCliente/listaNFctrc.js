// 19/08/2021 11:19

const sqlQuery     = require('../../connection/sqlSENIOR')

async function listaNFctrc( req, res ) {
    let userId_Token = req.userId

    let { Base, cod_ctrc } = req.body 

    // XXX-X-99999999
    let empresa   = `${cod_ctrc}`.substr(0,3)
    let serie     = `${cod_ctrc}`.substr(4,1)
    let numero    = `${cod_ctrc}`.substr(6,10)    

    if ( (!empresa) || (!serie) || (!serie) ) {
        res.send({ "erro" : "body sem parâmetros", "rotina" : "listaNFctrc", "sql" : "Sem todos os Parâmetros" }).status(500) 
    }    

    if(!Base){ 
        Base = 'softran_termaco'
    }

    let raiz_user = `${userId_Token}`.substr(0,8)

    let wsql = `
                SELECT DISTINCT
                CONCAT (EMP.DsApelido,'-E-',CNH.NrDoctoFiscal) AS DOCUMENTO
            ,	NFR.DtEmissao                                 AS DATA
            ,	NFR.NrNotaFiscal                              AS NF
            ,	NFR.VlNotaFiscal                              AS VALOR
            ,	NFR.QtVolume                                  AS VOLUME
            ,	NFR.NrChaveAcessoNFe                          AS CHAVENFE
            ,	NFR.CdRemetente                               AS EMITENTE_NFE
            FROM ${Base}.dbo.gtcconhe      CNH                                      -- Conhecimento
            LEFT JOIN ${Base}.dbo.sisempre EMP ON EMP.cdempresa    = CNH.cdempresa   -- Filial Origem
            LEFT JOIN ${Base}.dbo.gtcconce FIS ON FIS.cdempresa   = CNH.cdempresa	AND FIS.nrseqcontrole = CNH.nrseqcontrole -- CTe Fiscal
            LEFT JOIN ${Base}.dbo.gtcnfcon CNF ON CNF.cdempresa   = CNH.cdempresa	AND CNF.nrseqcontrole = CNH.nrseqcontrole  -- Link CTRC x NF
            LEFT JOIN ${Base}.dbo.gtcnf    NFR ON NFR.cdremetente = CNF.cdinscricao AND NFR.nrserie = CNF.nrserie AND NFR.nrnotafiscal = CNF.nrnotafiscal  -- NotaFiscal
            WHERE     ( SUBSTRING( CNH.cddestinatario ,1 ,8 ) = '${raiz_user}'
                    OR SUBSTRING( CNH.cdremetente    ,1 ,8 )  = '${raiz_user}'
                    OR SUBSTRING( CNH.cdinscricao    ,1 ,8 )  = '${raiz_user}')     
            AND     CNH.NrDoctoFiscal =  ${numero}
            AND     EMP.DsApelido     = '${empresa}'
            `	                
    try {
				
        data = await sqlQuery(wsql)
  
        let { Erro } = data
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} - Params = [ ${cnpj}, ${list_nfs} ]`)
        }  
               
        res.json(data).status(200) 
  
    } catch (err) { 
        res.send({ "erro" : err.message, "rotina" : "dadosLoteNF", "sql" : wsql }).status(500) 
    }    
}

module.exports = listaNFctrc