const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    let bearer, token
    try {
        bearer = req.headers.authorization.split(" ")[1]
        token  = bearer.replace('"','').replace('"','')
    } catch (err) {
        res.status(401).json({ success: false, message: 'Headers Authorization - Token não encontrado.', err: err })
		return 0
    }
	
    if (!token) {
        res.status(401).json({ success: false, message: 'Headers Authorization - Token não informado.' })
		return 0
    }    
	
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
	  if(decoded==undefined){
          res.status(401).json({ success: false, message: 'Headers Authorization - Decodificação do token falhou.' })		  
		  return 0
	  }		  
      if (err) {
          res.status(500).json({ success: false, message: 'Headers Authorization - Validação do token falhou.' , err: err })
		  return 0
      }     
      req.token = {
            CdEmpresa: decoded.CdEmpresa, 
            DsApelido: decoded.DsApelido 
       }
      next()
    })
}

module.exports = verifyToken