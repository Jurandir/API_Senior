const qr = require('qr-image')

async function QRcode( req, res ) {
	let type
	let size
	let margin
	let dados
	if ( req.method == 'POST' ) {
		type   = req.body.cfg.type    || 'svg'
		size   = req.body.cfg.size    || 5
		margin = req.body.cfg.margin  || 3
		dados  = JSON.stringify( req.body.data )
	} else 
	if ( req.method == 'GET' ){
		type   = req.query.type   || 'svg'
		size   = parseInt( req.query.size   || '5' )
		margin = parseInt( req.query.margin || '3' )
		dados  = JSON.stringify({ NrPlaca: req.query.NrPlaca })
	} else {
		res.json({err:`method ${req.method} não permitido.`}).status(500) 
		return 0
	}
    const code   = qr.image(dados,{type:type, size:size, margin:margin}) 
    res.type(type)
    code.pipe(res)   
}

module.exports = QRcode

// png, svg, eps and pdf formats;
/* 
// POST:
{
	"data": {		
		"NrPlaca": "POC1909"
	},
	"cfg": {
		"type": "png",
		"size": 10,
		"margin": 3 
	}
}
*/