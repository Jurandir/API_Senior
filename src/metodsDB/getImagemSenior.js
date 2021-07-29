// 28-07-2021 
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

    // console.log('params:',params)

    if(!Base){
      Base = 'softran_termaco'
    } 

    if(!retTipo){
      retTipo = 2
    } 

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

    // console.log('extTypes:',extTypes)

    let sql = `
    SELECT a.CdEmpresa
    ,      d.DsApelido     AS DsFilial
    ,      a.NrDoctoFiscal
    ,      a.NrSeqControle
    ,      c.CdSequencia
    ,      c.DsArquivo
    ,      c.DsTipoArquivo
    ,      c.DsNomeArquivo
      FROM ${Base}.dbo.gtcconhe      a                                                                    -- Conhecimento
      LEFT JOIN ${Base}.dbo.sisempre d ON d.cdempresa = a.cdempresa                                       -- Filial Origem
      LEFT JOIN ${Base}.dbo.gtcconce b ON b.CdEmpresa = a.CdEmpresa AND b.NrSeqControle = a.NrSeqControle -- CTe Fiscal
      LEFT JOIN ${Base}.dbo.GTCMVEDG c ON c.CdEmpresa = a.CdEmpresa AND c.NrSeqControle = a.NrSeqControle -- Comprovante de Entrega baixado pelo RMS
      ${s_where}
      AND c.DsTipoArquivo in ${extTypes}
    `
    try {
      let data = await sqlQuery(sql)

      // console.log('DATA:',sql,data)

      retorno.rows    = data.length
      retorno.success = retorno.rows > 0  
      retorno.message = retorno.success ? 'Sucesso. Ok.' : 'Dados não localizados'
      
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