const { poolPromise } = require('../connection/dbTMS')

async function stepTracker( req, res ) {
    let resposta = {
        success: false,
        message: 'Dados não localizados !!!',
        data: [],
        rows: 0
    }
    let {tipo,cnpj,documento} = req.query
    let s_where,s_emp,s_ctrc,s_serie,s_documento,s_data
    let i_numero = 0

    if(!documento || documento==undefined ) {
        resposta.message = 'Documento invalido na pesquisa !!!'
        res.json(resposta).status(200)
        return 0
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
        resposta.message = 'Documento invalido !!!'
        res.json(resposta).status(200)
        return 0
    }

    if(s_tipo == 'NF' && (!cnpj || cnpj==undefined)) {
        resposta.message = 'CNPJ do emitente da NF, obrigatório na pesquisa !!!'
        res.json(resposta).status(200)
        return 0
    }

    s_where = (s_tipo=='NF') 
                ? `(CNH.CLI_CGCCPF_REMET='${cnpj}' OR CNH.CLI_CGCCPF_DEST='${cnpj}' OR CNH.CLI_CGCCPF_PAG='${cnpj}') AND NFR.NF=${i_numero}` 
                : `CNH.EMP_CODIGO='${s_emp}' AND CNH.SERIE = '${s_serie}' AND CNH.CTRC = '${s_ctrc}'`

    s_documento = (s_tipo=='NF') 
                ? `CONCAT(NFR.CLI_CGCCPF_REMET,'/',NFR.NF,'-',NFR.SERIE)`
                : `CONCAT(CNH.EMP_CODIGO,CNH.SERIE,CNH.CTRC)`  

    s_data      = (s_tipo=='NF') 
                ? `NFR.DATA`
                : `CNH.DATA`
        
    let s_select = `SELECT DISTINCT 
                   '${s_tipo}' TIPO,
                    ${s_documento} DOCUMENTO,
                    ${s_data}, 
                    CNH.TIPOCTRC             CTRC_TIPO,
                    CNH.DATAHORAEMISSAO      CTRC_EMISSAO,
                    CNH.DATACOLETA           COLETA,
                    CNH.DATAEMBARQUE         EMBARQUE,
                    CNH.DATACHEGADA          CHEGADA,
                    MEG.DATATU               SAIDA,
					DAE.DATAEMISSAO          DAE_EMISSAO,
					DAE.DATABAIXA            DAE_BAIXA,
                    CNH.DATAENTREGA          ENTREGA,
                    CNH.PREVENTREGA          PREVISAO,
                    CNH.PREVENTREGA_ORIGINAL PREVISAO_ORIGINAL,
                    CNH.COLETA               FLAG_COLETA,
                    CNH.COLETADO             FLAG_COLETADO,
                    CNH.ENTREGA              FLAG_ENTREGA,
                    CNH.ENTREGADO            FLAG_ENTREGADO,
                    MEG.BAIXADO              FLAG_BAIXADO
                FROM CARGASSQL.dbo.CNH
                LEFT JOIN CARGASSQL.dbo.DAE  ON DAE.EMP_CODIGO_CNH = CNH.EMP_CODIGO AND DAE.CNH_SERIE = CNH.SERIE AND  DAE.CNH_CTRC = CNH.CTRC
                LEFT JOIN CARGASSQL.dbo.IME  ON IME.EMP_CODIGO_CNH = CNH.EMP_CODIGO AND IME.CNH_SERIE = CNH.SERIE AND  IME.CNH_CTRC = CNH.CTRC
                LEFT JOIN CARGASSQL.dbo.MEG  ON MEG.EMP_CODIGO     = IME.EMP_CODIGO AND MEG.CODIGO    = IME.MEG_CODIGO
                JOIN CARGASSQL.dbo.NFR       ON NFR.EMP_CODIGO     = CNH.EMP_CODIGO AND NFR.CNH_SERIE = CNH.SERIE AND  NFR.CNH_CTRC = CNH.CTRC
                WHERE 
                    ${s_where} `
        
    try {  
        const pool   = await poolPromise  
        const result = await pool.request()  
        .query( s_select ,function(err, profileset){  
            if (err) {
                
                resposta.success = false
                resposta.message = `ERRO: ${err}`
                throw new Error(`DB ERRO - ${err}`)

            } else {  
                let dados = []
                dados.push(...profileset.recordset)
                resposta.rows    = dados.length
                resposta.success = (resposta.rows>0) ? true : false
                resposta.message = resposta.success ? 'Sucesso. OK.' : resposta.message
                resposta.data    = dados
                res.json(resposta).status(200)
                pool.close  
            }  
        })  
        } catch (err) {  
            resposta.success = false
            resposta.message = 'ERRO: '+err.message
            res.send(resposta).status(500)  
        } 
}

module.exports = stepTracker
