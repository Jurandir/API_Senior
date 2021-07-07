const veiculo_PosicaoAtual = require('./veiculo_PosicaoAtual')
const insertMovimento      = require('../updates/controlePatio/insertMovimento')

async function veiculo_RegistraES_POST( req, res ) {
    let retorno = {
        success: false,
        Base: '',
        message: '',
        movimento: {},
        origem: {},
    }
    
    retorno.Base    = req.body.Base
    
    let posicao = await veiculo_PosicaoAtual( req.body.Base, req.body.NrPlaca )

    retorno.origem.CdEmpresa       = posicao.data[0].CdEmpresa
    retorno.origem.DtEntradaSaida  = posicao.data[0].DtEntradaSaida
    retorno.origem.HrEntradaSaida  = posicao.data[0].HrEntradaSaida

    // Testa tudo com possição atual
    if(posicao.success==false) {
      retorno.message  = posicao.message
      res.json(retorno).status(500) 
      return 0
    }

    let hodometro_body    = req.body.NrHodEntradaSaida
    let hodometro_posicao = posicao.data[0].NrHodAtual

    // Testa se valor do hodometro é valido
    if(hodometro_body<hodometro_posicao) {
      retorno.message  = `Valor informado para Hodômetro invalido. ( Atual:${hodometro_posicao} )`
      res.json(retorno).status(400) 
      return 0
    }
    
    //                                  Se For ENTRADA (0) usa "BODY", Se For SAÍDA USA "POSICAO ATUAL"
    retorno.movimento.CdEmpresa         = posicao.data[0].InEntradaSaida == 0 ? req.body.CdEmpresa : posicao.data[0].CdEmpresa 

    //                                  Se ENTRADA (0) gera (1) SAÍDA, se não gera ENTRADA
    retorno.movimento.InEntradaSaida    = posicao.data[0].InEntradaSaida == 0 ? 1 : 0

    retorno.message                     = posicao.data[0].InEntradaSaida == 0 ? 'Saída' : 'Entrada' 
    retorno.movimento.NrHodEntradaSaida = posicao.data[0].NrHodAtual

    retorno.movimento.DtEntradaSaida    = posicao.data[0].DtAtual
    retorno.movimento.HrEntradaSaida    = posicao.data[0].DtAtual
    retorno.movimento.CdFuncionario     = req.body.CdFuncionario
    retorno.movimento.NrPlaca           = req.body.NrPlaca
    retorno.movimento.InTpVeiculo       = req.body.InTpVeiculo
    retorno.movimento.DsVeiculo         = req.body.DsVeiculo
    retorno.movimento.CdMotivo          = req.body.CdMotivo
    retorno.movimento.CdMotorista       = req.body.CdMotorista
    retorno.movimento.DsObs             = req.body.DsObs
    retorno.movimento.InCarregado       = req.body.InCarregado

    // Se for movimento de Saída
    if(retorno.movimento.InEntradaSaida==1) {
        retorno.movimento.CdEmpRef        = posicao.data[0].CdEmpRef
        retorno.movimento.DtEntradaRef    = posicao.data[0].DtEntradaRef
        retorno.movimento.HrEntradaRef    = posicao.data[0].HrEntradaRef
    }

    try {

      let ok = await insertMovimento(retorno)

      console.log('veiculo_RegistraES_POST - OK',ok)

      retorno.success = ok.success
      retorno.message = ok.message

      res.json(retorno).status(200) 
      return 0
  
    } catch (err) {

      console.log('veiculo_RegistraES_POST (ERRO):',err)

      retorno.message  = err.message
      res.json(retorno).status(500) 
      return 0
  
    }
}

module.exports = veiculo_RegistraES_POST

/*
ENTRADA:
  (CdEmpresa, DtEntradaSaida, HrEntradaSaida, InEntradaSaida, 
  CdFuncionario, NrPlaca, InTpVeiculo, NrHodEntradaSaida, 
  DsVeiculo, CdMotorista, CdMotivo, DsObs, 
  InCarregado, DtPrevSaida, HrPrevSaida, DtPrevProxEnt, 
  HrPrevEnt)

SAÍDA:
  (CdEmpresa, DtEntradaSaida, HrEntradaSaida, InEntradaSaida, 
  CdFuncionario, NrPlaca, InTpVeiculo, NrHodEntradaSaida, 
  DsVeiculo, CdMotorista, CdMotivo, DsObs, 
  DtPrevRetorno, HrPrevRetorno, InCarregado, 
  CdEmpRef, DtEntradaRef, HrEntradaRef)

*/