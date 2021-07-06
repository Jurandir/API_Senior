const veiculo_PosicaoAtual = require('./veiculo_PosicaoAtual')

async function veiculo_RegistraES_POST( req, res ) {
    let retorno = {
        success: false,
        message: '',
        body: {},
        posicao: {}
    }

    retorno.body    = req.body
    retorno.posicao = await veiculo_PosicaoAtual( retorno.body.Base, retorno.body.NrPlaca )

    res.json(retorno).status(200) 
    return 0
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