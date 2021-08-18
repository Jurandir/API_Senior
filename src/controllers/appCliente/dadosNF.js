const sqlQuery     = require('../../connection/sqlSENIOR')

async function dadosNF( req, res ) {
    let userId_Token = req.userId

    let { Base, cnpj, numero } = req.body // wcnpj
    if ( (cnpj) && (numero) ) {
        cnpj     = cnpj
        numero   = numero
    } else {
        res.send({ "erro" : "body sem parâmetros", "rotina" : "dadosNF", "sql" : "Sem Parâmetros" }).status(500)
		return 0
    }   

    if(!Base){ 
        Base = 'softran_termaco'
    }
    
    let raiz_user    = userId_Token.substring(0,8) // CNPJ USER LOGADO
    let raiz         = `${cnpj}`.substring(0,8)    // CNPJ DO CLIENTE DO USER

    let wsql = `SELECT 
                CNH.DtEmissao                                 AS DATA,
                CONCAT(EMP.DSAPELIDO,'-E-',CNH.NrDoctoFiscal) AS CONHECIMENTO,
                REM.DsEntidade                                AS REMETENTE,
                TAR.DsEntidade                                AS DESTINATARIO,
                NFR.NrNotaFiscal                              AS NF,
                CONCAT(EMP.DSAPELIDO,FIL.DSAPELIDO)           AS TRECHO,
                EMP.DSAPELIDO                                 AS FILIAL,
                CNH.NrDoctoFiscal                             AS NUMERO_CTRC,
                FIS.CdChaveAcesso                             AS CHAVECTE,
                EMP.NRCGCCPF                                  AS EMITENTE,
                'S/N'                                         AS DAE_CODIGO,
                NULL                                          AS DAE_CODRECEITA,
                NULL                                          AS DAE_CONTRIBUINTE,
                NULL                                          AS DAE_EMISSAO,
                NULL                                          AS DAE_VENCIMENTO,
                NULL                                          AS DAE_BAIXA,
                NULL                                          AS DAE_VALOR,
                NULL                                          AS DAE_IMPRESSO,
                ( CASE 
                    WHEN SUBSTRING( CNH.cdremetente    ,1 ,8 ) = '11509676' THEN 'REMETENTE' 
                    WHEN SUBSTRING( CNH.cddestinatario ,1 ,8 ) = '11509676' THEN 'DESTINATÁRIO'
                    WHEN SUBSTRING( CNH.cdinscricao    ,1 ,8 ) = '11509676' THEN 'PAGADOR'
                    ELSE 'OUTROS'
                END)                                         AS TIPO_CLIENTE

                FROM ${Base}.dbo.gtcconhe      CNH                                      -- Conhecimento
                LEFT JOIN ${Base}.dbo.sisempre EMP ON EMP.cdempresa    = CNH.cdempresa   -- Filial Origem
                LEFT JOIN ${Base}.dbo.gtcconce FIS ON FIS.cdempresa   = CNH.cdempresa	AND FIS.nrseqcontrole = CNH.nrseqcontrole -- CTe Fiscal
                LEFT JOIN ${Base}.dbo.gtcnfcon CNF ON CNF.cdempresa   = CNH.cdempresa	AND CNF.nrseqcontrole = CNH.nrseqcontrole  -- Link CTRC x NF
                LEFT JOIN ${Base}.dbo.gtcnf    NFR ON NFR.cdremetente = CNF.cdinscricao AND NFR.nrserie = CNF.nrserie AND NFR.nrnotafiscal = CNF.nrnotafiscal  -- NotaFiscal
                LEFT JOIN ${Base}.dbo.sisempre FIL ON FIL.cdempresa   = CNH.cdempresadestino  -- Filial Destino
                LEFT JOIN ${Base}.dbo.siscli   REM ON REM.cdinscricao = CNH.cdremetente       -- Clientes Remetente
                LEFT JOIN ${Base}.dbo.siscli   TAR ON TAR.cdinscricao = CNH.cddestinatario    -- Clientes Destinatários
                LEFT JOIN ${Base}.dbo.siscli   PAG ON PAG.cdinscricao = CNH.cdinscricao       -- Clientes Pagador

                WHERE NFR.NrNotaFiscal = ${numero}
                            AND ( SUBSTRING( CNH.cddestinatario ,1 ,8 ) = '${raiz}'
                                OR SUBSTRING( CNH.cdremetente   ,1 ,8 ) = '${raiz}'
                                OR SUBSTRING( CNH.cdinscricao   ,1 ,8 ) = '${raiz}') -- 
                            AND ( SUBSTRING( CNH.cddestinatario ,1 ,8 ) = '${raiz_user}'
                                OR SUBSTRING( CNH.cdremetente   ,1 ,8 ) = '${raiz_user}'
                                OR SUBSTRING( CNH.cdinscricao   ,1 ,8 ) = '${raiz_user}') -- 
                    ORDER BY ( 
                            CASE 
                                WHEN SUBSTRING( CNH.cdremetente    ,1 ,8 ) = '${raiz_user}' THEN 0 -- ${raiz_user}
                                WHEN SUBSTRING( CNH.cddestinatario ,1 ,8 ) = '${raiz_user}' THEN 1
                                WHEN SUBSTRING( CNH.cdinscricao    ,1 ,8 ) = '${raiz_user}' THEN 2
                                ELSE 99 
                            END)                       
                       `
				
    // console.log('sql:',wsql)
    try {
        data = await sqlQuery(wsql)
  
        let { Erro } = data
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} - Params = [ ${cnpj}, ${numero} ]`)
        }  
               
        res.json(data).status(200) 
  
    } catch (err) { 
        res.send({ "erro" : err.message, "rotina" : "dadosNF", "sql" : wsql }).status(500) 
    }    
}

module.exports = dadosNF