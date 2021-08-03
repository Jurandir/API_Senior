const express   = require('express')
const api       = express.Router()

// API Cliente
const login              = require('../auth/login')
const validaToken        = require('../auth/verifyToken')
const apiDados_GET       = require('../controllers/sic/apiDados_GET')
const apiCliente_GET     = require('../controllers/sic/apiCliente_GET')
const apiPosicao         = require('../controllers/sic/apiPosicao')

// SIC
const posicaoCargaSTATUS        = require('../controllers/appCliente/posicaoCargaSTATUS')

// APP Portfolio ( ../controllers/appCliente/ )
const dadosFiliais              = require('../controllers/appCliente/dadosFiliais')
const listaFiliaisCliente       = require('../controllers/appCliente/listaFiliaisCliente')
const faturasTOTVS              = require('../controllers/appCliente/faturasTOTVS')
const stepTracker               = require('../controllers/appCliente/stepTracker')
const dadosCidadesAtendidas     = require('../controllers/appCliente/dadosCidadesAtendidas')
const dadosCidadesAtendidasPOST = require('../controllers/appCliente/dadosCidadesAtendidasPOST')
const produtosTransportados     = require('../controllers/appCliente/produtosTransportados')
const posicaoCargaAPP           = require('../controllers/appCliente/posicaoCargaAPP')
const senhaClienteEmail         = require('../controllers/appCliente/senhaClienteEmail')
const firebaseToken             = require('../controllers/appCliente/firebaseToken') 

/*
const listaDAE                  = require('../controllers/appCliente/listaDAE')
*/

// API Cliente
api.post('/login'       , login )
api.get('/apiDados'     , validaToken, apiDados_GET )
api.get('/apiCliente'   , validaToken, apiCliente_GET )
api.post('/apiDados'    , validaToken, apiDados_GET )
api.post('/apiCliente'  , validaToken, apiCliente_GET )
api.post('/apiTracking' , validaToken, apiCliente_GET )
api.post('/apiPosicao'  , validaToken, apiPosicao )

// SIC
api.get('/posicaoCargastatus'     , posicaoCargaSTATUS)

// APP Portfolio
api.get('/filiais'                , dadosFiliais )
api.get('/listafiliaiscliente'    , listaFiliaisCliente)
api.get('/faturastotvs'           , validaToken, faturasTOTVS )
api.get('/steptracker'            , stepTracker )
api.get('/cidadesatendidas'       , dadosCidadesAtendidas )
api.post('/cidadesatendidaspost'  , dadosCidadesAtendidasPOST)
api.get('/produtostransportados'  , produtosTransportados)
api.get('/posicaocargaapp'        , validaToken, posicaoCargaAPP )
api.use('/senhaclienteemail'      , senhaClienteEmail )
api.post('/firebasetoken'         , firebaseToken)

/*
router.get('/listadae'               , validaToken, listaDAE )
*/

module.exports = api
