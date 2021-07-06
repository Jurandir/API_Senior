const sqlQuery     = require('../connection/sqlSENIOR')

async function usuario_GET( req, res ) {
    let par_where = `WHERE 1=1 `
    let retorno = {
        success: false,
        message: '',
        data: []
    }
    let { help, Base, CdFuncionario, DsApelido } = req.query

    if(help) {
        retorno.success = true
        retorno.message = 'Uso da endpoint (usuario) - GET'
        retorno.data.push({parametro:'Base', referencias:'softran_modelo, softran_termaco, softran_transporte'})
        retorno.data.push({parametro:'CdFuncionario', referencias:'Matricula do funcionario. (OPCIONAL)'})
        retorno.data.push({parametro:'DsApelido', referencias:'Referencia usuário - NOME. (OPCIONAL)'})
        res.json(retorno).status(200) 
        return 0
    }

    if(!Base) {
        Base = `softran_modelo`
    }
    
    if(DsApelido) {
       par_where = `${par_where} AND DsApelido = '${DsApelido}' `
    }

    if(CdFuncionario) {
        par_where = `${par_where} AND CdFuncionario = '${CdFuncionario}' `
     }
 
    let wsql = `SELECT * FROM ${Base}.dbo.SISUsuFu ${par_where}`
    try {
        let data = await sqlQuery(wsql)
  
        let { Erro } = data
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} - Params = [ ${Base}, ${CdFuncionario} ]`)
        }
        
        retorno.data = data
        if(!data || data.length==0){
            retorno.message = `Usuário não localizado na Base (${Base})`
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
        retorno.rotine  = 'usuario_GET.js'
        retorno.sql     =  wsql
        res.json(retorno).status(500) 
    }    
}

module.exports = usuario_GET