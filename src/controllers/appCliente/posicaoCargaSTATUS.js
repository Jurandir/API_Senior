// 02-08-2021 16:47
const sqlQuery     = require('../../connection/sqlSENIOR')

async function posicaoCargaSTATUS( req, res ) {
    let { Base, ctrc } = req.query
    if(!ctrc) { ctrc = req.body || 'XXXO9999999999' }

    if(!Base){
        Base = 'softran_termaco'
    }
	
	ctrc = `${ctrc}`.split('-').join('')
	
    let emp    = `${ctrc}`.substr(0,3)
    let serie  = `${ctrc}`.substr(3,1)
    let numero =  `${ctrc}`.substr(4,10)
    let retorno = {
        success: false,
        message: `CTRC ${ctrc} não localizada.`,
        info: {},
        status: 'Sem Status'
    }

    let wsql = `SELECT 
	                CON.CdSituacaoCarga   CODIGO
                ,	SIT.DsSituacaoCarga   STATUS
                ,   FIL.DsApelido         FILIAL
                ,   CON.NrDoctoFiscal     CTRC
                ,   CON.DtEmissao         DT_EMISSAO
                ,   CON.dtdigitacao       DT_DIGITACAO
                FROM ${Base}.dbo.GTCCONHE CON
                JOIN ${Base}.dbo.GTCSITCG SIT     ON SIT.CdSituacaoCarga = CON.CdSituacaoCarga
                JOIN ${Base}.dbo.sisempre FIL ON FIL.CdEmpresa       = CON.CdEmpresa
                WHERE FIL.DsApelido = '${emp}'
                AND CON.NrDoctoFiscal = ${numero}
                `
    try {
        let data = await sqlQuery(wsql)
        let ok   = (data.length > 0)
        retorno.info = {}
        retorno.info.FILIAL       = data[0].FILIAL
        retorno.info.CTRC         = data[0].CTRC
        retorno.info.DT_EMISSAO   = data[0].DT_EMISSAO
        retorno.info.DT_DIGITACAO = data[0].DT_DIGITACAO
        retorno.success = ok
        retorno.message = 'Sucesso. OK.'
        retorno.status  = data[0].STATUS
        retorno.codigo  = data[0].CODIGO
  
        let { Erro } = data
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} - Params = [ ${ctrc}, ${emp}, ${numero} ]`)
        }  
               
        res.json(retorno).status(200) 
  
    } catch (err) { 
        retorno.message = err.message
        retorno.info    = err
        retorno.rotine  = 'posicaoCargaSTATUS.js'
        res.json(retorno).status(500) 
    }  
    
}

module.exports = posicaoCargaSTATUS