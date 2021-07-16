const sqlQuery     = require('../../connection/sqlSENIOR')
const veiculo_Base = require('./veiculo_Base') 

async function veiculo_GET( req, res ) {
    let par_where = `WHERE A.NrPlaca = A.NrPlaca `
    let retorno = {
        success: false,
        message: '',
        Base: '',
        data: []
    }
    let { help, NrPlaca } = req.query

    if(help) {
        retorno.success = true
        retorno.message = 'Uso da endpoint (veiculo) - GET'
        retorno.data.push({parametro:'NrPlaca'  , referencias:'Placa do veiculo. (OPCIONAL)'})
        res.json(retorno).status(200) 
        return 0
    }

    let basePlaca = await veiculo_Base(NrPlaca)
    if(!basePlaca.success){
        retorno.message = basePlaca.message
        res.json(retorno).status(404) 
        return 0
    }

    let Base      = basePlaca.Base
    retorno.Base  = Base
    
    if(NrPlaca) {
       par_where = `${par_where} AND A.NrPlaca = '${NrPlaca}'`
    }

    let wsql = `
    Select 
         A.NrPlaca
        ,C.CdVeiculo
        ,A.InVeiculo
        ,(case A.InVeiculo
        when 0 then 'Veículo da Frota'
        when 1 then 'Terceiro'
        when 2 then 'Grupo'
        end) as DsInVeiculo
        ,C.NrHodAtual
        ,B.NrAutotrac 
        ,C.NrChassis
        ,C.CdTipoVeiculo
        ,C.CdCombustivel
        ,C.CdModelo
        ,C.DsAnoModelo
        ,C.DsAnoFabricacao
        ,C.VlCapacTotal
        ,C.DsCategoria
    from ${Base}.dbo.GTCVEIDP A
    LEFT JOIN ${Base}.dbo.SISLOCID B ON A.NrPlaca   = B.NrPlaca
    left join ${Base}.dbo.SISVeicu C ON C.CdVeiculo = A.CdVeiculo
    ${par_where}
    `
    try {
        let data = await sqlQuery(wsql)
		
		// console.log('veiculo_GET SQL:',wsql)
  
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
        retorno.rotine  = 'veiculo_GET.js'
        retorno.sql     =  wsql
        res.json(retorno).status(500) 
    }    
}

module.exports = veiculo_GET