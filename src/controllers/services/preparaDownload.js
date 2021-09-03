const fs                   = require('fs')
const getImagemSenior      = require('../../metodsDB/getImagemSenior')
const server               = process.env.IP_EXTERNO || '201.49.34.12'
const port                 = process.env.PORT   || '4999'
const hostSrv              = `http://${server}:${port}/downloads/images/`

async function preparaDownload( req, res ) {
    let params      = req.query
    let { ctrc  }   = params
    let fileName    = `Img_${ctrc}`
    let path        ='./public/images'
    let arq         = `${path}/${fileName}.png`

    let data = { success: false, message: 'parâmetro "ctrc" não informado !!!', url:'' }

    if(!ctrc) {
        res.json(data).status(400)  // 400 Bad Request
        return
    }

    if (fs.existsSync(arq)) {
        data = [{ success: true, message: 'Pesquisa. OK.', url: `${hostSrv}${fileName}.png`, file: `${fileName}.png`  }]
        res.json(data).status(200)  // OK
        return
    }

    try {
        ret = await getImagemSenior(params)

        if(ret.success) {
            let dados = []
            for await (let itn of ret.data ) {
                dados.push({
                        "success": true,
                        "message": "Pesquisa. OK.",
                        "url": `${hostSrv}${itn.fileName}`,
                        "file": itn.fileName
                })
            }
            res.json(dados).status(201)  // Criado
        } else {
			let naoOK = []
			naoOK.push(ret)
            res.json(naoOK).status(400)  // Não Localizado
        }   
    } catch(err) {

        data.message = err.message
    	let naoOK = []
		naoOK.push(data)
		
        res.json(naoOK).status(500)  // Erro
        
    }

}

module.exports = preparaDownload
