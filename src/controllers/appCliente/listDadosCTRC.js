// SIC
// 04/08/2021 17:22

const sqlQuery     = require('../../connection/sqlSENIOR')

const json2xlsx    = require('json2xls')
const crypto       = require('crypto')
const fs           = require('fs')

const server          = process.env.IP_EXTERNO || 'localhost'
const port            = process.env.PORT   || '4999'

const URL_DOWNLOAD    = `http://${server}:${port}/downloads`
const QTDE_LINHAS_XLS = 1000

async function listDadosCTRC( req, res ) {
    let userId_Token = `${req.userId}`
    let wraiz = userId_Token.substr(0,8)
    let resposta = {
        success: false,
        message: 'Dados não localizados !!!',
        data: [],
        base64: undefined,
        rows: 0,
        page: 0,
        length: 0,
    }
    
    let {Base,dt_inicial,dt_final,DadosOuXlsx,ctrc, XLSX_base64, pagina_nro,pagina_tam} = req.query
    let cnpj         = userId_Token
    let s_where      = ''
	let	i_ctrc       = 0
	let	s_emp        = ''
	let	s_ctrc_serie = ''
    let s_where2     = ''

    if(XLSX_base64){
        XLSX_base64 = (XLSX_base64 == 'true') || (XLSX_base64 == true)
    }

    if(!cnpj || cnpj==undefined ) {
        resposta.message = 'Problemas com a autenticação !!!'
        res.json(resposta).status(200)
        return 0
    }

    if(!Base) {
        Base = 'softran_termaco'
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
        s_where2     = ` AND CNH.NrDoctoFiscal = ${i_ctrc} AND EMP.DsApelido='${s_emp}' `
    } 

    if(dt_inicial) {
            s_where = s_where + ` AND CNH.DtEmissao  >= '${dt_inicial}' `
    }

    if(dt_final) {
            s_where = s_where + ` AND CNH.DtEmissao  <= '${dt_final}' `
    }

    resposta.page   = Number.parseInt(pagina_nro)
    resposta.length = Number.parseInt(pagina_tam)

    let sql_base =`SELECT 
                      EMP.dsapelido                         as "Empresa"
                ,     ISNULL(CNH.NrConhecRedespacho,0)      as "CTRC Origem"
                ,     CNH.nrdoctofiscal                     as "CTRC"
                ,     MAN.NrManifesto                       as "Manifesto"
                ,     CNH.DtEmissao                         as "Data Emissão"
                --,     CNH.DtEntrega                         as "Data Entrega"
                ,(SELECT MAX(CAST(CONCAT(FORMAT(MOV.DtMovimento,'yyyy-MM-dd'),' ', FORMAT(MOV.HrMovimento,'HH:mm:ss')) as datetime)) 
                    FROM softran_termaco.dbo.GTCMOVEN MOV
                   WHERE MOV.CDOCORRENCIA IN (1,24,105)
                     AND MOV.CdEmpresa = CNH.cdempresa
                     AND MOV.NrSeqControle = CNH.nrseqcontrole ) as "Data Entrega"
                ,     COL.DtCadastro                        as "Data Coleta"
                ,     MAN.DtSaida                           as "Data Embarque"    -- DATAHORA EMBARQUE - SAIDA DO DEPOSITO - FILIAL ORIGEM
                ,     MAN.DtChegada                         as "Data Chegada"     -- DATAHORA CHEGADA  - CHEGADA NA FILIAL DESTINO
                ,	  ${Base}.dbo.SP_CalculaDtPrevisaoEntregaPercurso(CNH.DtEmissao, CNH.CdEmpresaDestino, CNH.CdPercurso, CNH.CdTransporte, CNH.CdRemetente, CNH.CdDestinatario, CNH.cdempresa, CNH.nrseqcontrole) 
                                                            as "Previsão de Entrega"
                ,    CNH.CdRemetente                        as "CNPJ Remetente"
                ,    REM.dsentidade                         as "Remetente"
                ,    CNH.CdDestinatario                     as "CNPJ Destinatário"
                ,    DES.dsentidade                         as "Destinatário"
                ,    CNH.CdInscricao                        as "CNPJ Pagador"
                ,    PAG.dsentidade                         as "Pagador"
                ,    CNH.QtPeso                             as "Peso NF"                -- PESO TOTAL DAS NFS NO CONHECIMENTO
                ,    CNH.QtPeso                             as "Peso Calculado"         -- PESO DO CONHECIMENTO
                ,    ISNULL(CNH.QtPesoCubado,0)             as "Peso Cubado"           
                ,    ISNULL(CNH.QtPesoCubado,0)             as "Peso Cubado Cliente"
                ,    CNH.QtVolume                           as "Volumes"
                ,    CNH.VlMercadoria                       as "Valor NF"
                ,    CNH.VlFretePeso                        as "Frete Peso"
                ,    CNH.VlFreteValor                       as "Frete Valor"
                ,    CNH.VlSECCAT                           as "Valor Coleta"
                ,    CNH.VlGris                             as "Valor GRIS" 
                ,    CNH.VlTDE                              as "Valor Entrega"
                ,    CNH.VlDespacho                         as "Valor Despacho"
                ,    CNH.VlOutros                           as "Valor Outros"
                ,    CNH.VlPedagio                          as "Valor Pedagio"
                ,    CNH.VlAliqICMS                         as "Alíquota ICMS"
                ,    CNH.VlICMS                             as "ICMS"
                ,    CNH.VlBaseCalculo                      as "Base Calc ICMS"
                ,    CNH.VlITR                              as "Valor TRT"
                ,    CNH.VlTotalPrestacao                   as "Total do Frete"
                -- ,    CNH.NrNotaFiscal                       as "ListaNF"               -- STRING COM RELAÇÃO DAS NFS
                ,   (select TRIM(STUFF((select concat(' ',b.NrNotaFiscal) 
                       from ${Base}.dbo.gtcnfcon b 
                      where b.cdempresa = CNH.cdempresa  and b.nrseqcontrole = CNH.nrseqcontrole 
                        FOR xml PATH ('')), 1, 1, '')))     as "ListaNF"
                ,    CONCAT(COL.DsLocal,' - ',COL.DsUF)     as "Local de Coleta"
                ,    CONCAT(ENT.DsLocal,' - ',ENT.DsUF)     as "Local de Entrega"
                ,    ENT.DsUF                               as "Destinatário UF"
                ,    ENT.DsLocal                            as "Destinatário Cidade"
                ,    DES.DsBairro                           as "Destinatário Bairro"
                ,    (SELECT TOP 1 OUN.CdOcorrencia FROM ${Base}.dbo.gtcmoven OUN 
                    JOIN dbo.gtchisen OCO  ON OCO.cdhistoricoentrega = OUN.cdocorrencia     
                    WHERE isnull(OCO.InExibehist, 0) = 0
                    AND OUN.cdempresa = CNH.CdEmpresa   AND OUN.nrseqcontrole = CNH.NrSeqControle
                    ORDER BY OUN.CdSequencia DESC )      as "Código Ocorrência"
                ,    (SELECT TOP 1 OCO.DsHistoricoEntrega FROM ${Base}.dbo.gtcmoven OUN 
                    JOIN dbo.gtchisen OCO  ON OCO.cdhistoricoentrega = OUN.cdocorrencia     
                    WHERE isnull(OCO.InExibehist, 0) = 0
                    AND OUN.cdempresa = CNH.CdEmpresa   AND OUN.nrseqcontrole = CNH.NrSeqControle
                    ORDER BY OUN.CdSequencia DESC )      as "Descrição Ocorrência"
                ,     (SELECT TOP 1 ENT.DsContato FROM ${Base}.dbo.GTCMOVEN ENT 
                    WHERE ENT.CdEmpresa = CNH.CdEmpresa AND ENT.NrSeqControle = CNH.NrSeqControle 
                    AND ENT.CdOcorrencia=1)           as "Recebedor Entrega"
                ,     CNF.CdChaveCTe                       as "Chave CT-e"
                ,CNH.CdEmpresa
                ,CNH.NrSeqControle
                FROM      ${Base}.dbo.gtcconhe CNH
                     JOIN ${Base}.dbo.sisempre EMP  ON EMP.CdEmpresa      = CNH.CdEmpresa
                     JOIN ${Base}.dbo.siscli   REM  ON REM.CdInscricao    = CNH.Cdremetente
                     JOIN ${Base}.dbo.siscli   DES  ON DES.CdInscricao    = CNH.CdDestinatario
                     JOIN ${Base}.dbo.siscli   PAG  ON PAG.CdInscricao    = CNH.CdInscricao
                     JOIN ${Base}.dbo.siscep   COL  ON COL.NrCep          = CNH.NrCepColeta
                     JOIN ${Base}.dbo.siscep   ENT  ON ENT.NrCep          = CNH.NrCepEntrega
                LEFT JOIN ${Base}.dbo.gtcconce CNF  ON CNF.cdempresa      = CNH.cdempresa  AND CNF.nrseqcontrole = CNH.nrseqcontrole
                LEFT JOIN ${Base}.dbo.CCEColet CLT  ON CLT.CdEmpresa      = CNH.CdEmpresa  AND CLT.NrColeta      = CNH.NrColeta
                LEFT JOIN ${Base}.dbo.GTCManCn MAC  ON MAC.CdEmpresa      = CNH.CdEmpresa  AND MAC.NrSeqControle = CNH.NrSeqControle
                LEFT JOIN ${Base}.dbo.GTCMAN   MAN  ON MAN.NrManifesto    = MAC.NrManifesto			
                WHERE         
                    (SUBSTRING(CNH.cdremetente,1,8)      = '${wraiz}' OR 
                     SUBSTRING(CNH.cddestinatario,1,8)   = '${wraiz}' OR 
                     SUBSTRING(CNH.cdinscricao,1,8)      = '${wraiz}'    )
                     
                     -- Ajuste 30/12/2021
                     AND ( CNH.InTipoEmissao in (00,01,02,03,09,11,12,13,14) or ( CNH.InTipoEmissao = 05 and CNH.InTpCTE = 00) )
                     AND CNF.insituacaosefaz = 100            
         
                     ${s_where}                     
                     ${s_where2}
                ORDER BY CNH.DtEmissao
                OFFSET (${pagina_nro} - 1) * ${pagina_tam} ROWS
                FETCH NEXT ${pagina_tam} ROWS ONLY `                

    let s_select = sql_base

	// console.log('PARAMS:',dt_inicial,dt_final,DadosOuXlsx,ctrc,pagina_nro,pagina_tam)
    // console.log('(listDadosCTRC)  API => SQL:',s_select)
        
    try {  
        
        // console.log('SQL:',s_select)

        const result = await sqlQuery(s_select)

        // console.log('result:',result)

            if (result.Erro) {
                
                resposta.success = false
                resposta.message = `ERRO: ${result.Erro}`  
                res.json(resposta).status(500)

            } else {  
                let xlsx 
                let filename 
                let dados = []
                dados.push(...result)
                resposta.data     = dados
                resposta.rows     = dados.length
                resposta.success  = (resposta.rows>0)
                resposta.message  = resposta.success ? 'Sucesso. Ok.' : 'Sem dados !!!'

                if(DadosOuXlsx!=='D' && resposta.rows > 0) {
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
                    
                    if(XLSX_base64) {
                        let buff = fs.readFileSync(`./public/downloads/${filename}`)
                        resposta.base64 = buff.toString('base64')
                     }
                    
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
