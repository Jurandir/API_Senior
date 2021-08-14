const sqlExec       = require('../../connection/sqlExSENIOR')

const senhaCliente = async (req, res) => { 
	
	let userId_Token = req.userId
    
	let par_CNPJ   = req.body.cnpj
	let par_Base   = req.body.Base
    let par_SENHA  = Number.parseInt( req.body.senha )
    let par_GRUPOS = ','+req.body.grupos.join()+','

	if(!par_Base){
		par_Base = 'softran_termaco'
	}
	
    let result  = {success: false, message: 'Dados invalidos !!!'}
    let s_sql   = `UPDATE ${par_Base}.dbo.SISWEBUSU SET DsSenha = ${par_SENHA} WHERE DsLogin = '${par_CNPJ}'`
    let code    = 500

	if(`${userId_Token}`.substr(0,8) != `${par_CNPJ}`.substr(0,8)){
		par_SENHA = 0
		code      = 401
		result.message = 'Sem permissão para operação solicitada !!!'
	}
	
	console.log(` CNPJ : ${userId_Token}`)


	if(par_SENHA>0) {
		if(par_GRUPOS.includes(',ATI,') || par_GRUPOS.includes(',ATI-Tecnicos,') || par_GRUPOS.includes(',SICONLINE,') ) {
			code   = 200
			result = {success: false, message: ''}
		} else {
			code   = 401
			result = {success: false, message: 'Acesso negado, operação não realizada !!!'}
		}		
	}
		
	if(code===200) {
		try {
			
			let ret = await sqlExec(s_sql)

			console.log('RET:',ret)
			
			if (ret.rowsAffected == -1){
				throw new Error(`DB ERRO - ${ret.message} : UPDATE TABLE => ${par_Base}.dbo.SISWEBUSU `)
			} else {
				result.success = (ret.rowsAffected > 0 )
				result.message = result.success ? 'Senha atualizada com sucesso !!!' : 'Registro não Localizado !!!'
				code           = result.success ? 200 : 400  
			}
			
		}  catch (err) {
		   result   = {success: false, message: 'Recurso indisponivel !!!', rotina: 'senhaCliente' ,err: err.message}
		   code = 500
		}
	}
	
	console.log('Alterar senha:', code, par_CNPJ, result)

	res.json(result).status(code) 
	    
}

module.exports = senhaCliente