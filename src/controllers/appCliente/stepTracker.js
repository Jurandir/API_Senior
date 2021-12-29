// 23/12/2021 - Ajustado (DT_ENTREGA & DT_COLETA)

const sqlQuery     = require('../../connection/sqlSENIOR')

async function stepTracker( req, res ) {
    let retorno = {
        success: false,
        message: 'Dados não localizados !!!',
        data: [],
        rows: 0
    }
    let {Base, tipo, cnpj, documento } = req.query
    let s_where,s_emp,s_ctrc,s_serie,s_documento,s_data,s_tipo
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
                ? `(A.CDREMETENTE='${cnpj}' OR A.CDDESTINATARIO='${cnpj}' OR A.CDINSCRICAO='${cnpj}') AND B.NRNOTAFISCAL=${i_numero}` 
                : `AA.DSAPELIDO='${s_emp}' AND A.NRDOCTOFISCAL ='${s_ctrc}'`

    s_documento = (s_tipo=='NF') 
                ? `CONCAT(C.CDREMETENTE,'/',B.NRNOTAFISCAL,'-',B.NRSERIE)`
                : `CONCAT(AA.DSAPELIDO,'E',A.NRDOCTOFISCAL)`  

    s_data      = (s_tipo=='NF') 
                ? `C.DTEMISSAO`
                : `A.DTEMISSAO`
        
    let s_select = `
                SELECT
                    '${s_tipo}'                                                            AS TIPO
                    ,${s_documento}                                                        AS DOCUMENTO
                    ,MAX(${s_data})                                                        AS DATA
                    ,0                                                                     AS CTRC_TIPO
                    ,MAX(A.DTEMISSAO)                                                      AS CTRC_EMISSAO
                    ,MAX(O.DTBAIXA)                                                        AS COLETA
                    ,MAX(CASE WHEN D.CDOCORRENCIA = 101 THEN D.DTMOVIMENTO ELSE NULL END)  AS EMBARQUE
                    ,MAX(CASE WHEN D.CDOCORRENCIA = 98  THEN D.DTMOVIMENTO ELSE NULL END)  AS CHEGADA
                    ,MAX(CASE WHEN D.CDOCORRENCIA = 100 THEN D.DTMOVIMENTO ELSE NULL END)  AS SAIDA
                    ,MAX(DAE.DATAEMISSAO)                                                  AS DAE_EMISSAO
                    ,MAX(DAE.DATABAIXA)                                                    AS DAE_BAIXA
                    ,MAX(CASE WHEN D.CDOCORRENCIA IN (1,24,105) THEN D.DTMOVIMENTO ELSE NULL END)  AS ENTREGA
                    ,MAX(${Base}.dbo.SP_CalculaDtPrevisaoEntregaPercurso(A.DTEMISSAO, A.CDEMPRESADESTINO, A.CDPERCURSO, A.CDTRANSPORTE, A.CDREMETENTE, A.CDDESTINATARIO, A.CDEMPRESA, A.NRSEQCONTROLE))
                                                                                           AS PREVISAO
                    ,NULL                                                                  AS PREVISAO_ORIGINAL
                    ,MAX(CASE WHEN D.CDOCORRENCIA = 91 THEN D.DtAgendamento ELSE NULL END) AS AGENDAMENTO
                FROM ${Base}.dbo.GTCCONHE      A
                LEFT JOIN ${Base}.dbo.SISEMPRE AA ON AA.CDEMPRESA       = A.CDEMPRESA 
                LEFT JOIN ${Base}.dbo.DAE     DAE ON DAE.EMP_CODIGO_CNH = AA.DsApelido  AND DAE.CNH_CTRC = A.NrDoctoFiscal  
                LEFT JOIN ${Base}.dbo.GTCCONCE BB ON BB.CDEMPRESA       = A.CDEMPRESA   AND BB.NRSEQCONTROLE = A.NRSEQCONTROLE
                LEFT JOIN ${Base}.dbo.GTCNFCON B  ON B.CDEMPRESA        = A.CDEMPRESA   AND B.NRSEQCONTROLE = A.NRSEQCONTROLE
                LEFT JOIN ${Base}.dbo.GTCNF    C  ON C.CDREMETENTE      = B.CDINSCRICAO AND C.NRSERIE = B.NRSERIE AND C.NRNOTAFISCAL = B.NRNOTAFISCAL
                LEFT JOIN ${Base}.dbo.GTCMOVEN D  ON D.CDEMPRESA        = A.CDEMPRESA   AND D.NRSEQCONTROLE = A.NRSEQCONTROLE
                LEFT JOIN ${Base}.dbo.CCECOLET O  ON O.CDEMPRESA        = A.CDEMPRESA   AND O.NRCOLETA = A.NRCOLETA
                WHERE BB.insituacaosefaz = 100
                  AND ( A.InTipoEmissao in (00,01,02,03,09,11,12,14) or ( A.InTipoEmissao = 05 and A.InTpCTE = 00) )
                  AND
                    ${s_where}
                GROUP BY 
                    ${s_documento}`
        
        // console.log('stepTracker: s_select',s_select)

        try {
            let data = await sqlQuery(s_select)
      
            let { Erro } = data
            if (Erro) { 
              throw new Error(`DB ERRO - ${Erro} - Params = [ ${Base}, ${s_where} ]`)
            }
            
            retorno.data = data
            if(!data || data.length==0){
                retorno.message = `Dados não encontrado na Base TERMACO ()`
                retorno.rows    = 0
            } else {
                retorno.success = true
                retorno.message = `Sucesso. Ok.`
                retorno.rows    =  data.length
                data.forEach( (element,idx) => {
                    retorno.data[idx].PREVISAO_ORIGINAL = element.PREVISAO_ORIGINAL ? element.PREVISAO_ORIGINAL : element.PREVISAO
                    retorno.data[idx].FLAG_COLETA       = element.COLETA ? 1 : 0
                    retorno.data[idx].FLAG_COLETADO     = 'S'
                    retorno.data[idx].FLAG_ENTREGA      = element.ENTREGA ?   1 : 0
                    retorno.data[idx].FLAG_ENTREGADO    = element.ENTREGA ? 'S' : 'N'
                    retorno.data[idx].FLAG_BAIXADO      = element.ENTREGA ?   1 : 0
                })
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
