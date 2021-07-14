const express                  = require('express')
const senior                   = express.Router()

const QRcode                   = require('../helpers/QRcode')
const verifyToken              = require('../auth/verifyToken')
const motorista_GET            = require('../controllers/motorista_GET')
const empresa_GET              = require('../controllers/empresa_GET')
const veiculo_GET              = require('../controllers/veiculo_GET')
const veiculo_EntradaSaida_GET = require('../controllers/veiculo_EntradaSaida_GET')
const veiculo_PosicaoAtual_GET = require('../controllers/veiculo_PosicaoAtual_GET')
const funcionario_GET          = require('../controllers/funcionario_GET')
const usuario_GET              = require('../controllers/usuario_GET')
const motivoEntradaSaida_GET   = require('../controllers/motivoEntradaSaida_GET')
const veiculo_RegistraES_POST  = require('../controllers/veiculo_RegistraES_POST')
const tokenControlePatio_POST  = require('../controllers/tokenControlePatio_POST')

senior.use('/QRcode'               , QRcode )
senior.post('/tokenControlePatio'  , tokenControlePatio_POST )

senior.get('/motorista'            , verifyToken, motorista_GET )
senior.get('/empresa'              , verifyToken, empresa_GET )
senior.get('/veiculo'              , verifyToken, veiculo_GET )
senior.get('/veiculoEntradaSaida'  , verifyToken, veiculo_EntradaSaida_GET )
senior.get('/funcionario'          , verifyToken, funcionario_GET )
senior.get('/usuario'              , verifyToken, usuario_GET )
senior.get('/veiculoPosicaoAtual'  , verifyToken, veiculo_PosicaoAtual_GET )
senior.get('/motivoEntradaSaida'   , verifyToken, motivoEntradaSaida_GET )
//senior.get('/motivoEntradaSaida'   , motivoEntradaSaida_GET )

senior.post('/veiculoRegistraES'   , verifyToken, veiculo_RegistraES_POST )

module.exports = senior
