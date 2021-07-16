const express   = require('express')
const api       = express.Router()

const apiDados_GET     = require('../controllers/sic/apiDados_GET')
const apiCliente_GET     = require('../controllers/sic/apiCliente_GET')

api.get('/apiCliente'  , apiCliente_GET )
api.post('/apiCliente' , apiCliente_GET )

api.get('/apiDados'  , apiDados_GET )
api.post('/apiDados' , apiDados_GET )


module.exports = api
