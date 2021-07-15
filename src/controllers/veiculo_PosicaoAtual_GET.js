const sqlQuery     = require('../connection/sqlSENIOR')

async function veiculo_PosicaoAtual_GET( req, res ) {
    let par_where = `WHERE 1=1 `
    let retorno = {
        success: false,
        message: '',
        data: []
    }
    let { help, Base, NrPlaca, CdVeiculo } = req.query

    if(help) {
        retorno.success = true
        retorno.message = 'Uso da endpoint (veiculoPosicaoAtual) - GET'
        retorno.data.push({parametro:'Base', referencias:'softran_modelo, softran_termaco, softran_transporte'})
        retorno.data.push({parametro:'CdVeiculo', referencias:'Codigo do veiculo. (OPCIONAL)'})
        retorno.data.push({parametro:'NrPlaca'  , referencias:'Placa do veiculo. (OPCIONAL)'})
        res.json(retorno).status(200) 
        return 0
    }

    if(!NrPlaca && !CdVeiculo){
        retorno.success = false
        retorno.message = 'Obrigatorio informar ( NrPlaca ou CdVeiculo ) !!!'
        res.json(retorno).status(200) 
        return 0
    }

    if(!Base) {
        Base = `softran_modelo`
    }
    
    if(NrPlaca) {
       par_where = `${par_where} AND A.NrPlaca = '${NrPlaca}'`
    }

    if(CdVeiculo) {
        par_where = `${par_where} AND CdVeiculo = '${CdVeiculo}'`
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
            ,FORMAT(A.HrEntradaRef,'HH:mm:ss') as HrEntradaRef
        FROM ${Base}.dbo.TRAESVEI A
        LEFT JOIN ${Base}.dbo.TRAMOTES B ON A.CdMotivo      = B.CdMotivo
        LEFT JOIN ${Base}.dbo.SISEMPRE C ON A.CdEmpresa     = C.CdEmpresa
        LEFT JOIN ${Base}.dbo.SISVeicu V ON V.NrPlaca       = A.NrPlaca
        LEFT JOIN ${Base}.dbo.SISFun   F ON F.CdFuncionario = A.CdFuncionario
        LEFT JOIN ${Base}.dbo.GTCFUNDP M ON M.NrCPF         = A.CdMotorista
            ${par_where}
        ORDER BY CONCAT(FORMAT(A.DtEntradaSaida,'yyyy-MM-dd'),'/',FORMAT(A.HrEntradaSaida,'HH:mm:ss')) DESC
        `
    try {
        let data = await sqlQuery(wsql)
  
        let { Erro } = data
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} - Params = [ ${Base}, ${NrPlaca} ]`)
        }
        
        retorno.data = data
        if(!data || data.length==0){
            retorno.message = `Veículo não localizado na Base (${Base})`
            retorno.rows    = 0
        } else {
            retorno.success = true
            retorno.message = `Sucesso. Ok.`
            retorno.rows    =  data.length
        }
               
        res.json(retorno).status(200) 
  
    } catch (err) { 
        retorno.message = err.message
        retorno.rows    =  -1
        retorno.rotine  = 'veiculo_PosicaoAtual_GET.js'
        retorno.sql     =  wsql
        res.json(retorno).status(500) 
    }    
}

module.exports = veiculo_PosicaoAtual_GET