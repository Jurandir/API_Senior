const sqlQuery     = require('../connection/sqlQuery')
const json2xlsx    = require('json2xls')
const crypto       = require('crypto')
const fs           = require('fs')

const QTDE_LINHAS_XLS = 600

async function posicaoCargaXLS( req, res ) {
    let userId_Token = `${req.userId}`
    let wraiz = userId_Token.substr(0,8)
    let { DadosOuXlsx, dataini, datafim } = req.body
    
    let dados = await dadosPesquisa(wraiz,dataini,datafim)
    let idx   = -1

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

        let ime = await dadosIME(emp, ser, ctrc)
        if(ime.length>0) {
            dados[idx].CODIGOMEG    = ime[0].CODIGOMEG     
            dados[idx].EMPCODIGOMEG = ime[0].EMPCODIGOMEG
            dados[idx].RECEBEDOR    = ime[0].RECEBEDOR
        } else {
            dados[idx].CODIGOMEG    = null
            dados[idx].EMPCODIGOMEG = null     
            dados[idx].RECEBEDOR    = null
        }

        if(item.CGCCPFREMET==userId_Token){
            dados[idx].TIPO="ENTREGA"
        } else if(item.CGCCPFDEST==userId_Token) {
            dados[idx].TIPO="REVERSA"
        } else {
            dados[idx].TIPO=""
        } 

        let megCod = dados[idx].CODIGOMEG 
        let megEmp = dados[idx].EMPCODIGOMEG
        let meg    = await dadosMEG(megCod, megEmp)
        dados[idx].DATAMEG     = meg[0].DATAMEG     
        dados[idx].TIPOENTREGA = meg[0].TIPOENTREGA 
        
        dados[idx].STATUS =  status(dados[idx])

        let ocorr = await dadosOCORRENCIA(emp, ser, ctrc)
        dados[idx].OCORRENCIAS = ocorr

    }

    let xlsx 
    let filename 
    
    if(DadosOuXlsx!=='D') {
        let newDados = dadosXLS(dados)        
        xlsx = json2xlsx(newDados);
        filename = crypto.randomBytes(20).toString('hex')+'.xlsx'
        fs.writeFileSync(`./public/downloads/${filename}`, xlsx, 'binary');
    }

    try {

        //let url = req.protocol + '://(' + req.get('host') + `)/downloads/${filename}`
        //let url = `http://siconline.termaco.com.br:5000/downloads/${filename}`
        let url = `http://201.49.34.12:5000//downloads/${filename}`
   
        res.json({
            success: true,
            message: DadosOuXlsx=='D' ? 'Dados' : 'Xlsx',
            dataini, datafim,
            user: userId_Token,
            download: DadosOuXlsx=='D' ? undefined : url,
            data: DadosOuXlsx=='D' ? dados : undefined,
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
                cnh.pedido AS PEDIDO
                ,nfr.nf AS NF
                ,nfr.serie AS SERIENF
                ,nfr.pnf AS PESONF
                ,cnh.emp_codigo AS EMPCODIGO
                ,cnh.serie AS SERIECTRC
                ,cnh.ctrc AS CTRC
                ,cnh.data AS DATACTRC
                ,cnh.dataembarque AS DATAEMBARQUE
                ,cnh.totfrete AS TOTFRETE
                ,cli_remet.nome AS NOMEREMET
                ,cnh.cli_cgccpf_remet AS CGCCPFREMET
                ,cid_remet.nome AS CIDADEREMET
                ,cid_remet.uf AS UFREMETENTE
                ,cli_dest.nome AS NOMEDEST
                ,cnh.cli_cgccpf_dest AS CGCCPFDEST
                ,cid_dest.nome AS CIDADEDEST
                ,cid_dest.uf AS UFDESTINATARIO
                ,cnh.datacoleta AS DATACOLETA
                ,cnh.preventrega AS PREVENTREGA
                ,cnh.dataentrega AS DATAENTREGA
                ,fat.codigo AS FATURA
                ,fat.valor AS FATVALOR
                ,fat.datavenc AS FATVENC
                ,cnh.datachegada AS DATACHEGADA
                ,nfr.valor AS VALORNF
            FROM cnh
            LEFT JOIN nfr ON nfr.emp_codigo = cnh.emp_codigo
                AND nfr.cnh_serie = cnh.serie
                AND nfr.cnh_ctrc = cnh.ctrc
            LEFT JOIN cli cli_remet ON cli_remet.cgccpf = cnh.cli_cgccpf_remet
            LEFT JOIN cli cli_dest ON cli_dest.cgccpf = cnh.cli_cgccpf_dest
            LEFT JOIN cli cli_pag ON cli_pag.cgccpf = cnh.cli_cgccpf_pag
            LEFT JOIN cid cid_remet ON cid_remet.codigo = cli_remet.cid_codigo
            LEFT JOIN cid cid_dest ON cid_dest.codigo = cli_dest.cid_codigo
            LEFT JOIN fat ON fat.codigo = cnh.fat_codigo
            WHERE cnh.data >= Convert(DATETIME, '${dataini}', 120)
                AND cnh.data <= Convert(DATETIME, '${datafim}', 120)
                AND cnh.STATUS = 'I'
                AND cnh.serie = 'E'
                AND (
                    ( SUBSTRING(cnh.cli_cgccpf_remet,1,8) = ${wraiz}) OR 
                    ( SUBSTRING(cnh.cli_cgccpf_dest,1,8) = ${wraiz} )  OR 
                    ( SUBSTRING(cnh.cli_cgccpf_pag,1,8) = ${wraiz}  ) )
            ORDER BY cnh.data
                ,cnh.ctrc
                ,cnh.dataentrega ` 

        data = await sqlQuery(wsql)
        return data
    }

    async function dadosMNF(emp, ser, ctrc) {
        let ret = [{ EMPRESA: null, MNFCODIGO: null, DATAMNF: null, CHEGADAMNF: null, INICIODESCARGA: null, FINALDESCARGA: null }]
        let wsql = `
            SELECT TOP 1 
                 mnf.emp_codigo       AS EMPRESA
                ,mnf.codigo           AS MNFCODIGO
                ,mnf.data             AS DATAMNF
                ,mnf.chegada          AS CHEGADAMNF
                ,mnf.dtiniciodescarga AS INICIODESCARGA
                ,mnf.dtfinaldescarga  AS FINALDESCARGA
            FROM trb
            LEFT JOIN mnf ON trb.emp_codigo = mnf.emp_codigo
                AND trb.mnf_codigo = mnf.codigo
            WHERE trb.emp_codigo_cnh = '${emp}'
                AND trb.cnh_serie = '${ser}'
                AND trb.cnh_ctrc = '${ctrc}'
            ORDER BY mnf.chegada`

        data = await sqlQuery(wsql)
        if(data.length>0){
            ret = data
        }
        return ret  
    }

    async function dadosOCORRENCIA(emp, ser, ctrc) {
        let wsql = `select 
                       CONCAT('[ ',convert(varchar, oun.dataoco ,105),' ',convert(varchar, oun.dataoco ,108),' - ',oco.nome,' ]') OCORRENCIA
                    from oco
                    left join oun on oun.oco_codigo=oco.codigo
                    where
                       oun.chave='${emp}${ser}${ctrc}' and oco.codigo <> '99'
                    order by oun.dataoco `
        let data = await sqlQuery(wsql)

        let ocorr = data.map((i)=>{
            return i.OCORRENCIA
        }) 

        let ocorrencias = ocorr.join(',')

        return ocorrencias  
    }

    async function dadosIME(emp, ser, ctrc) {
        let wsql = `select 
                         ime.meg_codigo AS CODIGOMEG, 
                         ime.emp_codigo AS EMPCODIGOMEG,
                         ime.recebedor  AS RECEBEDOR
                    from ime where ime.cnh_ctrc='${ctrc}' 
                     and ime.cnh_serie='${ser}' 
                     and ime.emp_codigo_cnh='${emp}' `
        data = await sqlQuery(wsql)
        return data  
    }

    async function dadosMEG(megCod, megEmp) {
        let ret = [{ DATAMEG: null, TIPOENTREGA: null }]
        let wsql = `select 
                        data         AS DATAMEG, 
                        tipoentrega  AS TIPOENTREGA
                    from meg where CODIGO = '${megCod}' 
                     and emp_codigo = '${megEmp}' `
        if(megCod) {            
            data = await sqlQuery(wsql)
        } else {
            data = ret
        }
        return data  
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