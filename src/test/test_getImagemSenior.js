// 28-07-2021 14:30
// params  : { Base, CdEmpresa, NrDoctoFiscal, ctrc, DsFilial ,retTipo }
// retTipo : ( 1-Download, 2-Base64 )

const getImagemSenior     = require('../metodsDB/getImagemSenior')

const CdEmpresa     = 2
const DsFilial      = 'SPO'
const NrDoctoFiscal = 1073
const retTipo       = 1 

// Teste 01
//getImagemSenior( {CdEmpresa,NrDoctoFiscal,retTipo} ).then( ret => {
//    console.log('RET:',ret)
//})

// Teste 02
//getImagemSenior( {ctrc:'SPOE1073',retTipo} ).then( ret => {
//  console.log('RET:',ret)
//})

// Teste 03
getImagemSenior( {DsFilial,NrDoctoFiscal,retTipo} ).then( ret => {
    console.log('RET:',ret)
})

