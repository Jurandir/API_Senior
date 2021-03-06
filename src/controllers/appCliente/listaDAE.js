const { poolPromise } = require('../../connection/dbSENIOR')

const url_dae = 'http://www2.termaco.com.br/sicnovo/DAE/PDF/' // FOR337833.pdf'

// -- TESTE (donarosabijoux@donarosabijoux.com - 10212341000265 / 404 )

async function listaDAE( req, res ) {
    let resposta = {
        success: false,
        message: 'Dados não localizados !!!',
        data: [],
        rows: 0,
        page: 0,
        length: 0,
    }

    let {dt_inicial,dt_final,baixado,pagina_nro,pagina_tam} = req.query
    let cnpj     = req.userId

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

    resposta.page   = pagina_nro
    resposta.length = pagina_tam
 
    let sql_base = `
    SELECT 
         DAE.CODIGO ID_DAE
    ,    DAE.EMP_CODIGO FILIAL
    ,    DAE.CODDAE CODIGO_DAE
    ,    DAE.VENCIMENTO
    ,    DAE.VALOR VALOR_DAE
    ,    DAE.CODRECEITA COD_RECEITA
    ,    DAE.STATUS STATUS_DAE 
    ,    DAE.DATAEMISSAO EMISSAO_DAE
    ,    DAE.DATABAIXA BAIXA_DAE
    ,    DAE.OBS       
    ,    DAE.CLI_CGCCPF_CLIDEST CNPJ_DESTINO
    ,    CNH.CdRemetente CNPJ_REMETENTE
    ,    CLI.DsEntidade REMETENTE
    ,    DAE.DATATU DT_UPDATE
    ,    CONCAT(DAE.EMP_CODIGO_CNH,'E',DAE.CNH_CTRC) CTRC 
    ,    DAE.NF NOTAFISCAL
    ,    DAE.SERIENF SERIE_NF
    ,    DAE.BANCO     
    ,    DAE.VALORNF VALOR_NF
    ,    DAE.CHAVENFE
    ,    CONCAT('${url_dae}',DAE.EMP_CODIGO,DAE.CODIGO,'.pdf') URL_DOWNLOAD
    FROM softran_termaco.dbo.DAE
    LEFT JOIN softran_termaco.dbo.sisempre FIL ON FIL.DSAPELIDO    = DAE.EMP_CODIGO_CNH   -- Filial Origem
    LEFT JOIN softran_termaco.dbo.gtcconhe CNH ON CNH.CdEmpresa    = FIL.CdEmpresa AND CNH.NrDoctoFiscal = DAE.CNH_CTRC
    LEFT JOIN softran_termaco.dbo.siscli   CLI ON CLI.CdInscricao  = CNH.CdRemetente
    WHERE DAE.CLI_CGCCPF_CLIDEST IS NOT NULL
        AND DAE.CLI_CGCCPF_CLIDEST = '${cnpj}'
    ` 
    var s_baixado = ''
    var s_dataini = ''
    var s_datafin = ''
    var s_orderBy = ` ORDER BY DAE.DATAEMISSAO 
                      OFFSET (${pagina_nro} - 1) * ${pagina_tam} ROWS
                      FETCH NEXT ${pagina_tam} ROWS ONLY `

    if (baixado) { 
        baixado = baixado.toUpperCase() 
    } else { 
        baixado = null 
    } 
    
    if (baixado=='S') { s_baixado  = ` AND DAE.DATABAIXA IS NOT NULL`}
    if (baixado=='N') { s_baixado  = ` AND DAE.DATABAIXA IS NULL`}
    if (dt_inicial)   { s_dataini  = ` AND DAE.DATAEMISSAO >= '${dt_inicial}'`}
    if (dt_final)     { s_datafin  = ` AND DAE.DATAEMISSAO <= '${dt_final}'`}

      
    let s_select = sql_base + s_dataini + s_datafin + s_baixado  + s_orderBy
	
	// console.log("s_select",s_select)
        
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

module.exports = listaDAE

