// SIC
// 04/08/2021 17:22

const sqlQuery     = require('../../connection/sqlSENIOR')

const json2xlsx    = require('json2xls')
const crypto       = require('crypto')
const fs           = require('fs')

const URL_DOWNLOAD    = `http://201.49.34.12:5000//downloads`
const QTDE_LINHAS_XLS = 600

async function listDadosCTRC( req, res ) {
    let userId_Token = `${req.userId}`
    let wraiz = userId_Token.substr(0,8)
    let resposta = {
        success: false,
        message: 'Dados não localizados !!!',
        data: [],
        rows: 0,
        page: 0,
        length: 0,
    }
    
    let {dt_inicial,dt_final,DadosOuXlsx,ctrc,pagina_nro,pagina_tam} = req.query
    let cnpj         = userId_Token
    let s_where      = ''
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
        pagina_tam = QTDE_LINHAS_XLS
    }

	if(ctrc) {
        pagina_nro = 1
		i_ctrc       = `${ctrc}`.substr(4,10)
		s_emp        = `${ctrc}`.substr(0,3)
		s_ctrc_serie = `${ctrc}`.substr(3,1)
        s_where2     = ` AND CNH.CTRC = ${i_ctrc} AND CNH.EMP_CODIGO='${s_emp}' AND CNH.SERIE='${s_ctrc_serie}' `
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
                    CNH.EMP_CODIGO                as "Empresa",
                    ISNULL(CNH.CTRCREDESP,0)      as "CTRC Origem",
                    CNH.CTRC                      as "CTRC",
                    CNH.DATA                      as "Data Emissão",
                    CNH.DATAENTREGA               as "Data Entrega",
                    CNH.DATACOLETA                as "Data Coleta",
                    CNH.DATAEMBARQUE              as "Data Embarque",
                    CNH.DATACHEGADA               as "Data Chegada",
                    CNH.PREVENTREGA               as "Previsão de Entrega",
                    CNH.CLI_CGCCPF_REMET          as "CNPJ Remetente",
                    REM.NOME                      as "Remetente",
                    CNH.CLI_CGCCPF_DEST           as "CNPJ Destinatário",
                    DES.NOME                      as "Destinatário",
                    CNH.CLI_CGCCPF_PAG            as "CNPJ Pagador",
                    PAG.NOME                      as "Pagador",
                    CNH.PNF                       as "Peso NF",
                    CNH.PCALC                     as "Peso Calculado",
                    ISNULL(CNH.PCUBADO,0)         as "Peso Cubado",
                    CNH.PCALC                     as "Peso Cubado Cliente",
                    CNH.VOLUME                    as "Volumes",
                    CNH.VALORNF                   as "Valor NF",
                    CNH.FPESO                     as "Frete Peso",
                    CNH.FVALOR                    as "Frete Valor",
                    CNH.COLETA                    as "Valor Coleta",
                    CNH.VALORGRIS                 as "Valor GRIS",
                    CNH.ENTREGA                   as "Valor Entrega",
                    CNH.DESPACHO                  as "Valor Despacho",
                    CNH.OUTROS                    as "Valor Outros",
                    CNH.PEDAGIO                   as "Valor Pedagio",
                    CNH.ALIQIMP                   as "Alíquota ICMS",
                    CNH.ICMS                      as "ICMS",
                    CNH.BASIMPCALC                as "Base Calc ICMS",
                    CNH.VALORTRT                  as "Valor TRT",
                    CNH.TOTFRETE                  as "Total do Frete",
                    CNH.NF                        as "ListaNF",
                    CONCAT(COL.NOME,' - ',COL.UF) as "Local de Coleta",
                    CONCAT(ENT.NOME,' - ',ENT.UF) as "Local de Entrega",
                    ENT.UF                        as "Destinatário UF",
                    ENT.NOME                      as "Destinatário Cidade",
                    DES.BAIRRO                    as "Destinatário Bairro",
                    (SELECT TOP 1 OUN.OCO_CODIGO
                        FROM CARGASSQL.dbo.OUN
                        JOIN CARGASSQL.dbo.OCO ON OCO.CODIGO=OUN.OCO_CODIGO  
                        WHERE OUN.TABELA='CNH' AND OUN.CHAVE=CONCAT(CNH.EMP_CODIGO,SERIE,CNH.CTRC) AND OCO.NAOENVIAEDI=0
                        ORDER BY DATA DESC)          as "Código Ocorrência",
                        (SELECT TOP 1 OUN.DESCRICAO
                        FROM CARGASSQL.dbo.OUN
                        JOIN CARGASSQL.dbo.OCO ON OCO.CODIGO=OUN.OCO_CODIGO  
                        WHERE OUN.TABELA='CNH' AND OUN.CHAVE=CONCAT(CNH.EMP_CODIGO,SERIE,CNH.CTRC) AND OCO.NAOENVIAEDI=0
                        ORDER BY DATA DESC)          as "Descrição Ocorrência",
                    IME.RECEBEDOR                 as "Recebedor Entrega",
                    CNH.CHAVECTE                  as "Chave CT-e"
                FROM CARGASSQL.dbo.CNH
                JOIN CARGASSQL.dbo.CLI REM  ON REM.CGCCPF = CNH.CLI_CGCCPF_REMET
                JOIN CARGASSQL.dbo.CLI DES  ON DES.CGCCPF = CNH.CLI_CGCCPF_DEST
                JOIN CARGASSQL.dbo.CLI PAG  ON PAG.CGCCPF = CNH.CLI_CGCCPF_PAG
                JOIN CARGASSQL.dbo.CID COL  ON COL.CODIGO = REM.CID_CODIGO
                JOIN CARGASSQL.dbo.CID ENT  ON ENT.CODIGO = DES.CID_CODIGO
                LEFT JOIN CARGASSQL.dbo.IME ON IME.EMP_CODIGO_CNH=CNH.EMP_CODIGO AND IME.CNH_SERIE=CNH.SERIE AND IME.CNH_CTRC = CNH.CTRC
                WHERE 
                    (
                    ( SUBSTRING(cnh.cli_cgccpf_remet,1,8) = ${wraiz}) OR 
                    ( SUBSTRING(cnh.cli_cgccpf_dest,1,8)  = ${wraiz})  OR 
                    ( SUBSTRING(cnh.cli_cgccpf_pag,1,8)   = ${wraiz}) 
                    )                
                    ${s_where}
                    ${s_where2}
                ORDER BY CNH.DATA
                OFFSET (${pagina_nro} - 1) * ${pagina_tam} ROWS
                FETCH NEXT ${pagina_tam} ROWS ONLY `                

    let s_select = sql_base

	console.log('PARAMS:',dt_inicial,dt_final,DadosOuXlsx,ctrc,pagina_nro,pagina_tam)
    // console.log('(listDadosCTRC)  API => SQL:',s_select)
        
    try {  
        const result = await sqlQuery(s_select)

            if (err) {
                resposta.success = false
                resposta.message = `ERRO: ${err}`  
            } else {  
                let xlsx 
                let filename 
                let dados = []
                dados.push(...profileset.recordset)
                resposta.data     = dados
                resposta.rows     = dados.length
                resposta.success  = (resposta.rows>0)
                resposta.message  = resposta.success ? 'Sucesso. Ok.' : 'Sem dados !!!'

                if(DadosOuXlsx!=='D') {
                    let newDados = dadosXLS(dados)        
                    xlsx = json2xlsx(newDados);
                    filename = crypto.randomBytes(20).toString('hex')+'.xlsx'
                    fs.writeFileSync(`./public/downloads/${filename}`, xlsx, 'binary');
                    resposta.download = `${URL_DOWNLOAD}/${filename}`
                    resposta.message = 'Sucesso. (xlsx) Gerado.'
                    resposta.data     = []
                    resposta.dataini  = dt_inicial
                    resposta.datafim  = dt_final
                    resposta.user     = userId_Token
                    resposta.maxLines = QTDE_LINHAS_XLS   
                }

                res.json(resposta).status(200)

            }  
            
        } catch (err) {  
            resposta.success = false
            resposta.message = 'ERRO: '+err.message
            res.send(resposta).status(500)  
        }

        function dadosXLS (dados) {
            return dados.map((item)=>{
                for (var i in item) {
                    if (item.hasOwnProperty(i)) {
                        if( item[i] instanceof Date ){
                            item[i] = format_data_atc(item[i])
                        }
                    }
                }        
                return item
            })
        }

        function format_data_atc (dtParam) {
            let dt_iso =  new Date( Date.parse( dtParam ) ).toISOString() 
            let hs_str = dt_iso.substr(11,8)
            let dt_str = dt_iso.substr(8,2) +'/'+dt_iso.substr(5,2)+'/'+dt_iso.substr(0,4)+( hs_str=='00:00:00' ? '' : ' '+hs_str )
            return dt_str
        }
}

module.exports = listDadosCTRC
