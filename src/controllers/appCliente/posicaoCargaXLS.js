const sqlQuery     = require('../../connection/sqlSENIOR')
const json2xlsx    = require('json2xls')
const crypto       = require('crypto')
const fs           = require('fs')

const server          = process.env.IP_EXTERNO || 'localhost'
const port            = process.env.PORT   || '4999'

const URL_DOWNLOAD    = `http://${server}:${port}/downloads`
const QTDE_LINHAS_XLS = 800

async function posicaoCargaXLS( req, res ) {
    let userId_Token = `${req.userId}`
    let wraiz = userId_Token.substr(0,8)
    let { Base, DadosOuXlsx, dataini, datafim , XLSX_base64 } = req.body

    if(!Base){ 
        Base = 'softran_termaco'
    }
    
    let dados = await dadosPesquisa(wraiz,dataini,datafim)
    let idx   = -1
    
    if(!dados || dados.length==0){
        
        res.send({ "erro" : "Problemas com a solicitação !!!", "rotina" : "posicaoCargaXLS" }).status(500)
        return 0 
    }

    for await (let item of dados){
        let emp  = item.EMPCODIGO
        let ser  = item.SERIECTRC
        let ctrc = item.CTRC 
        idx++

        if(item.DATAEMBARQUE){
            let mnf = await dadosMNF(emp, ser, ctrc)
            dados[idx].MNFCODIGO      = mnf[0].MNFCODIGO
            dados[idx].DATAMNF        = mnf[0].DATAMNF
            dados[idx].CHEGADAMNF     = mnf[0].CHEGADAMNF
            dados[idx].INICIODESCARGA = mnf[0].INICIODESCARGA
            dados[idx].FINALDESCARGA  = mnf[0].FINALDESCARGA           
        }

        dados[idx].RECEBEDOR    = item.RECEBEDOR

        if(item.CGCCPFREMET==userId_Token){
            dados[idx].TIPO="ENTREGA"
        } else if(item.CGCCPFDEST==userId_Token) {
            dados[idx].TIPO="REVERSA"
        } else {
            dados[idx].TIPO=""
        } 

        let megCod = dados[idx].CODIGOMEG 
        let megEmp = dados[idx].EMPCODIGOMEG

        dados[idx].DATAMEG     = item.DATAMEG     
        dados[idx].TIPOENTREGA = item.TIPOENTREGA 
        
        dados[idx].STATUS =  status(dados[idx])

        let ocorr = await dadosOCORRENCIA(emp, ser, ctrc)
        dados[idx].OCORRENCIAS = ocorr

    }

    let xlsx 
    let filename
    let base64
    
    if(DadosOuXlsx!=='D') {
        let newDados = dadosXLS(dados)        
        xlsx = json2xlsx(newDados)

        filename = crypto.randomBytes(20).toString('hex')+'.xlsx'
        fs.writeFileSync(`./public/downloads/${filename}`, xlsx, 'binary');
        
        if(XLSX_base64) {
           let buff = fs.readFileSync(`./public/downloads/${filename}`)
           base64 = buff.toString('base64')
        }

    }
 

    try {

        //let url = req.protocol + '://(' + req.get('host') + `)/downloads/${filename}`
        //let url = `http://siconline.termaco.com.br:5000/downloads/${filename}`
        let url = `${URL_DOWNLOAD}/${filename}`
   
        res.json({
            success: true,
            message: DadosOuXlsx=='D' ? 'Dados' : 'Xlsx',
            dataini, datafim,
            user: userId_Token,
            download: DadosOuXlsx=='D' ? undefined : url,
            data: DadosOuXlsx=='D' ? dados : undefined,
            base64: base64,
            maxLines : QTDE_LINHAS_XLS
        }).status(200) 
  
    } catch (err) { 
        res.send({ "erro" : err.message, "rotina" : "posicaoCargaXLS" }).status(500) 
    }    

    return 0

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

    async function dadosPesquisa(wraiz,dataini,datafim) {
        let wsql = `
                SELECT TOP ${QTDE_LINHAS_XLS} 
                CNH.NrSeqControle     AS PEDIDO
              , NFR.NrNotaFiscal      AS NF
              , NFR.NrSerie           AS SERIENF
              , NFR.QtPeso            AS PESONF
              , EMP.DSAPELIDO         AS EMPCODIGO
              , 'E'                   AS SERIECTRC
              , CNH.NrDoctoFiscal     AS CTRC
              , CNH.DtEmissao         AS DATACTRC
              , (SELECT TOP 1 CAST( CONCAT( FORMAT(d.DtMovimento,'yyyy-MM-dd'), ' ', + FORMAT(d.HrMovimento,'HH:mm:ss')) as datetime ) DT
                 FROM dbo.GTCMovEn d  WHERE  d.CdEmpresa  = CNH.CdEmpresa   AND d.NrSeqControle = CNH.NrSeqControle  AND d.CdOcorrencia = 101 )
                                      AS DATAEMBARQUE
              , CNH.VlLiquido         AS TOTFRETE
              
              , REMET.DsEntidade      AS NOMEREMET
              , REMET.CdInscricao     AS CGCCPFREMET
              , ORI.DsLocal           AS CIDADEREMET
              , ORI.DsUF              AS UFREMETENTE              
              , DESTI.DsEntidade      AS NOMEDEST
              , DESTI.CdInscricao     AS CGCCPFDEST
              , TAR.DsLocal           AS CIDADEDEST
              , TAR.DsUF              AS UFDESTINATARIO 
              , COLETA.DtCadastro     AS DATACOLETA
              , ${Base}.dbo.SP_CalculaDtPrevisaoEntregaPercurso(CNH.DtEmissao, CNH.CdEmpresaDestino, CNH.CdPercurso, CNH.CdTransporte, CNH.CdRemetente, CNH.CdDestinatario, CNH.CdEmpresa, CNH.NrSeqControle)  
                                      AS PREVENTREGA
              , CNH.DtEntrega         AS DATAENTREGA
              , (SELECT TOP 1 TIT.CdTitulo FROM ${Base}.dbo.GTCFATIT VIN LEFT JOIN ${Base}.dbo.GFATITU  TIT 
                 ON TIT.CdFilial  = VIN.CdEmpresa AND TIT.NrFatura = VIN.CdFatura AND TIT.CdParcela = VIN.CdParcela
                 WHERE TIT.InPagarReceber = 1 AND VIN.CdEmpresa = CNH.CdEmpresa AND VIN.NrSeqControle = CNH.NrSeqControle)
                                     AS FATURA
              , CNH.VlLiquido        AS FATVALOR
              , (SELECT TOP 1 TIT.DtVencimento FROM ${Base}.dbo.GTCFATIT VIN LEFT JOIN ${Base}.dbo.GFATITU  TIT 
                 ON TIT.CdFilial  = VIN.CdEmpresa AND TIT.NrFatura = VIN.CdFatura AND TIT.CdParcela = VIN.CdParcela
                 WHERE TIT.InPagarReceber = 1 AND VIN.CdEmpresa = CNH.CdEmpresa AND VIN.NrSeqControle = CNH.NrSeqControle)
                                     AS FATVENC
              , (SELECT TOP 1 CAST( CONCAT( FORMAT(d.DtMovimento,'yyyy-MM-dd'), ' ', + FORMAT(d.HrMovimento,'HH:mm:ss')) as datetime ) DT
                 FROM ${Base}.dbo.GTCMovEn d  WHERE  d.CdEmpresa  = CNH.CdEmpresa   AND d.NrSeqControle = CNH.NrSeqControle  AND d.CdOcorrencia = 98 )
                                     AS DATACHEGADA
              , NFR.VlNotaFiscal     AS VALORNF
              ,'N'                   AS TIPOENTREGA
              , (SELECT TOP 1 OUN.DsContato FROM ${Base}.dbo.GTCMovEn OUN WHERE OUN.CdOcorrencia = 1 AND  OUN.CdEmpresa = CNH.CdEmpresa AND  OUN.NrSeqControle = CNH.NrSeqControle) 
                                     AS RECEBEDOR
              , (SELECT TOP 1 OUN.DtMovimento FROM ${Base}.dbo.GTCMovEn OUN WHERE OUN.CdOcorrencia = 100 AND  OUN.CdEmpresa = CNH.CdEmpresa AND  OUN.NrSeqControle = CNH.NrSeqControle) 
                                     AS DATAMEG
              , CNH.CdEmpresa
              , CNH.NrSeqControle
              
               FROM ${Base}.dbo.GTCConhe CNH
               LEFT JOIN ${Base}.dbo.sisempre    EMP ON EMP.CdEmpresa     = CNH.CdEmpresa        -- Filial Origem
               LEFT JOIN ${Base}.dbo.sisempre    FIL ON FIL.CdEmpresa     = CNH.CdEmpresaDestino -- Filial Destino
               LEFT JOIN ${Base}.dbo.gtcconce    FIS ON FIS.CdEmpresa     = CNH.CdEmpresa   AND FIS.NrSeqControle = CNH.NrSeqControle  -- CTRC FISCAL
               LEFT JOIN ${Base}.dbo.gtcnfcon    LNF ON LNF.CdEmpresa     = CNH.CdEmpresa   AND LNF.NrSeqControle = CNH.NrSeqControle  -- LINK CTRC X NF
               LEFT JOIN ${Base}.dbo.gtcnf       NFR ON NFR.CdRemetente   = LNF.CdInscricao AND NFR.NrSerie       = LNF.NrSerie        AND NFR.NrNotaFiscal = LNF.NrNotaFiscal -- NF
               LEFT JOIN ${Base}.dbo.siscli    REMET ON REMET.CdInscricao = CNH.CdRemetente      -- CLIENTE REMETENTE
               LEFT JOIN ${Base}.dbo.siscli    DESTI ON DESTI.CdInscricao = CNH.CdDestinatario   -- CLIENTE DESTINATARIO
               LEFT JOIN ${Base}.dbo.siscli    PAGAD ON PAGAD.CdInscricao = CNH.CdInscricao      -- CLIENTE PAGADOR
               LEFT JOIN ${Base}.dbo.siscep      ORI ON ORI.CdCep         = REMET.NRCEP          -- LOCAL DE ORIGEM
               LEFT JOIN ${Base}.dbo.siscep      TAR ON TAR.CdCep         = DESTI.NRCEP          -- LOCAL DESTINO
               LEFT JOIN ${Base}.dbo.CCEColet COLETA ON COLETA.CdEmpresa  = CNH.CdEmpresa  AND COLETA.NrColeta = CNH.NrColeta  -- Dados da Coleta
              
               WHERE CNH.InTipoEmissao = 0 -- NORMAL
                 AND CNH.DtEmissao >= Convert(DATETIME, '${dataini}', 120)  -- 
                 AND CNH.DtEmissao <= Convert(DATETIME, '${datafim}', 120)  -- 
                 AND (
                     ( SUBSTRING(CNH.CdRemetente,1,8)    = '${wraiz}' ) OR -- 
                     ( SUBSTRING(CNH.CdDestinatario,1,8) = '${wraiz}' ) OR 
                     ( SUBSTRING(CNH.CdInscricao,1,8)    = '${wraiz}' ) )
              ORDER BY CNH.DtEmissao
                     , CNH.NrDoctoFiscal
              ` 

        data = await sqlQuery(wsql)
        return data
    }

    async function dadosMNF(emp, ser, ctrc) {
        let ret = [{ EMPRESA: null, MNFCODIGO: null, DATAMNF: null, CHEGADAMNF: null, INICIODESCARGA: null, FINALDESCARGA: null }]
        let wsql = `
            SELECT TOP 1
                    EMP.DsApelido AS EMPRESA
                , MAN.NrManifesto AS MNFCODIGO
                , (CASE WHEN MAN.DtEmissao     IS NOT NULL THEN CAST( CONCAT( FORMAT(MAN.DtEmissao    ,'yyyy-MM-dd'), ' ', + FORMAT(MAN.HrEmissao,'HH:mm:ss'))     as datetime ) ELSE NULL END ) AS DATAMNF
                , (CASE WHEN MAN.DtChegada     IS NOT NULL THEN CAST( CONCAT( FORMAT(MAN.DtChegada    ,'yyyy-MM-dd'), ' ', + FORMAT(MAN.HrChegada,'HH:mm:ss'))     as datetime ) ELSE NULL END ) AS CHEGADAMNF
                , (CASE WHEN MAN.DtDescargaIni IS NOT NULL THEN CAST( CONCAT( FORMAT(MAN.DtDescargaIni,'yyyy-MM-dd'), ' ', + FORMAT(MAN.HrDescargaIni,'HH:mm:ss')) as datetime ) ELSE NULL END ) AS INICIODESCARGA
                , (CASE WHEN MAN.DtDescargaFim IS NOT NULL THEN CAST( CONCAT( FORMAT(MAN.DtDescargaFim,'yyyy-MM-dd'), ' ', + FORMAT(MAN.HrDescargaFim,'HH:mm:ss')) as datetime ) ELSE NULL END ) AS FINALDESCARGA
            FROM ${Base}.dbo.GTCManCn MCO
            JOIN ${Base}.dbo.GTCConhe CNH ON CNH.CdEmpresa = MCO.CdEmpresa AND CNH.NrSeqControle = MCO.NrSeqControle
            JOIN ${Base}.dbo.SISEMPRE EMP ON EMP.CdEmpresa = CNH.CdEmpresa
            JOIN ${Base}.dbo.GTCMan   MAN ON MAN.NrManifesto = MCO.NrManifesto
            WHERE EMP.DsApelido = '${emp}' 
            AND CNH.NrDoctoFiscal = ${ctrc}
            ORDER BY 
            MAN.DtEmissao DESC `

        data = await sqlQuery(wsql)
        if(data.length>0){
            ret = data
        }
        return ret  
    }

    async function dadosOCORRENCIA(emp, ser, ctrc) {
        let wsql = `
                SELECT 
                    CONCAT('[ ',convert(varchar, OUN.DtMovimento ,105),' ',convert(varchar, OUN.HrMovimento ,108),' - ',OCO.DsHistoricoEntrega,' ]') OCORRENCIA
                FROM ${Base}.dbo.gtcmoven OUN
                JOIN ${Base}.dbo.gtcconhe CNH     ON CNH.CdEmpresa = OUN.cdempresa AND CNH.NrSeqControle = OUN.NrSeqControle
                JOIN ${Base}.dbo.sisempre EMP     ON EMP.cdempresa          = OUN.CdEmpresa   
                JOIN ${Base}.dbo.gtchisen OCO     ON OCO.CdHistoricoEntrega = OUN.CdOcorrencia
                WHERE 
                    isnull(OCO.InExibeHist, 0) = 0
                AND EMP.DsApelido = '${emp}'
                AND CNH.NrDoctoFiscal = ${ctrc}
                ORDER BY
                    OUN.DtMovimento
                ,OUN.HrMovimento `
        let data = await sqlQuery(wsql)

        let ocorr = data.map((i)=>{
            return i.OCORRENCIA
        }) 

        let ocorrencias = ocorr.join(',')

        return ocorrencias  
    }

    function status (dados) {
        let STATUS = ''


        if(dados.DATACTRC && !dados.DATAMNF &&  !dados.CHEGADAMNF  && !dados.CODIGOMEG && !dados.DATAMEG){
            STATUS = `Mercadoria aguardando Embarque na Origem desde ${ format_data_atc( dados.DATACTRC ) }`
        
        }else if(dados.DATACTRC && dados.DATAMNF &&  !dados.CHEGADAMNF  && !dados.CODIGOMEG && !dados.DATAMEG){
            STATUS = `Mercadoria em Transito desde ${ format_data_atc( dados.DATAEMBARQUE ) }`
        
        }else if(dados.DATACTRC && dados.DATAMNF &&  dados.CHEGADAMNF  && !dados.INICIODESCARGA && !dados.FINALDESCARGA && !dados.CODIGOMEG && !dados.DATAMEG){
            STATUS = `Veiculo no Patio desde ${ format_data_atc(dados.CHEGADAMNF) } (Mercadoria Aguardando Descarga)`;
        
        }else if(dados.DATACTRC && dados.DATAMNF &&  dados.CHEGADAMNF  && dados.INICIODESCARGA && !dados.FINALDESCARGA && !dados.CODIGOMEG && !dados.DATAMEG){
            STATUS = `Mercadoria em deposito destino desde ${ format_data_atc(dados.INICIODESCARGA) } (Descarregando)`
        
        }else if(dados.DATACTRC && dados.DATAMNF &&  dados.CHEGADAMNF  && dados.INICIODESCARGA && dados.FINALDESCARGA && !dados.CODIGOMEG && !dados.DATAMEG){
            STATUS = `Mercadoria em deposito destino desde ${ format_data_atc(dados.FINALDESCARGA) }`
        
        }else if(dados.CODIGOMEG && dados.DATAMEG && dados.TIPOENTREGA=="R" && !dados.DATAENTREGA){
            STATUS = `Mercadoria saiu para entrega por Redespacho em ${ format_data_atc(dados.DATAMEG) }`
        
        }else if(dados.CODIGOMEG && dados.DATAMEG && !dados.DATAENTREGA){
            STATUS = `Mercadoria saiu para Entrega em ${ format_data_atc(dados.DATAMEG) } `
        
        }else if(dados.DATACTRC && dados.DATAMNF && dados.CHEGADAMNF  && dados.CODIGOMEG && dados.DATAMEG && dados.TIPOENTREGA=="R" && dados.DATAENTREGA){
            STATUS = `Mercadoria entregue por Redespacho em ${ format_data_atc(dados.DATAENTREGA) }`
        
        }else if(dados.DATACTRC && dados.DATAMNF && dados.DATAMEG && dados.DATAENTREGA){
            STATUS = `Mercadoria Entregue em ${ format_data_atc(dados.DATAENTREGA) }`
        
        }else{
        
            STATUS = "Sem Status"
        }	

        return STATUS

    }

    function format_data_atc (dtParam) {
        let dt_iso =  new Date( Date.parse( dtParam ) ).toISOString() 
        let hs_str = dt_iso.substr(11,8)
        let dt_str = dt_iso.substr(8,2) +'/'+dt_iso.substr(5,2)+'/'+dt_iso.substr(0,4)+( hs_str=='00:00:00' ? '' : ' '+hs_str )
        return dt_str
    }

}

module.exports = posicaoCargaXLS