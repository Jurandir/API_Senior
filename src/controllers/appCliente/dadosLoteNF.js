// 19/08/2021 10:04
const sqlQuery     = require('../../connection/sqlSENIOR')

async function dadosLoteNF( req, res ) {
    let userId_Token = req.userId

    let { Base, cnpj, list_nfs } = req.body 
    if ( (cnpj) && (list_nfs) ) {
        cnpj     = cnpj
        list_nfs = list_nfs
    } else {
        res.send({ "erro" : "body sem parâmetros", "rotina" : "dadosLoteNF", "sql" : "Sem todos os Parâmetros" }).status(500) 
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
        AND       ( NFR.cddestinatario = '${cnpj}'
                OR NFR.cdremetente     = '${cnpj}')     
        AND     NFR.nrnotafiscal IN (${list_nfs})
        -- Ajuste 30/12/2021
        AND ( CNH.InTipoEmissao in (00,01,02,03,09,11,12,14) or ( CNH.InTipoEmissao = 05 and CNH.InTpCTE = 00) )
        AND FIS.insituacaosefaz = 100            
        `				
    try {
				
        data = await sqlQuery(wsql)
  
        let { Erro } = data
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} - Params = [ ${Base}, ${cnpj}, ${list_nfs} ]`)
        }  
               
        res.json(data).status(200) 
  
    } catch (err) { 
        res.send({ "erro" : err.message, "rotina" : "dadosLoteNF", "sql" : wsql }).status(500) 
    }    
}

module.exports = dadosLoteNF