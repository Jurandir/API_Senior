// 02-08-2021 11:30
const sqlQuery     = require('../../connection/sqlSENIOR')

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
    let Base         = 'softran_termaco'

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
        s_where    = ` AND b.nrnotafiscal = ${i_numero} `
    } 
	
	if(ctrc) {
        pagina_nro = 1
		i_ctrc       = `${ctrc}`.substr(4,10)
		s_emp        = `${ctrc}`.substr(0,3)
		s_ctrc_serie = `${ctrc}`.substr(3,1)
        s_where2     = ` AND a.nrdoctofiscal = ${i_ctrc} AND aa.dsapelido ='${s_emp}' `
    } 


    if(dt_inicial) {
            s_where = s_where + ` AND  a.dtemissao  >= '${dt_inicial}' `
    }

    if(dt_final) {
            s_where = s_where + ` AND  a.dtemissao  <= '${dt_final}' `
    }

    resposta.page   = Number.parseInt(pagina_nro)
    resposta.length = Number.parseInt(pagina_tam)

    let s_select =`
    SELECT 
	    a.dtemissao                              AS DATA                -- DATA DE EMISSÃO DO CTRC
	,   a.InTipoEmissao                          AS CTRC_TIPO           -- TIPO DE EMISSÃO/CTRC
	,   g.NrCGCCPF                               AS CNPJ_REMETENTE      -- CNPJ DO REMETENTE
	,   h.NrCGCCPF                               AS CNPJ_DESTINATARIO   -- CNPJ DO DESTINATARIO
	,   g.dsentidade                             AS REMETENTE           -- NOME DO REMETENTE
	,   h.dsentidade                             AS DESTINATARIO        -- NOME DO DESTINATARIO 
	,   b.nrnotafiscal                           AS NOTAFISCAL          -- NUMERO DA NOTA FISCAL
	,   b.nrserie                                AS SERIE_NF            -- SERIE DA NOTA FISCAL
	,   CONCAT(aa.dsapelido,m.dsApelido)         AS TRECHO              -- SIGLAS ( ORIGEM/DESTINO )
	,   CONCAT(aa.dsapelido,'E',a.nrdoctofiscal) AS CTRC                -- CTRC ( FILIAL/E/CONHECIMENTO )
	,   'CARGA'                                  AS NATUREZA            -- CARGA EXPRESSA
	,   c.QtVolume                               AS VOLUME              -- VOLUME NA NOTAFISCAL
    ,   CASE WHEN (h.NrCGCCPF = '${cnpj}') THEN 1 ELSE 0 END FLAG_DESTINATARIO
    ,   CASE WHEN (g.NrCGCCPF = '${cnpj}') THEN 1 ELSE 0 END FLAG_REMETENTE
    ,   CASE WHEN (h.NrCGCCPF = '${cnpj}') THEN 1 ELSE 0 END FLAG_RECEBEDOR
    ,   CASE WHEN (i.NrCGCCPF = '${cnpj}') THEN 1 ELSE 0 END FLAG_TOMADOR
    ,   CASE WHEN (i.NrCGCCPF = '${cnpj}') THEN 1 ELSE 0 END FLAG_PAGADOR
	,   ${Base}.dbo.SP_CalculaDtPrevisaoEntregaPercurso(a.DtEmissao, a.CdEmpresaDestino, a.CdPercurso, a.CdTransporte, a.CdRemetente, a.CdDestinatario, a.cdempresa, a.nrseqcontrole) 
	                            AS PREVENTREGA            -- PREVISÃO DE ENTREGA
    --,   a.dtentrega             AS DATAENTREGA            -- DATA DE ENTREGA
    ,(SELECT MAX(CAST(CONCAT(FORMAT(MOV.DtMovimento,'yyyy-MM-dd'),' ', FORMAT(MOV.HrMovimento,'HH:mm:ss')) as datetime)) 
        FROM softran_termaco.dbo.GTCMOVEN MOV
       WHERE MOV.CDOCORRENCIA IN (1,24,105)
         AND MOV.CdEmpresa = a.cdempresa
         AND MOV.NrSeqControle = a.nrseqcontrole )       AS DATAENTREGA        

    FROM ${Base}.dbo.gtcconhe      a                                          -- Conhecimento
    LEFT JOIN ${Base}.dbo.sisempre aa ON aa.cdempresa         = a.cdempresa   -- Filial Origem
    LEFT JOIN ${Base}.dbo.gtcconce bb ON bb.cdempresa         = a.cdempresa	  AND bb.nrseqcontrole = a.nrseqcontrole -- CTe Fiscal
    LEFT JOIN ${Base}.dbo.gtcnfcon b  ON b.cdempresa          = a.cdempresa	  AND b.nrseqcontrole = a.nrseqcontrole  -- Link CTRC x NF
    LEFT JOIN ${Base}.dbo.gtcnf    c  ON c.cdremetente        = b.cdinscricao AND c.nrserie = b.nrserie AND c.nrnotafiscal = b.nrnotafiscal  -- NotaFiscal
    LEFT JOIN ${Base}.dbo.sistdf   f  ON f.cdtpdoctofiscal    = a.cdtpdoctofiscal  -- Tipo Fiscal
    LEFT JOIN ${Base}.dbo.siscli   g  ON g.cdinscricao        = a.cdremetente      -- Clientes Remetente
    LEFT JOIN ${Base}.dbo.siscli   h  ON h.cdinscricao        = a.cddestinatario   -- Clientes Destinatários
    LEFT JOIN ${Base}.dbo.siscli   i  ON i.cdinscricao        = a.cdinscricao      -- Clientes Pagador
    LEFT JOIN ${Base}.dbo.siscep   j  ON j.nrcep              = a.nrcepcoleta      -- CEP Filial Origem
    LEFT JOIN ${Base}.dbo.siscep   k  ON k.nrcep              = a.nrcepentrega     -- CEP Local Entrega
    LEFT JOIN ${Base}.dbo.sisempre l  ON l.cdempresa          = a.cdempresa        -- Filial Origem
    LEFT JOIN ${Base}.dbo.sisempre m  ON m.cdempresa          = a.cdempresadestino -- Filial Destino
    LEFT JOIN ${Base}.dbo.siscep   n  ON n.nrcep              = m.nrcep            -- CEP Filial Destino
    WHERE 1=1
        ${s_where} ${s_where2}
     AND (h.NrCGCCPF = '${cnpj}' OR g.NrCGCCPF   = '${cnpj}' OR i.NrCGCCPF = '${cnpj}' )
     
     -- Ajuste 30/12/2021
     AND ( a.InTipoEmissao in (00,01,02,03,09,11,12,14) or ( a.InTipoEmissao = 05 and a.InTpCTE = 00) )
     AND bb.insituacaosefaz = 100       

    ORDER BY a.dtemissao
    OFFSET (${pagina_nro} - 1) * ${pagina_tam} ROWS
    FETCH NEXT ${pagina_tam} ROWS ONLY `                

    // console.log('(posicaoCargaAPP) SQL:',s_select)

    try {
        let data = await sqlQuery(s_select)

        console.log('DADOS:',data)
  
        let { Erro } = data
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} - Params = [ ${Base}, ${cnpj} ]`)
        }
        
        resposta.data = data
        if(!data || data.length==0){
            resposta.message = `Dados não encontrados na Base (${Base})`
            resposta.rows    = 0
        } else {
            resposta.success = true
            resposta.message = `Sucesso. Ok.`
            resposta.rows    =  data.length
        }
               
        res.json(resposta).status(200) 
  
    } catch (err) { 
        resposta.message = err.message
        resposta.rows    =  -1
        resposta.rotine  = 'posicaoCargaAPP.js'
        resposta.sql     =  s_select
        res.json(resposta).status(500) 
    }

        
}

module.exports = posicaoCargaAPP