const apiDados        = require('./apiDados')
const getMapaEntrega  = require('../../metodsDB/getMapaEntrega')
const getImagemSenior = require('../../metodsDB/getImagemSenior')


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
    let url        = `${req.url}`.toLowerCase()  // Testar se "/apitracking" para buscar o comprovante
    let userId     = req.userId || '00000000000000'

    console.log('REQ',url)

    

    if(method=='POST') {
        params_new = {
            Base:     `softran_termaco`,
            CNPJ_cli: params.valoresParametros[0],
            NF_num:   params.valoresParametros[1], 
            NF_ser:   params.valoresParametros[2] || null, 
        } 
    }

    if(method=='GET') {
        params_new = {
            Base:     `softran_termaco`,
            CNPJ_cli: userId,
            NF_chave: params.chaveNFe,
        } 
    }

    let raiz_token = `${userId}`.substr(0,8)
    let raiz_req   = `${params_new.CNPJ_cli}`.substr(0,8)

    if(raiz_token!=raiz_req){
        retorno = {}
        retorno.success = false
        retorno.message = 'Raiz do CNPJ do login não confere com o da pesquisa !!!'
        res.json(retorno).status(400)
        return 0         
    }

    try {
        let code = 200
        let ret  = await apiDados(params_new)

        // console.log('apiCliente_GET RET:',ret)
         
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
            retorno.unidadeDestino. nome    = ret.data[0].DsEmpresaDestino
            retorno.unidadeDestino.endereco = ret.data[0].DsLogradouroDestino
            retorno.unidadeDestino.numero   = ret.data[0].NrFilialDestino
            retorno.unidadeDestino.bairro   = ret.data[0].DsBairroDestino
            retorno.unidadeDestino.cidade   = {}
            retorno.unidadeDestino.cidade.ibge = ret.data[0].CdIBGEDestino
            retorno.unidadeDestino.cidade.nome = ret.data[0].DsLocalDestino
            retorno.unidadeDestino.cidade.uf   = ret.data[0].DsUFDestino
            retorno.destinoPrestacao.uf        = ret.data[0].DsUFDestino
            retorno.destinoPrestacao.nome      = ret.data[0].DsLocalDestino
            retorno.destinoPrestacao.ibge      = ret.data[0].CdIBGEDestino

            retorno.localEntrega.nome          = ret.data[0].DsDestinatario
            retorno.localEntrega.endereco      = ret.data[0].DsLogradouroEntrega
            retorno.localEntrega.numero        = ret.data[0].NrEnderecoEntrega
            retorno.localEntrega.bairro        = ret.data[0].DsBairroEntrega
            retorno.localEntrega.cidade        = {}
            retorno.localEntrega.cidade.nome   = ret.data[0].DsLocalEntrega
            retorno.localEntrega.cidade.uf     = ret.data[0].DsUFEntrega
            retorno.localEntrega.cidade.ibge   = ret.data[0].CdIBGEEntrega
            retorno.documento                  =`${retorno.filial}E${retorno.numero}`
            retorno.conhecimento               =`${retorno.filial}-E-${retorno.numero}`
            retorno.cnpj_remetente             =  ret.data[0].NrCNPJCPFRemetente
            retorno.ocorrencias.push({
                codigoInterno:0, 
                codigoProceda:0, 
                descricaoOcorrencia: 'PROCESSO DE TRANSPORTE INICIADO',  
                dataRegistro: ret.data[0].DtEmissaoCTRC
            })

            ret.data.forEach(itn=>{
                if(itn.DsOcorrencia) {
                    retorno.ocorrencias.push({
                        codigoInterno: itn.CdOcorrencia, 
                        codigoProceda:itn.CdOcorrencia, 
                        descricaoOcorrencia: itn.DsOcorrencia,  
                        dataRegistro: itn.DtOcorrencia
                    })
                }
    
            })

            let mapa = await getMapaEntrega({ 
                CdEmpresa: ret.data[0].CdEmpresa, 
                NrDoctoFiscal: ret.data[0].NrDoctoFiscal
            })

            retorno.mapa = mapa.data[0]

            if(url=='/apitracking'){
                let img = await getImagemSenior({
                    CdEmpresa: ret.data[0].CdEmpresa, 
                    NrDoctoFiscal: ret.data[0].CTRC,
                    retTipo: 2    
                })

                for await (let itn of img.data){
                    retorno.comprovantes.push( itn.base64 )
                }

                console.log('IMG:',img)

                // loop comprovantes (=> retorno)

            }

            /*
            
            */
        }
               
        res.json(retorno).status(200) 
  
    } catch (err) { 
        retorno = {}
        retorno.message = err.message
        retorno.rotine  = 'apiCliente_GET.js'
        retorno.params  =  params
        res.json(retorno).status(500) 
    }    
}

module.exports = apiCliente_GET