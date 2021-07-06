const express                  = require('express')
const senior                   = express.Router()

const motorista_GET            = require('../controllers/motorista_GET')
const empresa_GET              = require('../controllers/empresa_GET')
const veiculo_GET              = require('../controllers/veiculo_GET')
const veiculo_EntradaSaida_GET = require('../controllers/veiculo_EntradaSaida_GET')
const veiculo_PosicaoAtual_GET = require('../controllers/veiculo_PosicaoAtual_GET')
const funcionario_GET          = require('../controllers/funcionario_GET')
const usuario_GET              = require('../controllers/usuario_GET')
const motivoEntradaSaida_GET   = require('../controllers/motivoEntradaSaida_GET')
const veiculo_RegistraES_POST  = require('../controllers/veiculo_RegistraES_POST')

senior.get('/motorista'          , motorista_GET )
senior.get('/empresa'            , empresa_GET )
senior.get('/veiculo'            , veiculo_GET )
senior.get('/veiculoEntradaSaida', veiculo_EntradaSaida_GET )
senior.get('/funcionario'        , funcionario_GET )
senior.get('/usuario'            , usuario_GET )
senior.get('/veiculoPosicaoAtual', veiculo_PosicaoAtual_GET )
senior.get('/motivoEntradaSaida' , motivoEntradaSaida_GET )
senior.post('/veiculoRegistraES'  , veiculo_RegistraES_POST )

module.exports = senior
