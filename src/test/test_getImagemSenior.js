// 20-07-2021 
const sqlQuery     = require('../connection/sqlSENIOR')

const Base          = 'softran_termaco'
const CdEmpresa     = 2
const NrDoctoFiscal = 1073

let sql = `
SELECT a.CdEmpresa
,      a.NrDoctoFiscal
,      a.NrSeqControle
,      c.CdSequencia
,      c.DsArquivo
,      c.DsTipoArquivo
,      c.DsNomeArquivo
  FROM ${Base}.dbo.gtcconhe      a                                                                    -- Conhecimento
  LEFT JOIN ${Base}.dbo.gtcconce b ON b.CdEmpresa = a.CdEmpresa AND b.NrSeqControle = a.NrSeqControle -- CTe Fiscal
  LEFT JOIN ${Base}.dbo.GTCMVEDG c ON c.CdEmpresa = a.CdEmpresa AND c.NrSeqControle = a.NrSeqControle -- Comprovante de Entrega baixado pelo RMS
 WHERE a.CdEmpresa     = ${CdEmpresa}
   AND a.NrDoctoFiscal = ${NrDoctoFiscal}
`

sqlQuery(sql).then(ret=>{
    console.log('RET:',ret)
})
