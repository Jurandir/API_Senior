const sqlQuery     = require('../connection/sqlSENIOR')

async function funcionario_GET( req, res ) {
    let par_where = `WHERE 1=1 `
    let retorno = {
        success: false,
        message: '',
        data: []
    }
    let { help, Base, CdFuncionario, NrCpf } = req.query

    if(help) {
        retorno.success = true
        retorno.message = 'Uso da endpoint (funcionario) - GET'
        retorno.data.push({parametro:'Base', referencias:'softran_modelo, softran_termaco, softran_transporte'})
        retorno.data.push({parametro:'CdFuncionario', referencias:'Matricula do funcionario. (OPCIONAL)'})
        retorno.data.push({parametro:'NrCpf', referencias:'CPF do funcionario. (OPCIONAL)'})
        res.json(retorno).status(200) 
        return 0
    }

    if(!Base) {
        Base = `softran_modelo`
    }
    
    if(NrCpf) {
       par_where = `${par_where} AND NrCpf = '${NrCpf}' `
    }

    if(CdFuncionario) {
        par_where = `${par_where} AND CdFuncionario = '${CdFuncionario}' `
     }
 
    let wsql = `SELECT * FROM ${Base}.dbo.SISFun ${par_where}`
    try {
        let data = await sqlQuery(wsql)
  
        let { Erro } = data
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} - Params = [ ${Base}, ${CdFuncionario} ]`)
        }
        
        retorno.data = data
        if(!data || data.length==0){
            retorno.message = `Funcionario não localizado na Base (${Base})`
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
        retorno.rotine  = 'funcionario_GET.js'
        retorno.sql     =  wsql
        res.json(retorno).status(500) 
    }    
}

module.exports = funcionario_GET