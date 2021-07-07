const sqlQuery     = require('../connection/sqlSENIOR')

async function veiculo_PosicaoAtual( Base, NrPlaca ) {
    let retorno = {success: false, message: '', data: [] , rows: 0 }
    let par_where = `WHERE A.NrPlaca = '${NrPlaca}'`
    if(!Base) {
        Base = `softran_modelo`
    }
  
    let wsql = `
        SELECT TOP 1
            V.CdVeiculo
            ,A.NrPlaca
            ,V.NrHodAtual
            ,A.CdEmpresa
            ,C.DsEmpresa
            ,FORMAT(A.DtEntradaSaida,'yyyy-MM-dd') as DtEntradaSaida
            ,FORMAT(A.HrEntradaSaida,'hh:mm:ss') as HrEntradaSaida
            ,A.InEntradaSaida
            ,(CASE WHEN A.InEntradaSaida = 0 THEN 'Entrada'
                    WHEN A.InEntradaSaida = 1 THEN 'Saída'
                    ELSE 'Pátio' END	) DsEntradaSaida
            ,A.CdMotivo
            ,B.DsMotivo
            ,A.CdFuncionario
            ,F.DsNome as DsFuncionario
            ,A.CdMotorista
            ,M.DsNome as DsMotorista
            ,CdEmpRef
            ,FORMAT(A.DtEntradaRef,'yyyy-MM-dd') as DtEntradaRef
            ,FORMAT(A.HrEntradaRef,'hh:mm:ss') as HrEntradaRef
            ,FORMAT( CURRENT_TIMESTAMP,'yyyy-MM-dd hh:mm:ss') as DtAtual
        FROM ${Base}.dbo.TRAESVEI A
        LEFT JOIN ${Base}.dbo.TRAMOTES B ON A.CdMotivo      = B.CdMotivo
        LEFT JOIN ${Base}.dbo.SISEMPRE C ON A.CdEmpresa     = C.CdEmpresa
        LEFT JOIN ${Base}.dbo.SISVeicu V ON V.NrPlaca       = A.NrPlaca
        LEFT JOIN ${Base}.dbo.SISFun   F ON F.CdFuncionario = A.CdFuncionario
        LEFT JOIN ${Base}.dbo.GTCFUNDP M ON M.NrCPF         = A.CdMotorista
            ${par_where}
        ORDER BY CONCAT(FORMAT(A.DtEntradaSaida,'yyyy-MM-dd'),'/',FORMAT(A.HrEntradaSaida,'hh:mm:ss')) DESC
        `
    try {
        retorno.data = await sqlQuery(wsql)
  
        let { Erro } = retorno.data
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} - Params = [ ${Base}, ${NrPlaca} ]`)
        }

        retorno.rows    = retorno.data.length
        retorno.success = (retorno.rows > 0)
        retorno.message = retorno.success ? 'Sucesso. OK.' : 'Dados não encontrados !!!'

        return retorno

    } catch (err) { 
        retorno.message = err.message
        retorno.rows    =  -1
        return retorno
    }    
}

module.exports = veiculo_PosicaoAtual