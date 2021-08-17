const express   = require('express')
const api       = express.Router()

// Acesso via AD
const loginAD                 = require('../auth/loginAD')
const verifyTokenAD           = require('../auth/verifyTokenAD')
const dadosCliente            = require('../controllers/appCliente/dadosCliente')
const placasVeiculo           = require('../controllers/appCliente/placasVeiculo')
const cartaFrete              = require('../controllers/appCliente/cartaFrete')
const cartaFretePlacas        = require('../controllers/appCliente/cartaFretePlacas')

// API Cliente
const login              = require('../auth/login')
const validaToken        = require('../auth/verifyToken')
const apiDados_GET       = require('../controllers/sic/apiDados_GET')
const apiCliente_GET     = require('../controllers/sic/apiCliente_GET')
const apiPosicao         = require('../controllers/sic/apiPosicao')
const logout             = require('../auth/logout')

// SIC
const posicaoCargaSTATUS        = require('../controllers/appCliente/posicaoCargaSTATUS')
const listDadosCTRC             = require('../controllers/appCliente/listDadosCTRC')
const cteXML                    = require('../controllers/appCliente/cteXML')
const senhaCliente              = require('../controllers/appCliente/senhaCliente') 
const dadosNF                   = require('../controllers/appCliente/dadosNF') 
const listaDAE                  = require('../controllers/appCliente/listaDAE')  

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
api.use('/apiCliente'   , validaToken, apiCliente_GET )
api.post('/apiDados'    , validaToken, apiDados_GET )
api.post('/apiTracking' , validaToken, apiCliente_GET )
api.post('/apiPosicao'  , validaToken, apiPosicao )
api.get('/logout'       , logout )

// SIC
api.get('/posicaoCargaStatus'   , posicaoCargaSTATUS)
api.get('/listDadosCTRC'        , validaToken,  listDadosCTRC  )
api.post('/ctexml'              , validaToken, cteXML )
api.post('/dadosNF'             , validaToken, dadosNF )
api.get('/listaDAE'              , validaToken, listaDAE )



// SIC AD
api.post('/loginAD'          , loginAD )
api.use('/dadosCliente'      , verifyTokenAD , dadosCliente)
api.use('/placasVeiculo'     , verifyTokenAD , placasVeiculo)
api.use('/cartaFrete'        , verifyTokenAD, cartaFrete )
api.use('/cartafreteplacas'  , verifyTokenAD, cartaFretePlacas )
api.post('/senhaCliente'     , verifyTokenAD, senhaCliente )

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
