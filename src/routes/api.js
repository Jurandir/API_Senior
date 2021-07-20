const express   = require('express')
const api       = express.Router()

// API Cliente
const validaToken        = require('../auth/verifyTokenCliente')
const apiDados_GET       = require('../controllers/sic/apiDados_GET')
const apiCliente_GET     = require('../controllers/sic/apiCliente_GET')

// APP Portfolio ( ../controllers/appCliente/ )
const dadosFiliais              = require('../controllers/appCliente/dadosFiliais')
const listaFiliaisCliente       = require('../controllers/appCliente/listaFiliaisCliente')
const faturasTOTVS              = require('../controllers/appCliente/faturasTOTVS')
/*
const senhaClienteEmail         = require('../controllers/appCliente/senhaClienteEmail')
const stepTracker               = require('../controllers/appCliente/stepTracker')
const dadosCidadesAtendidas     = require('../controllers/appCliente/dadosCidadesAtendidas')
const dadosCidadesAtendidasPOST = require('../controllers/appCliente/dadosCidadesAtendidasPOST')
const posicaoCargaSTATUS        = require('../controllers/appCliente/posicaoCargaSTATUS')
const posicaoCargaAPP           = require('../controllers/appCliente/posicaoCargaAPP')
const listaDAE                  = require('../controllers/appCliente/listaDAE')
const produtosTransportados     = require('../controllers/appCliente/produtosTransportados')
const firebaseToken             = require('../controllers/appCliente/firebaseToken') 
*/

// API Cliente
api.get('/apiDados'     , apiDados_GET )
api.get('/apiCliente'   , apiCliente_GET )
api.post('/apiDados'    , apiDados_GET )
api.post('/apiCliente'  , apiCliente_GET )
api.post('/apiTracking' , apiCliente_GET )

// APP Portfolio
api.get('/filiais'                , dadosFiliais )
api.get('/listafiliaiscliente'    , listaFiliaisCliente)
api.get('/faturastotvs'           , validaToken, faturasTOTVS )
/*
router.use('/senhaclienteemail'      , senhaClienteEmail )
router.get('/steptracker'            , stepTracker )
router.get('/cidadesatentidas'       , dadosCidadesAtendidas )
router.post('/cidadesatentidaspost'  , dadosCidadesAtendidasPOST)
router.get('/posicaoCargastatus'     , posicaoCargaSTATUS)
router.get('/posicaocargaapp'        , validaToken, posicaoCargaAPP )
router.get('/listadae'               , validaToken, listaDAE )
router.get('/produtostransportados'  , produtosTransportados)

router.post('/firebasetoken'         , firebaseToken)
*/

module.exports = api
