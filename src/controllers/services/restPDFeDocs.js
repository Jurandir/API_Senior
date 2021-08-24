const fs        = require('fs')
const axios     = require('axios')
const xml2js    = require('xml2js')
const server    = 'http://192.168.0.154:8989'
const endpoint  = '/SDE/Download'

const srv             = process.env.IP_EXTERNO || 'localhost'
const port            = process.env.PORT       || '4999'
const URL_DOWNLOAD    = `http://${srv}:${port}/downloads`

const parser = new xml2js.Parser({ attrkey: "ATTR" });

const restPDFeDocs = async ( req, res ) =>{
    let params = req.method == 'GET' ? req.query : req.body
    let { usuario, senha, tipoDocumento, chave, B64_Lnk_Down } = params
    let url = server + endpoint
    
    B64_Lnk_Down = (!B64_Lnk_Down) ? 'B' : `${B64_Lnk_Down}`.toUpperCase()

    if(!usuario) {
        usuario = 'xml_log@senior.com.br'
    }

    if(!senha) {
        senha = 'Senior@1234'
    }

    if(!tipoDocumento) {
        tipoDocumento = 3
    }
    
    let xmlBody = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nfe="http://www.senior.com.br/nfe" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">
        <soapenv:Header/>
            <soapenv:Body>
                <nfe:BaixarPdf>
                    <nfe:usuario>${usuario}</nfe:usuario>
                    <nfe:senha>${senha}</nfe:senha>
                    <nfe:tipoDocumento>${tipoDocumento}</nfe:tipoDocumento>
                    <nfe:chave>${chave}</nfe:chave>
                    <nfe:tipoProcessamento>1</nfe:tipoProcessamento>
                    <nfe:adicionais>
                        <arr:int>2</arr:int>
                    </nfe:adicionais>
                </nfe:BaixarPdf>
        </soapenv:Body>
    </soapenv:Envelope>
    `
    let config = {
        headers: { 
             "SOAPAction":"http://www.senior.com.br/nfe/IDownloadServico/BaixarPdf",
             "Content-Type": 'text/xml; charset=utf-8' 
            }
    }

    try {

        let ret = await axios.post( url, xmlBody, config )

        parser.parseString(ret.data, function(error, result) {
            if(error === null) {
                let success = (result['s:Envelope']['s:Body'][0].BaixarPdfResponse[0].BaixarPdfResult[0].Sucesso[0] == 'true')
                let message = !success ? result['s:Envelope']['s:Body'][0].BaixarPdfResponse[0].BaixarPdfResult[0].Mensagem[0] : 'Sucesso. OK.'
                let data = success ? result['s:Envelope']['s:Body'][0].BaixarPdfResponse[0].BaixarPdfResult[0].Pdfs[0].PdfRetorno[0].Conteudo : []            
                let filename = `/${chave}.pdf`
                let file = `./public/downloads/${filename}`
                let ok = { 
                    success: success,
                    message: message,
                }
                if(B64_Lnk_Down=='B') {
                    ok.Base64 = data
                } else {
                    let pdf      = Buffer.from(data[0], 'base64');
                    ok.download  = URL_DOWNLOAD+filename
                    fs.writeFileSync(file, pdf, 'binary');
                }
                if(B64_Lnk_Down=='D') {
                    res.download(file)
                } else {               
                    res.json(ok).status(200) 
                }
            }
            else {
                error.success = false
                res.json(error).status(500) 
            }
        })
    } catch (err) {
        let erro = { 
            success: false,
            message: err.message
        }
        res.json(erro).status(500) 
    }
}

module.exports = restPDFeDocs