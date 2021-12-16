// 16-12-2021 - getImagemSenior.js - Pega comprovantes/imagens na base Sênior

const fs           = require('fs')
const sqlQuery     = require('../connection/sqlSENIOR')

async function getImagemSenior( params ){
    let {Base, CdEmpresa, NrDoctoFiscal, ctrc, DsFilial ,retTipo, filesTypes } = params
    let s_where = 'WHERE 1=1'
    let retorno = {
      success : false,
      message : '',
      data:[],
      rows: 0
    }

    if(!Base){
      Base = 'softran_termaco'
    } 

    if(!retTipo){
      retTipo = 2
    } 
	
	console.log('retTipo',retTipo)

    if(!filesTypes){
      filesTypes = [`'.png'`,`'.jpg'`]
    }
    
    if(CdEmpresa){
      s_where = `${s_where} AND a.CdEmpresa = ${CdEmpresa}`
    } 

    if(ctrc){
      s_where = `${s_where} AND CONCAT(d.DsApelido,'E',a.NrDoctoFiscal) = '${ctrc}'`
    } 

    if(NrDoctoFiscal){
      s_where = `${s_where} AND a.NrDoctoFiscal = '${NrDoctoFiscal}'`
    } 

    if(DsFilial){
      s_where = `${s_where} AND d.DsApelido = '${DsFilial}'`
    } 

    let extTypes = '('+filesTypes.join()+')'

    let sql = `
    SELECT REL.* 
    ,      c.CdSequencia
    ,      c.DsArquivo
    ,      c.DsTipoArquivo
    ,      c.DsNomeArquivo
    FROM 
      ${Base}.dbo.GTCMVEDG c,
	  (    SELECT DISTINCT 
	         a.CdEmpresa
    ,      d.DsApelido     AS DsFilial
    ,      REL.NrDoctoFiscal
    ,      REL.NrSeqControle
	
      FROM ${Base}.dbo.gtcconhe    a                                                  -- Conhecimento
      JOIN ${Base}.dbo.gtcnfcon    LNK ON LNK.CdEmpresa     = a.CdEmpresa   AND
                                          LNK.NrSeqControle = a.NrSeqControle
      JOIN ${Base}.dbo.gtcnfcon    LRE ON LRE.CdInscricao   = LNK.CdInscricao AND 
                                          LRE.NrSerie       = LNK.NrSerie     AND 
			         	                          LRE.NrNotaFiscal  = LNK.NrNotaFiscal 
      JOIN ${Base}.dbo.gtcconhe    REL ON REL.CdEmpresa     = LRE.CdEmpresa   AND
                                          REL.NrSeqControle = LRE.NrSeqControle
      LEFT JOIN ${Base}.dbo.sisempre d ON d.cdempresa       = a.cdempresa            -- Filial Origem
	  
      ${s_where}
	  
      ) REL
    WHERE  
      c.CdEmpresa = REL.CdEmpresa AND c.NrSeqControle = REL.NrSeqControle            -- Comprovante de Entrega baixado pelo RMS
      AND c.DsTipoArquivo in ${extTypes}
    `
    try {
      let data = await sqlQuery(sql)

      retorno.rows    = data.length
      retorno.success = retorno.rows > 0  
      retorno.message = retorno.success ? 'Sucesso. Ok.' : 'Dados não localizados'
      retorno.data    = []
      
      for await (let element of data ) {
        let ret = retTipo == 1 ? downloadSeniorIMG(element) : base64SeniorIMG(element)
        retorno.data.push(ret)
      }
      return retorno
    
  } catch (err) {
        retorno.rows    = -1
        retorno.success = false
        retorno.message = err.message
    return retorno
  }
}

function downloadSeniorIMG(item) {
  let { DsFilial, NrDoctoFiscal, CdSequencia, DsArquivo, DsTipoArquivo } = item
  let fileName    = `${DsFilial}E${NrDoctoFiscal}_${CdSequencia}${DsTipoArquivo}`
  let path        ='./public/images'
  let arq         = `${path}/${fileName}`
  let buff        = Buffer.from( DsArquivo ,'binary')
  fs.writeFileSync(arq , buff)

  let retorno = {
    ctrc     : `${DsFilial}E${NrDoctoFiscal}`,
    seq      : CdSequencia,
    fileName : fileName,
    fullName : arq
  } 
  return retorno
}

function base64SeniorIMG(item) {
  let { DsFilial, NrDoctoFiscal, CdSequencia, DsArquivo, DsTipoArquivo } = item
  let fileName = `${DsFilial}E${NrDoctoFiscal}_${CdSequencia}${DsTipoArquivo}`
  let buff        = new Buffer.from( DsArquivo, 'binary' ).toString('base64')

  let retorno = {
    ctrc     : `${DsFilial}E${NrDoctoFiscal}`,
    seq      : CdSequencia,
    fileName : fileName,
    base64   : buff
  } 
  return retorno
}

module.exports = getImagemSenior