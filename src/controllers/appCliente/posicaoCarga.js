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

    var wsql = `SELECT 
                    CNH.DATA,
					CNH.DATAENTREGA,
                    CONCAT(CNH.EMP_CODIGO,'-',CNH.SERIE,'-',CNH.CTRC) as CONHECIMENTO,
					CNH.TIPOCTRC           as CTRC_TIPO,
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
                    CONCAT(DAE.EMP_CODIGO,DAE.CODIGO) as DAE_IMPRESSO
                    FROM CNH
                    LEFT JOIN CLI REME ON REME.CGCCPF    = CNH.CLI_CGCCPF_REMET
                    LEFT JOIN CLI DEST ON DEST.CGCCPF    = CNH.CLI_CGCCPF_DEST
                    LEFT JOIN EMP      ON EMP.CODIGO     = CNH.EMP_CODIGO
                    LEFT JOIN DAE      ON EMP_CODIGO_CNH = CNH.EMP_CODIGO AND CNH_CTRC = CNH.CTRC
                WHERE  
                    ( CNH.CLI_CGCCPF_REMET     = '${wcnpj}'
                    OR  CNH.CLI_CGCCPF_DEST    = '${wcnpj}'
                    OR  CNH.CLI_CGCCPF_PAG     = '${wcnpj}' ) 
                    AND CNH.DATA BETWEEN '${wdata_ini}' AND '${wdata_fin}'
                ORDER BY 
                    CNH.DATA, CNH.CTRC
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