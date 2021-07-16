const apiDados = require('./apiDados')

async function apiCliente_GET( req, res ) {
    let retorno = {
        numero                   : 0,
        filial           : '',
        serie            : 'E',
        dataEmissao      : null, 
        prevEntrega      : null,
        tipoPesoM3       : 'VOL',
        pesoM3           : null,
        valorMercadoria  : null,
        valorFrete       : null,
        chave            : null,
        origemPrestacao  : {},
        notaFiscal       : {},
        unidadeDestino   : {},
        ocorrencias      : [],
        destinoPrestacao : {},
        localEntrega     : {},
        mapa             : {},
        documento        : null,
        conhecimento     : null,
        cnpj_remetente   : null,
        comprovantes     : [],

    }

    let method     = req.method
    let params     = method == 'GET' ? req.query : req.body
    let params_new = {}

    if(method=='POST') {
        params_new = {
            Base:     `softran_termaco`,
            CNPJ_cli: params.valoresParametros[0],
            NF_num:   params.valoresParametros[1], 
            NF_ser:   params.valoresParametros[2] || null, 
        } 
    }

    try {
        let code = 200
        let ret  = await apiDados(params_new)

        console.log('apiCliente_GET RET:',ret)
         
        if(!ret.success){
            retorno = {}
            retorno.message = `Dados não localizados na Base de dados !!!`
            retorno.err = ret.message
        } else {

            retorno.numero                  = ret.data[0].CTRC
            retorno.filial                  = ret.data[0].DsFilial
            retorno.dataEmissao             = ret.data[0].DtEmissaoCTRC
            retorno.prevEntrega             = ret.data[0].DtPrevisaoEntrega
            retorno.pesoM3                  = ret.data[0].QTVolumeNF
            retorno.valorMercadoria         = ret.data[0].VlNotaFiscal
            retorno.valorFrete              = ret.data[0].VlFreteCTe
            retorno.chave                   = ret.data[0].NrChaveAcessoCTe
            retorno.origemPrestacao.nome    = ret.data[0].DsLocalOrigem
            retorno.origemPrestacao.uf      = ret.data[0].DsUFOrigem
            retorno.origemPrestacao.ibge    = ret.data[0].CdIBGEorigem
            retorno.notaFiscal.numero       = ret.data[0].NrNotaFiscal
            retorno.notaFiscal.serie        = ret.data[0].SerieNF
            retorno.notaFiscal.dataEmissao  = ret.data[0].DtEmissaoNF
            retorno.notaFiscal.valor        = ret.data[0].VlNotaFiscal
            retorno.notaFiscal.chaveNFe     = ret.data[0].NrChaveAcessoNFe
            retorno.unidadeDestino.sigla    = ret.data[0].DsFilialDestino
            
            //= ret.data[0].VlFreteCTe
            /*
              "unidadeDestino": {
                                "sigla": "SLU",
                                "nome": "TERMACO SAO LUIS",
                                "endereco": "ESTRADA DE RIBAMAR",
                                "numero": "2007",
                                "bairro": "SITIO SARAMANTA",
                                "cidade": {
                                "ibge": "2111201",
                                "nome": "SAO JOSE DE RIBAMAR",
                                "uf": "MA"
                                }
                            },
            */
        }
               
        res.json(retorno).status(200) 
  
    } catch (err) { 
        retorno = {}
        retorno.message = err.message
        retorno.params  =  params
        res.json(retorno).status(500) 
    }    
}

module.exports = apiCliente_GET