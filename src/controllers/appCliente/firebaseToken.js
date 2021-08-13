// 10/08/2021 09:00

const sqlQuery      = require('../../connection/sqlQuery')
const sqlExec       = require('../../connection/sqlExec')
const sqlSenior     = require('../../connection/sqlSENIOR')

const firebaseToken = async (req, res) => { 
    const par_CNPJ  = req.body.cnpj
    const par_TOKEN = req.body.token
    let Base     = req.body.Base
    let result   = {success: true, message: 'OK, Token já existe na base !!!'}
    let dados
    let s_sql
    let code = 200

    if(!Base){
        Base = 'softran_termaco'
    }

    try {
        s_sql    = `SELECT * FROM ${Base}.dbo.SISCLI
                    WHERE  CdInscricao = '${par_CNPJ}'
        `   
        dados = await sqlSenior(s_sql)
        if(dados.length==0){
            throw new Error(`Cliente não existente na base de dados !!!`)
        }

        s_sql    = `SELECT * FROM SIC.dbo.FIREBASE_TOKEN 
                    WHERE CNPJ = '${par_CNPJ}'
                    AND TOKEN = '${par_TOKEN}' 
        `   
        dados = await sqlQuery(s_sql)
        if(dados.length==0){
            s_sql    = `INSERT INTO SIC.dbo.FIREBASE_TOKEN (CNPJ,TOKEN) VALUES ('${par_CNPJ}','${par_TOKEN}') 
            `       
            dados = await sqlExec(s_sql)
            if (dados.rowsAffected==-1){
                throw new Error(`DB ERRO - ${result.Erro} : SQL => [ ${s_sql} ]`)
            } else {
               result.message = 'Token inserido com sucesso !!!'
            }
        }
    }  catch (err) {
       result   = {success: false, message: 'Recurso indisponivel !!!', rotina: 'firebaseToken' ,err: err.message}
       code = 500
    }

    res.json(result).status(code) 

}

module.exports = firebaseToken