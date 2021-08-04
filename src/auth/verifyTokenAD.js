const jwt = require('jsonwebtoken')

const verifyTokenAD = (req, res, next) => {
    let bearer, token
    try {
        bearer = req.headers.authorization.split(" ")[1]
        token  = bearer.replace('"','').replace('"','')
    } catch {
        res.status(401).json({ auth: false, message: 'Headers Authorization - Não OK.' })
    }
    if (!token) {
        res.status(401).json({ auth: false, message: 'Token não informado.' })
    }    
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) {
          res.status(500).json({ auth: false, message: 'Falha na validação do token.' }).end()
      } else {    
		  req.userId = decoded.cnpj || '00000000000000'
          req.token  = token
			
		  if (decoded.grupos) {
              req.loginAD = true
              req.decoded = decoded
		  } else {
			  req.loginAD = false		  
		  }	  
          next()
	  }
    })
}

module.exports = verifyTokenAD