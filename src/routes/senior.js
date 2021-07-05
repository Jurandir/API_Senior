const express                  = require('express')
const senior                   = express.Router()

const motorista_GET            = require('../controllers/motorista_GET')
const empresa_GET              = require('../controllers/empresa_GET')
const veiculo_GET              = require('../controllers/veiculo_GET')
const veiculo_EntradaSaida_GET = require('../controllers/veiculo_EntradaSaida_GET')
const funcionario_GET          = require('../controllers/funcionario_GET')

senior.get('/motorista'          , motorista_GET )
senior.get('/empresa'            , empresa_GET )
senior.get('/veiculo'            , veiculo_GET )
senior.get('/veiculoEntradaSaida', veiculo_EntradaSaida_GET )
senior.get('/funcionario'        , funcionario_GET )

module.exports = senior
