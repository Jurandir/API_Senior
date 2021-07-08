const sqlQuery     = require('../connection/sqlSENIOR')
const getToken     = require('../auth/getToken')

async function tokenControlePatio_POST( req, res ) {
    let retorno = {
        success: false,
        message: '',
        token: '',
    }
    let { CdEmpresa ,DsApelido, DsSenha } = req.body
   
    if(!DsApelido) {
        retorno.message = `Campo usuário "DsApelido" obrigatorio !!!`
        res.json(retorno).status(500) 
        return 0
    }

    if(!DsSenha) {
        retorno.message = `Campo senha "DsSenha" obrigatorio !!!`
        res.json(retorno).status(500) 
        return 0
    }

    let wsql = `SELECT * FROM softrancfg.dbo.Sofusu WHERE DsApelido = '${DsApelido}'`
    try {
        let code = 200
        let token = ''
        let data = await sqlQuery(wsql)
  
        let { Erro } = data
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} - Params = [ ${CdEmpresa}, ${DsApelido} ]`)
        }

        if(data[0]==undefined || data.length==0){
            code = 404
            retorno.message = `Usuário não localizado !!!`
        } else 
        if(DsSenha != '123456') {
            code = 401
            retorno.message = `Cradênciais fornecidas não são Validas !!!`
        } else {
            retorno.success = true
            retorno.message = `Sucesso. Ok.`
            retorno.token = await getToken( CdEmpresa, DsApelido )
        }
        res.json(retorno).status(code) 
               
    } catch (err) { 
        retorno.message = err.message
        retorno.rotine  = 'tokenControlePatio_POST.js'
        res.json(retorno).status(500) 
    }    
}

module.exports = tokenControlePatio_POST