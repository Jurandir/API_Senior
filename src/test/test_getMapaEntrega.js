// 29-07-2021 10:30
// params  : { Base, CdEmpresa, NrDoctoFiscal }


const getMapaEntrega     = require('../metodsDB/getMapaEntrega')

const CdEmpresa     = 2
const NrDoctoFiscal = 1073

// Teste 01
getMapaEntrega( {CdEmpresa,NrDoctoFiscal} ).then( ret => {
    console.log('RET:',ret)
})

