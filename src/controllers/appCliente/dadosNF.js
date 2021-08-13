const sqlQuery     = require('../connection/sqlQuery')

async function dadosNF( req, res ) {
    var userId_Token = req.userId

    var { cnpj, numero } = req.body // wcnpj
    if ( (cnpj) && (numero) ) {
        cnpj     = cnpj
        numero   = numero
    } else {
        res.send({ "erro" : "body sem parâmetros", "rotina" : "dadosNF", "sql" : "Sem Parâmetros" }).status(500)
		return 0
    }   
    
    let raiz_user    = userId_Token.substring(0,8)
    let raiz         = `${cnpj}`.substring(0,8)

   // if(raiz !== raiz_user ) {
   //     res.send({ "erro" : "Access ERRO - RAIZ do CNPJ pesquisado não pertence ao usuário de Login." }).status(500)
   //	return 0        
   // }

    let wsql = `SELECT 
                    CNH.DATA,
                    CONCAT(CNH.EMP_CODIGO,'-',CNH.SERIE,'-',CNH.CTRC) as CONHECIMENTO,
                    REME.NOME              as REMETENTE,
                    DEST.NOME              as DESTINATARIO,
                    CNH.NF,
                    CNH.TRE_CODIGO         as TRECHO,
                    CNH.EMP_CODIGO         as FILIAL,
                    CNH.CTRC               as NUMERO_CTRC,
                    CNH.CHAVECTE,
                    EMP.CGC                as EMITENTE,
                    DAE.CODDAE             as DAE_CODIGO,
                    DAE.CODRECEITA         as DAE_CODRECEITA,
                    DAE.CLI_CGCCPF_CLIDEST as DAE_CONTRIBUINTE,
                    DAE.DATAEMISSAO        as DAE_EMISSAO,
                    DAE.VENCIMENTO         as DAE_VENCIMENTO,
                    DAE.DATABAIXA          as DAE_BAIXA,
                    DAE.VALOR              as DAE_VALOR,
                    CONCAT(DAE.EMP_CODIGO,DAE.CODIGO) as DAE_IMPRESSO,
					( CASE 
					  WHEN SUBSTRING( CNH.CLI_CGCCPF_REMET  ,1 ,8 ) = '${raiz_user}' THEN 'REMETENTE' 
				      WHEN SUBSTRING( CNH.CLI_CGCCPF_DEST   ,1 ,8 ) = '${raiz_user}' THEN 'DESTINATÁRIO'
				      WHEN SUBSTRING( CNH.CLI_CGCCPF_PAG    ,1 ,8 ) = '${raiz_user}' THEN 'PAGADOR'
				      WHEN SUBSTRING( CNH.CLI_CGCCPF_TOMADOR,1 ,8 ) = '${raiz_user}' THEN 'TOMADOR'
				      WHEN SUBSTRING( CNH.CLI_CGCCPF_RECEB  ,1 ,8 ) = '${raiz_user}' THEN 'RECEBEDOR'
				      WHEN SUBSTRING( CNH.CLI_CGCCPF_RDS    ,1 ,8 ) = '${raiz_user}' THEN 'REDESPACHANTE'
					  ELSE 'OUTROS'
				    END) TIPO_CLIENTE
                FROM NFR 
                JOIN CNH      ON CNH.EMP_CODIGO = NFR.EMP_CODIGO AND CNH.SERIE = NFR.CNH_SERIE AND CNH.CTRC = NFR.CNH_CTRC
                LEFT JOIN CLI REME ON REME.CGCCPF    = CNH.CLI_CGCCPF_REMET
                LEFT JOIN CLI DEST ON DEST.CGCCPF    = CNH.CLI_CGCCPF_DEST
                LEFT JOIN EMP      ON EMP.CODIGO     = CNH.EMP_CODIGO
                LEFT JOIN DAE      ON EMP_CODIGO_CNH = CNH.EMP_CODIGO AND DAE.CNH_CTRC = CNH.CTRC
                WHERE NFR.NF = ${numero}
                    AND ( SUBSTRING( CNH.CLI_CGCCPF_DEST   ,1 ,8 ) = '${raiz}'
                        OR SUBSTRING( CNH.CLI_CGCCPF_REMET  ,1 ,8 ) = '${raiz}'
                        OR SUBSTRING( CNH.CLI_CGCCPF_RECEB  ,1 ,8 ) = '${raiz}'
                        OR SUBSTRING( CNH.CLI_CGCCPF_PAG    ,1 ,8 ) = '${raiz}'
                        OR SUBSTRING( CNH.CLI_CGCCPF_TOMADOR,1 ,8 ) = '${raiz}'
                        OR SUBSTRING( CNH.CLI_CGCCPF_CNS    ,1 ,8 ) = '${raiz}'
                        OR SUBSTRING( CNH.CLI_CGCCPF_EXPED  ,1 ,8 ) = '${raiz}'
                        OR SUBSTRING( CNH.CLI_CGCCPF_RDS    ,1 ,8 ) = '${raiz}') 
                    AND ( SUBSTRING( CNH.CLI_CGCCPF_DEST   ,1 ,8 ) = '${raiz_user}'
                        OR SUBSTRING( CNH.CLI_CGCCPF_REMET  ,1 ,8 ) = '${raiz_user}'
                        OR SUBSTRING( CNH.CLI_CGCCPF_RECEB  ,1 ,8 ) = '${raiz_user}'
                        OR SUBSTRING( CNH.CLI_CGCCPF_PAG    ,1 ,8 ) = '${raiz_user}'
                        OR SUBSTRING( CNH.CLI_CGCCPF_TOMADOR,1 ,8 ) = '${raiz_user}'
                        OR SUBSTRING( CNH.CLI_CGCCPF_CNS    ,1 ,8 ) = '${raiz_user}'
                        OR SUBSTRING( CNH.CLI_CGCCPF_EXPED  ,1 ,8 ) = '${raiz_user}'
                        OR SUBSTRING( CNH.CLI_CGCCPF_RDS    ,1 ,8 ) = '${raiz_user}') 
                ORDER BY ( 
                       CASE 
                           WHEN SUBSTRING( CNH.CLI_CGCCPF_REMET  ,1 ,8 ) = '${raiz_user}' THEN 0 
                           WHEN SUBSTRING( CNH.CLI_CGCCPF_DEST   ,1 ,8 ) = '${raiz_user}' THEN 1
                           WHEN SUBSTRING( CNH.CLI_CGCCPF_PAG    ,1 ,8 ) = '${raiz_user}' THEN 2
                           WHEN SUBSTRING( CNH.CLI_CGCCPF_TOMADOR,1 ,8 ) = '${raiz_user}' THEN 3
                           WHEN SUBSTRING( CNH.CLI_CGCCPF_RECEB  ,1 ,8 ) = '${raiz_user}' THEN 4
                           WHEN SUBSTRING( CNH.CLI_CGCCPF_RDS    ,1 ,8 ) = '${raiz_user}' THEN 5 
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