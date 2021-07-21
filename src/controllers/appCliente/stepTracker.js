// 21-07-2021

const sqlQuery     = require('../../connection/sqlSENIOR')

async function stepTracker( req, res ) {
    let retorno = {
        success: false,
        message: 'Dados não localizados !!!',
        data: [],
        rows: 0
    }
    let {Base, tipo, cnpj, documento } = req.query
    let s_where,s_emp,s_ctrc,s_serie,s_documento,s_data
    let i_numero = 0

    if(!documento || documento==undefined ) {
        retorno.message = 'Documento invalido na pesquisa !!!'
        res.json(retorno).status(200)
        return 0
    }

    if (!Base) {
        Base = 'softran_termaco'
    }

    if(tipo=='CTRC') {
        s_tipo   = `CTRC`
        s_emp    = `${documento}`.substr(0,3).toUpperCase()
        s_serie  = `${documento}`.substr(3,1).toUpperCase()
        s_ctrc   = `${documento}`.substr(4,10)
        i_numero = Number.parseInt(s_ctrc)
    } else {
        s_tipo = `NF`
        i_numero = Number.parseInt(documento)
    }

    if(!i_numero) {
        retorno.message = 'Documento invalido !!!'
        res.json(retorno).status(200)
        return 0
    }

    if(s_tipo == 'NF' && (!cnpj || cnpj==undefined)) {
        retorno.message = 'CNPJ do emitente da NF, obrigatório na pesquisa !!!'
        res.json(retorno).status(200)
        return 0
    }

    s_where = (s_tipo=='NF') 
                ? `(CNH.CLI_CGCCPF_REMET='${cnpj}' OR CNH.CLI_CGCCPF_DEST='${cnpj}' OR CNH.CLI_CGCCPF_PAG='${cnpj}') AND NFR.NF=${i_numero}` 
                : `AA.DSAPELIDO='${s_emp}' AND A.NRDOCTOFISCAL ='${s_ctrc}'`

    s_documento = (s_tipo=='NF') 
                ? `CONCAT(NFR.CLI_CGCCPF_REMET,'/',NFR.NF,'-',NFR.SERIE)`
                : `CONCAT(AA.DSAPELIDO,'E',A.NRDOCTOFISCAL)`  

    s_data      = (s_tipo=='NF') 
                ? `NFR.DATA`
                : `A.DTEMISSAO`
        
    let s_select = `
                SELECT
                    '${s_tipo}'                                                           AS TIPO
                    ,${s_documento}                                                       AS DOCUMENTO
                    ,MAX(${s_data})                                                       AS DATA
                    ,0                                                                    AS CTRC_TIPO
                    ,MAX(A.DTEMISSAO)                                                     AS CTRC_EMISSAO
                    ,MAX(O.DTCADASTRO)                                                    AS COLETA
                    ,MAX(CASE WHEN D.CDOCORRENCIA = 101 THEN D.DTMOVIMENTO ELSE NULL END) AS EMBARQUE
                    ,MAX(CASE WHEN D.CDOCORRENCIA = 98  THEN D.DTMOVIMENTO ELSE NULL END) AS CHEGADA
                    ,MAX(CASE WHEN D.CDOCORRENCIA = 100 THEN D.DTMOVIMENTO ELSE NULL END) AS SAIDA
                    ,NULL                                                                 AS DAE_EMISSAO
                    ,NULL                                                                 AS DAE_BAIXA
                    ,MAX(A.DTENTREGA)                                                     AS ENTREGA
                    ,MAX(${Base}.dbo.SP_CalculaDtPrevisaoEntregaPercurso(A.DTEMISSAO, A.CDEMPRESADESTINO, A.CDPERCURSO, A.CDTRANSPORTE, A.CDREMETENTE, A.CDDESTINATARIO, A.CDEMPRESA, A.NRSEQCONTROLE))
                                                                                          AS PREVISAO
                    ,NULL                                                                 AS PREVISAO_ORIGINAL
                FROM ${Base}.dbo.GTCCONHE      A
                LEFT JOIN ${Base}.dbo.SISEMPRE AA ON AA.CDEMPRESA  = A.CDEMPRESA 
                LEFT JOIN ${Base}.dbo.GTCCONCE BB ON BB.CDEMPRESA  = A.CDEMPRESA   AND BB.NRSEQCONTROLE = A.NRSEQCONTROLE
                LEFT JOIN ${Base}.dbo.GTCNFCON B  ON B.CDEMPRESA   = A.CDEMPRESA   AND B.NRSEQCONTROLE = A.NRSEQCONTROLE
                LEFT JOIN ${Base}.dbo.GTCNF    C  ON C.CDREMETENTE = B.CDINSCRICAO AND C.NRSERIE = B.NRSERIE AND C.NRNOTAFISCAL = B.NRNOTAFISCAL
                LEFT JOIN ${Base}.dbo.GTCMOVEN D  ON D.CDEMPRESA   = A.CDEMPRESA   AND D.NRSEQCONTROLE = A.NRSEQCONTROLE
                LEFT JOIN ${Base}.dbo.CCECOLET O  ON O.CDEMPRESA   = A.CDEMPRESA   AND O.NRCOLETA = A.NRCOLETA
                WHERE
                    ${s_where}
                GROUP BY 
                    ${s_documento}`
        
        console.log('stepTracker: s_select',s_select)

        try {
            let data = await sqlQuery(s_select)
      
            let { Erro } = data
            if (Erro) { 
              throw new Error(`DB ERRO - ${Erro} - Params = [ ${Base}, ${s_where} ]`)
            }
            
            retorno.data = data
            if(!data || data.length==0){
                retorno.message = `Dados não encontrada na Base (${Base})`
                retorno.rows    = 0
            } else {
                retorno.success = true
                retorno.message = `Sucesso. Ok.`
                retorno.rows    =  data.length
            }
                   
            res.json(retorno).status(200) 
      
        } catch (err) { 
            retorno.message = err.message
            retorno.rows    =  -1
            retorno.rotine  = 'stepTracker.js'
            retorno.sql     =  s_select
            res.json(retorno).status(500) 
        }
    
}

module.exports = stepTracker
