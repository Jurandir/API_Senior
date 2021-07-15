const sqlQuery     = require('../connection/sqlSENIOR')

async function motorista( Base, NrCPF ) {
    let retorno = {success: false, message: '', data: [] , rows: 0 }
    let par_where = `WHERE NrCPF = '${NrCPF}'`
    if(!Base) {
        Base = `softran_modelo`
    }
    let wsql = `Select 
                 NrCPF, DsNome, DsApelido, DsUsuarioAlt, DtAlteracao, InFuncionario,
                 (case InFuncionario
                  when 0 then 'Freteiro'
                  when 1 then 'Funcionário da Empresa'
                  when 2 then 'Outros'
                  when 3 then 'Grupo' end) as DsInFuncionario
                 from ${Base}.dbo.GTCFUNDP
                 ${par_where}`
 
    try {
        retorno.data = await sqlQuery(wsql)
  
        let { Erro } = retorno.data
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} - Params = [ ${Base}, ${NrCPF} ]`)
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

module.exports = motorista