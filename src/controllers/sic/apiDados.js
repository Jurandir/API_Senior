const fs            = require('fs')
const path          = require('path')
const { sql } = require('../../connection/dbSENIOR')
const sqlFileName   = path.join(__dirname, '../../sql/tranking.sql')
const sqlQuery      = require('../../connection/sqlSENIOR')

const CNPJ_TRANSPORTADOR = 'aa.nrcgccpf'
const CNPJ_REMENTENTE    = 'a.CdRemetente'
const CNPJ_DESTINATARIO  = 'h.NrCGCCPF'
const CNPJ_PAGADOR       = 'i.NrCGCCPF'
const NUM_NF             = 'b.nrnotafiscal'
const SERIE_NF           = 'b.nrserie'
const SIG_FILIAL         = 'aa.dsapelido'
const NUM_CTRC           = 'a.nrdoctofiscal'
const COD_EMPRESA        = 'a.cdempresa'
const CHAVE_NFE          = 'c.NrChaveAcessoNFe'
const CHAVE_CTRC         = 'bb.CdChaveAcesso'
const DT_EMISSAO_NF      = 'c.DtEmissao'
const DT_EMISSAO_CTRC    = 'a.dtemissao'

async function apiDados( params ) {
    let { Base, CNPJ_cli, NF_num, NF_ser, FIL_sigla, CTRC_num, NF_chave, CTRC_chave, NF_dtinicial, NF_dtfinal, CTRC_dtinicial, CTRC_dtfinal, raiz_token  } = params
    let sqlBase = fs.readFileSync(sqlFileName, "utf8")
    let retorno = {success: false, message: '', data: [] , rows: 0 }
    let par_where = ''

    if(!raiz_token) {
        raiz_token =  `${CNPJ_cli}`.substr(0,8)
    }

    if(!Base) {
        Base = `softran_modelo`
    }
    if(CNPJ_cli){
        par_where = `AND ( ${CNPJ_REMENTENTE}='${CNPJ_cli}' OR ${CNPJ_DESTINATARIO}='${CNPJ_cli}' OR ${CNPJ_PAGADOR}='${CNPJ_cli}' )`
    }
    if(NF_num){
        par_where = `${par_where} AND ( ${NUM_NF}=${NF_num} )`
    }
    if(NF_ser){
        par_where = `${par_where} AND ( ${SERIE_NF}=${NF_ser} )`
    }
    if(FIL_sigla){
        par_where = `${par_where} AND ( ${SIG_FILIAL}='${FIL_sigla}' )`
    }
    if(CTRC_num){
        par_where = `${par_where} AND ( ${NUM_CTRC}=${CTRC_num} )`
    }
    if(NF_chave){
        par_where = `${par_where} AND ( ${CHAVE_NFE}='${NF_chave}' )`
    }
    if(CTRC_chave){
        par_where = `${par_where} AND ( ${CHAVE_CTRC}='${CTRC_chave}' )`
    }
    if(NF_dtinicial){
        par_where = `${par_where} AND ( ${DT_EMISSAO_NF}>='${NF_dtinicial}' )`
    }
    if(NF_dtfinal){
        par_where = `${par_where} AND ( ${DT_EMISSAO_NF}<='${NF_dtfinal}' )`
    }
    if(CTRC_dtinicial){
        par_where = `${par_where} AND ( ${DT_EMISSAO_CTRC}>='${CTRC_dtinicial}' )`
    }
    if(CTRC_dtfinal){
        par_where = `${par_where} AND ( ${DT_EMISSAO_CTRC}<='${CTRC_dtfinal}' )`
    }

    let filtro = par_where
    let wsql

    try {

        wsql   = eval('`'+sqlBase+'`')

        if(!filtro){
            retorno.data.params = params
            retorno.data.rotine = 'apiData'
            throw new Error(`PARAMÊTROS ERRO - Params = [ ${JSON.stringify(params)} ]`)  
        }

        retorno.data = await sqlQuery(wsql)
 
        let { Erro } = retorno.data
        if (Erro) {
          retorno.data.rotine = 'apiData'
          retorno.data.sql    = wsql
          throw new Error(`DB ERRO - ${Erro} - Params = [ ${Base} ]`)
        }

        retorno.rows    = retorno.data.length
        retorno.success = (retorno.rows > 0)
        retorno.message = retorno.success ? 'Sucesso. OK.' : 'Dados não encontrados !!!'

        return retorno

    } catch (err) { 
        retorno.message = err.message
        retorno.data.sql = wsql
        retorno.rows    =  -1
        return retorno
    }    
}

module.exports = apiDados