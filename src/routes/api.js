const express   = require('express')
const api       = express.Router()

// API Cliente
const login              = require('../auth/login')
const validaToken        = require('../auth/verifyTokenCliente')
const apiDados_GET       = require('../controllers/sic/apiDados_GET')
const apiCliente_GET     = require('../controllers/sic/apiCliente_GET')

// APP Portfolio ( ../controllers/appCliente/ )
const dadosFiliais              = require('../controllers/appCliente/dadosFiliais')
const listaFiliaisCliente       = require('../controllers/appCliente/listaFiliaisCliente')
const faturasTOTVS              = require('../controllers/appCliente/faturasTOTVS')
const stepTracker               = require('../controllers/appCliente/stepTracker')
const dadosCidadesAtendidas     = require('../controllers/appCliente/dadosCidadesAtendidas')
const dadosCidadesAtendidasPOST = require('../controllers/appCliente/dadosCidadesAtendidasPOST')
const produtosTransportados     = require('../controllers/appCliente/produtosTransportados')
const posicaoCargaAPP           = require('../controllers/appCliente/posicaoCargaAPP')


/*
const senhaClienteEmail         = require('../controllers/appCliente/senhaClienteEmail')
const posicaoCargaSTATUS        = require('../controllers/appCliente/posicaoCargaSTATUS')
const listaDAE                  = require('../controllers/appCliente/listaDAE')
const firebaseToken             = require('../controllers/appCliente/firebaseToken') 
*/

// API Cliente
api.post('/login'       , login )
api.get('/apiDados'     , apiDados_GET )
api.get('/apiCliente'   , apiCliente_GET )
api.post('/apiDados'    , apiDados_GET )
api.post('/apiCliente'  , apiCliente_GET )
api.post('/apiTracking' , apiCliente_GET )

// APP Portfolio
api.get('/filiais'                , dadosFiliais )
api.get('/listafiliaiscliente'    , listaFiliaisCliente)
api.get('/faturastotvs'           , validaToken, faturasTOTVS )
api.get('/steptracker'            , stepTracker )
api.get('/cidadesatendidas'       , dadosCidadesAtendidas )
api.post('/cidadesatendidaspost'  , dadosCidadesAtendidasPOST)
api.get('/produtostransportados'  , produtosTransportados)
api.get('/posicaocargaapp'        , validaToken, posicaoCargaAPP )



/*
router.use('/senhaclienteemail'      , senhaClienteEmail )
router.get('/posicaoCargastatus'     , posicaoCargaSTATUS)
router.get('/listadae'               , validaToken, listaDAE )

router.post('/firebasetoken'         , firebaseToken)
*/

module.exports = api
