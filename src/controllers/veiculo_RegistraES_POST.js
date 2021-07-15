const veiculo_PosicaoAtual = require('./veiculo_PosicaoAtual')
const insertMovimento      = require('../updates/controlePatio/insertMovimento')
const veiculo_motorista    = require('./motorista')

async function veiculo_RegistraES_POST( req, res ) {
    let retorno = {
        success: false,
        TpMovimento: 'P',
        Base: '',
        message: '',
        movimento: {},
        origem: {},
    }
    
    retorno.Base        = req.body.Base
    retorno.TpMovimento = req.body.TpMovimento

    let motorista = await veiculo_motorista( req.body.Base, req.body.CdMotorista )

    // Testa existencia do motorista na base selecionada
    if(!motorista.success) {
      retorno.message  = `Motorista (${req.body.CdMotorista}), não localizado na base (${retorno.Base}) !!!`
      res.json(retorno).status(400) 
      return 0
    }

    let posicao   = await veiculo_PosicaoAtual( req.body.Base, req.body.NrPlaca )

    // Testa tudo com possição atual
    if(posicao.success==false) {
      retorno.message  = posicao.message
      res.json(retorno).status(500) 
      return 0
    }

    retorno.origem.CdEmpresa       = posicao.data[0].CdEmpresa
    retorno.origem.DtEntradaSaida  = posicao.data[0].DtEntradaSaida
    retorno.origem.HrEntradaSaida  = posicao.data[0].HrEntradaSaida

    // Testa se Tipo de movimento compativel com a posição do veiculo (ENTRADA) - ok
    if(retorno.TpMovimento=='E' && posicao.data[0].InEntradaSaida == 0) {
      retorno.message  = `Não é possivel realizar ENTRADA. Veiculo encontra-se na filial: (${posicao.data[0].CdEmpresa}) !!!`
      res.json(retorno).status(400) 
      return 0
    }

    // Testa se Tipo de movimento compativel com a posição do veiculo (SAÍDA) - ok
    if(retorno.TpMovimento=='S' && posicao.data[0].InEntradaSaida == 1) {
      retorno.message  = `Não é possivel realizar SAÍDA. Veiculo encontra-se externo !!!`
      res.json(retorno).status(400) 
      return 0
    }

    // Testa se Tipo de movimento compativel com a posição do veiculo (SAÍDA EMPRESA) - ok
    if(retorno.TpMovimento=='S' && posicao.data[0].CdEmpresa != req.body.CdEmpresa ) {
      retorno.message  = `SAÍDA da filial (${req.body.CdEmpresa}) não é possivel. Veiculo encontra-se na filial (${posicao.data[0].CdEmpresa}) !!!`
      res.json(retorno).status(400) 
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
        retorno.movimento.CdEmpRef        = posicao.data[0].CdEmpresa
        retorno.movimento.DtEntradaRef    = posicao.data[0].DtEntradaSaida
        retorno.movimento.HrEntradaRef    = posicao.data[0].HrEntradaSaida
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
-- EXEMPLO: "/senior/veiculoRegistraES" (POST)
{
	"Base":              "softran_transporte",
	"TpMovimento":       "S",
	"CdEmpresa":         20, 
	"InEntradaSaida":    1, 
  "CdFuncionario":     5814, 
	"NrPlaca":           "POC1909",
	"CdMotorista":       "00046579001372",
	"InTpVeiculo":       0, 
	"NrHodEntradaSaida": 705110, 
  "DsVeiculo":         "CAMPO DESCRIÇÃO", 
	"CdMotivo":          1, 
	"DsObs":             "CAMPO OBSERVAÇÃO - SAIDA TESTE", 
  "InCarregado":       1
}
*/