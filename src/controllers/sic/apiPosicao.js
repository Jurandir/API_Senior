const loadAPI         = require('../../helpers/loadAPI')
const endpoint1       = '/api/apiCliente'
const getImagemSenior = require('../../metodsDB/getImagemSenior')
const server          = process.env.SERVER || 'localhost'
const port            = process.env.PORT   || '4999'

// Teste 02
//getImagemSenior( {ctrc:'SPOE1073',retTipo} ).then( ret => {
//  console.log('RET:',ret)
//})

// downloadAgileProcess - let data = { success: false, message: 'parâmetro "ctrc" não informado !!!', url:'' } 

async function apiPosicao( req, res ) {
    let download = `http:/${server}:${port}/downloads/images/`
    let params1  = req.body
    let token   = req.token
    let retorno = {}

    try {
        
        let api1     = await loadAPI('POST',endpoint1,'http://localhost:4999',params1,token)

        let param2  = { ctrc: `${api1.dados.filial}${api1.dados.serie}${api1.dados.numero}`, retTipo: 1 }
        let comprovante = {}

        if(api1.dados) {
            let api2 = await getImagemSenior(param2)
            let qtde = api2.data.length

            comprovante.success = (qtde>0)
            comprovante.message = comprovante.success ? 'Pesquisa. OK.' : 'Sem Dados !!!'
            comprovante.qtde    = qtde

            let nr  = ''
            let ctr = 0

            api2.data.map((itn)=>{
                console.log(itn)
                comprovante[`file${nr}`] = itn.fileName
                comprovante[`url${nr}`] = `${download}${itn.fileName}`
                ctr++
                nr = `${ctr}`
            })
        }
      
        retorno = api1.dados
        retorno.comprovante = comprovante
        res.json(retorno).status(200) 

    } catch (err) {
        console.log('(apiPosicao) ERR:',err)
        retorno = {}
        retorno.erro = true
        retorno.message = 'Problemas para obteção dos dados, tente mais tarde !!!'
        res.json(retorno).status(500) 

    }

}

module.exports = apiPosicao

/* 
  "comprovante": {
    "success": true,
    "message": "Pesquisa. OK.",
    "url": "http://201.49.34.12:5000/downloads/images/Img_SPOE3271600.png",
    "file": "Img_SPOE3271600.png"
  }
*/