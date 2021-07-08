const qr = require('qr-image')

async function QRcode( req, res ) {
    const type   = req.body.type    || 'svg'
    const size   = req.body.size    || 5
    const margin = req.body.margin  || 3
    const dados  = JSON.stringify( req.body )
    const code   = qr.image(dados,{type:type, size:size, margin:margin}) 
    res.type(type)
    code.pipe(res)   
}

module.exports = QRcode

// png, svg, eps and pdf formats;