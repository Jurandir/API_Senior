// 18-08-2021 17:38

const sqlQuery     = require('../../connection/sqlSENIOR')

async function posicaoCarga( req, res ) {
    let userId_Token = req.userId

    let { Base, valoresParametros } = req.body
    if (valoresParametros) {
        wcnpj     = userId_Token
        wdata_ini = valoresParametros[0]
        wdata_fin = valoresParametros[1]
    } else {
        res.send({ "erro" : "body sem parâmetros", "rotina" : "posicaoCarga", "sql" : "Sem Parâmetros" }).status(500) 
    }    

    if(!Base){ 
        Base = 'softran_termaco'
    }

    let raiz_user = `${wcnpj}`.substr(0,8)

    let wsql = `
        SELECT DISTINCT
                 CNH.DtEmissao                                 AS DATA
        --,        CNH.DtEntrega                                 AS DATAENTREGA
        ,(SELECT MAX(CAST(CONCAT(FORMAT(MOV.DtMovimento,'yyyy-MM-dd'),' ', FORMAT(MOV.HrMovimento,'HH:mm:ss')) as datetime))
            FROM softran_termaco.dbo.GTCMOVEN MOV
           WHERE MOV.CDOCORRENCIA IN (1,24,105)
             AND MOV.CdEmpresa = CNH.cdempresa
             AND MOV.NrSeqControle = CNH.nrseqcontrole )       AS DATAENTREGA        
        ,        CONCAT(EMP.DSAPELIDO,'-E-',CNH.NrDoctoFiscal) AS CONHECIMENTO
        ,        CNH.InTipoEmissao                             AS CTRC_TIPO
        ,        REM.DsEntidade                                AS REMETENTE
        ,        TAR.DsEntidade                                AS DESTINATARIO
        ,        NFR.NrNotaFiscal                              AS NF
        ,        CONCAT(EMP.DSAPELIDO,FIL.DSAPELIDO)           AS TRECHO
        ,        EMP.DSAPELIDO                                 AS FILIAL
        ,        CNH.NrDoctoFiscal                             AS NUMERO_CTRC
        ,        FIS.CdChaveAcesso                             AS CHAVECTE
        ,        EMP.NRCGCCPF                                  AS EMITENTE
        ,        ISNULL(dae.coddae,'S/N')                      AS DAE_CODIGO
        ,        dae.codreceita                                AS DAE_CODRECEITA
        ,        dae.cli_cgccpf_clidest                        AS DAE_CONTRIBUINTE
        ,        dae.datatu                                    AS DAE_EMISSAO
        ,        dae.vencimento                                AS DAE_VENCIMENTO
        ,        dae.databaixa                                 AS DAE_BAIXA
        ,        dae.valor                                     AS DAE_VALOR
        ,        dae.codigo                                    AS DAE_IMPRESSO
        ,        ( CASE WHEN SUBSTRING( CNH.cdremetente    ,1 ,8 ) = '11509676' THEN 'REMETENTE' 
                        WHEN SUBSTRING( CNH.cddestinatario ,1 ,8 ) = '11509676' THEN 'DESTINATÁRIO'
                        WHEN SUBSTRING( CNH.cdinscricao    ,1 ,8 ) = '11509676' THEN 'PAGADOR'
                        ELSE 'OUTROS'
                 END )                                         AS TIPO_CLIENTE
        FROM ${Base}.dbo.gtcconhe          CNH                                       -- Conhecimento
            LEFT JOIN ${Base}.dbo.sisempre EMP ON EMP.cdempresa    = CNH.cdempresa   -- Filial Origem
            LEFT JOIN ${Base}.dbo.gtcconce FIS ON FIS.cdempresa   = CNH.cdempresa	AND FIS.nrseqcontrole = CNH.nrseqcontrole -- CTe Fiscal
            LEFT JOIN ${Base}.dbo.gtcnfcon CNF ON CNF.cdempresa   = CNH.cdempresa	AND CNF.nrseqcontrole = CNH.nrseqcontrole  -- Link CTRC x NF
            LEFT JOIN ${Base}.dbo.gtcnf    NFR ON NFR.cdremetente = CNF.cdinscricao AND NFR.nrserie = CNF.nrserie AND NFR.nrnotafiscal = CNF.nrnotafiscal  -- NotaFiscal
            LEFT JOIN ${Base}.dbo.sisempre FIL ON FIL.cdempresa   = CNH.cdempresadestino  -- Filial Destino
            LEFT JOIN ${Base}.dbo.siscli   REM ON REM.cdinscricao = CNH.cdremetente       -- Clientes Remetente
            LEFT JOIN ${Base}.dbo.siscli   TAR ON TAR.cdinscricao = CNH.cddestinatario    -- Clientes Destinatários
            LEFT JOIN ${Base}.dbo.siscli   PAG ON PAG.cdinscricao = CNH.cdinscricao       -- Clientes Pagador
            LEFT JOIN ${Base}.dbo.DAE      DAE ON DAE.EMP_CODIGO_CNH = EMP.DSAPELIDO AND  
                                                  DAE.CNH_CTRC       = CNH.NrDoctoFiscal    -- DAE
        WHERE ( SUBSTRING( CNH.cddestinatario ,1 ,8 ) = '${raiz_user}'  OR 
                SUBSTRING( CNH.cdremetente    ,1 ,8 ) = '${raiz_user}'  OR 
                SUBSTRING( CNH.cdinscricao    ,1 ,8 ) = '${raiz_user}') 
            AND CNH.DtEmissao BETWEEN '${wdata_ini}' AND '${wdata_fin}'
            
            -- Ajuste 30/12/2021
            AND ( CNH.InTipoEmissao in (00,01,02,03,09,11,12,13,14) or ( CNH.InTipoEmissao = 05 and CNH.InTpCTE = 00) )
            AND FIS.insituacaosefaz = 100  

        ORDER BY
            CNH.DtEmissao, CNH.NrDoctoFiscal    
    `
    try {
        data = await sqlQuery(wsql)
  
        let { Erro } = data
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} - Params = [ ${wcnpj}, ${wdata_ini}, ${wdata_fin} ]`)
        }  
               
        res.json(data).status(200) 
  
    } catch (err) { 
        res.send({ "erro" : err.message, "rotina" : "posicaoCarga", "sql" : wsql }).status(500) 
    }    
}

module.exports = posicaoCarga