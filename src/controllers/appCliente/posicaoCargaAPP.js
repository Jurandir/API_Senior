const { poolPromise } = require('../connection/dbTMS')

async function posicaoCargaAPP( req, res ) {
    let resposta = {
        success: false,
        message: 'Dados não localizados !!!',
        data: [],
        rows: 0,
        page: 0,
        length: 0,
    }
    
    let {dt_inicial,dt_final,notafiscal,ctrc,pagina_nro,pagina_tam} = req.query
    let cnpj         = req.userId
    let s_where      = ''
    let i_numero     = 0
	let	i_ctrc       = 0
	let	s_emp        = ''
	let	s_ctrc_serie = ''
    let s_where2     = ''

    if(!cnpj || cnpj==undefined ) {
        resposta.message = 'Problemas com a autenticação !!!'
        res.json(resposta).status(200)
        return 0
    }

    if(!pagina_nro || pagina_nro==undefined ) {
        pagina_nro = 1
    }

    if(!pagina_tam || pagina_tam==undefined ) {
        pagina_tam = 50
    }

    if(notafiscal) {
        pagina_nro = 1
        i_numero   = Number.parseInt(notafiscal)
        s_where    = ` AND NFR.NF = ${i_numero} `
    } 
	
	if(ctrc) {
        pagina_nro = 1
		i_ctrc       = `${ctrc}`.substr(4,10)
		s_emp        = `${ctrc}`.substr(0,3)
		s_ctrc_serie = `${ctrc}`.substr(3,1)
        s_where2     = ` AND NFR.CNH_CTRC = ${i_ctrc} AND NFR.EMP_CODIGO='${s_emp}' AND NFR.CNH_SERIE='${s_ctrc_serie}' `
    } 


    if(dt_inicial) {
            s_where = s_where + ` AND CNH.DATA  >= '${dt_inicial}' `
    }

    if(dt_final) {
            s_where = s_where + ` AND CNH.DATA  <= '${dt_final}' `
    }

    resposta.page   = Number.parseInt(pagina_nro)
    resposta.length = Number.parseInt(pagina_tam)

    let sql_base =`SELECT 
                        CNH.DATA,
						CNH.TIPOCTRC as CTRC_TIPO,
                        CNH.CLI_CGCCPF_REMET CNPJ_REMETENTE,
                        CNH.CLI_CGCCPF_DEST CNPJ_DESTINATARIO,
                        REME.NOME REMETENTE,
                        DEST.NOME DESTINATARIO,
                        NFR.NF NOTAFISCAL,
                        NFR.SERIE SERIE_NF,
                        CNH.TRE_CODIGO TRECHO,
                        CONCAT(NFR.EMP_CODIGO,NFR.CNH_SERIE,NFR.CNH_CTRC) CTRC,
                        CNH.NATUREZA,
                        NFR.VOLUME,
                    CASE WHEN (CNH.CLI_CGCCPF_DEST   ='${cnpj}') THEN 1 ELSE 0 END FLAG_DESTINATARIO,
                    CASE WHEN (CNH.CLI_CGCCPF_REMET  ='${cnpj}') THEN 1 ELSE 0 END FLAG_REMETENTE,
                    CASE WHEN (CNH.CLI_CGCCPF_RECEB  ='${cnpj}') THEN 1 ELSE 0 END FLAG_RECEBEDOR,
                    CASE WHEN (CNH.CLI_CGCCPF_TOMADOR='${cnpj}') THEN 1 ELSE 0 END FLAG_TOMADOR,
                    CASE WHEN (CNH.CLI_CGCCPF_PAG    ='${cnpj}') THEN 1 ELSE 0 END FLAG_PAGADOR,
                    CNH.ENTREGADO FLAG_ENTREGUE,
                    CNH.PREVENTREGA,
                    CNH.DATAENTREGA 
                    FROM CNH
                    JOIN NFR ON NFR.EMP_CODIGO = CNH.EMP_CODIGO AND NFR.CNH_CTRC = CNH.CTRC AND NFR.CNH_SERIE = CNH.SERIE
                    JOIN CLI REME ON REME.CGCCPF = CNH.CLI_CGCCPF_REMET
                    JOIN CLI DEST ON DEST.CGCCPF = CNH.CLI_CGCCPF_DEST
                    WHERE 1=1
                        ${s_where} ${s_where2}
                        AND (CNH.CLI_CGCCPF_DEST      = '${cnpj}'
                        OR CNH.CLI_CGCCPF_REMET   = '${cnpj}'
                        OR CNH.CLI_CGCCPF_TOMADOR = '${cnpj}'
                        OR CNH.CLI_CGCCPF_PAG     = '${cnpj}'
                        OR CNH.CLI_CGCCPF_RECEB   = '${cnpj}')
                    ORDER BY CNH.DATA
                    OFFSET (${pagina_nro} - 1) * ${pagina_tam} ROWS
                    FETCH NEXT ${pagina_tam} ROWS ONLY `                

    let s_select = sql_base

    // console.log('SQL:',s_select)
        
    try {  
        const pool   = await poolPromise  
        const result = await pool.request()  
        .query( s_select ,function(err, profileset){  
            if (err) {
                resposta.success = false
                resposta.message = `ERRO: ${err}`  
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

module.exports = posicaoCargaAPP
