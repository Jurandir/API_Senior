const express                 = require('express')
const router                  = express.Router()

const showTest                = require('../controllers/testes/showTest')
const confirmaFacil           = require('../controllers/testes/confirmaFacil')
const iTrack                  = require('../controllers/testes/iTrack')
const orion                   = require('../controllers/testes/orion')

// const itrackPainel            = require('../controllers/itrackPainel')

router.use('/confirmaFacil' , confirmaFacil )
router.use('/iTrack'        , iTrack )
router.use('/orion'         , orion )
router.use('/'              , showTest )

// router.use('/itrackPainel'  , itrackPainel )

module.exports = router
