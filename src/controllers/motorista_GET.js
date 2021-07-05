const sqlQuery     = require('../connection/sqlSENIOR')

async function motorista_GET( req, res ) {
    let par_where
    let retorno = {
        success: false,
        message: '',
        data: []
    }
    let { help, Base, NrCPF } = req.query

    if(help) {
        retorno.success = true
        retorno.message = 'Uso da endpoint (motorista) - GET'
        retorno.data.push({parametro:'Base', referencias:'softran_modelo, softran_termaco, softran_transporte'})
        retorno.data.push({parametro:'NrCPF', referencias:'CPF/CNPJ 14 digitos/Zeros a esquerda. (OPCIONAL)'})
        res.json(retorno).status(200) 
        return 0
    }    

    if(!Base) {
        Base = `softran_modelo`
    }
    
    if(NrCPF) {
       par_where = `Where NrCPF = '${NrCPF}'`
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
        let data = await sqlQuery(wsql)
  
        let { Erro } = data
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} - Params = [ ${Base}, ${NrCPF} ]`)
        }
        
        retorno.data = data
        if(!data || data.length==0){
            retorno.message = `Motorista não encontrado na Base (${Base})`
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
        retorno.rotine  = 'motorista_GET.js'
        retorno.sql     =  wsql
        res.json(retorno).status(500) 
    }    
}

module.exports = motorista_GET