const md5 = require('md5')

const urlERPboleto = function ( dados ) {
    let servico  = process.env.URL_ERP_SERVICO_BOLETO
    let cNum     = dados.E1_NUM
    let cSerie   = dados.E1_PREFIXO
    let Banco    = dados.EA_PORTADO
    let Agen     = dados.EA_AGEDEP
    let Conta    = dados.EA_NUMCON
    let cIP      = process.env.IP_ERP_SERVICO_BOLETO
    let cPass    = process.env.PASS_ERP_SERVICO_BOLETO
    let cXDados  = dados.E1_FILIAL + dados.E1_PREFIXO + dados.E1_NUM + dados.E1_PARCELA + dados.E1_TIPO
    let sToken   = dados.E1_NUM + dados.E1_PREFIXO + cPass + dados.EA_PORTADO + dados.EA_AGEDEP + dados.EA_NUMCON
    let cToken   = md5(sToken)

    let url = `${servico}?cNum=${cNum}&cSerie=${cSerie}&Banco=${Banco}&Agen=${Agen}&Conta=${Conta}&cToken=${cToken}&cXDados=${cXDados}&cIP=${cIP}`

    return encodeURI( url )
}

module.exports = urlERPboleto
