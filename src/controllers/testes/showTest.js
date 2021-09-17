const fs                     = require('fs')
const test_login             = require('./response/login')
const test_embarque          = require('./response/embarque')
const test_BaixaOcorrencia   = require('./response/baixaOcorrencia')

async function showTest( req, res ) {

    let url = `${req.url}`.toLowerCase()
    let resposta 

    if(url=='/login') {
       resposta = test_login()
    } else 
    if(url=='/embarque') {
       resposta = test_embarque()
    }
    if(url=='/baixaocorrencia') {
       resposta = test_BaixaOcorrencia(req.body.chave)
    } else {
        resposta = { codigo:500, status:500, url: url }
    }

	await sendLog('----------------------------------------------------')

	await sendLog( 'headers:' +'\r\n' + JSON.stringify( req.headers , null, 4 ) )
    console.log('headers:',req.headers)
    if ( req.method == 'POST' ) {
		
    	await sendLog( 'POST body:' +'\r\n' + JSON.stringify( req.body  , null, 4 ) )
        console.log('body:',req.body)
        res.json(resposta).status(200);
		
	}
    else if ( req.method == 'GET' ) {
        
    	await sendLog( 'GET body:' +'\r\n' + JSON.stringify( req.query , null, 4 ) )
		console.log('query:',req.body)
        res.json(resposta).status(200);
		
    } else {
        res.json({ erro: "ERRO" }).status(400);
    }
    
}

const sendLog = async ( linha ) => {
    

    let file = './public/ShowTest.txt'
	let row  = `${linha}`
    fs.writeFile(file, linha +'\r\n',  {'flag':'a'},  function(err) {
       if (err) {
           return console.error(err);
       }
    })    
}

module.exports = showTest