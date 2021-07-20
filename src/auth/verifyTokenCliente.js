const jwt = require('jsonwebtoken')

const verifyTokenCliente = (req, res, next) => {
      req.userId = '16851732000206'
      next()
}

module.exports = verifyTokenCliente