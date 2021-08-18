const sqlQuery = require('../connection/sqlSENIOR')
const jwt      = require('jsonwebtoken')
const moment   = require('moment')

require("dotenv").config()

//authentication
const login = async (req, res) => {
    const credenciais = async (user,pwd) => {
        const Base = 'softran_termaco'
        let retorno  = {
            auth: false
        }

        let sql = `
        SELECT 
          CLI.DsEntidade NOME, CLI.CdInscricao CNPJ
        FROM ${Base}.dbo.SISWEBUSU USU
        JOIN ${Base}.dbo.SISCli CLI ON CLI.CdInscricao = USU.CdInscricao
        WHERE (USU.DsLogin='${user}' OR USU.CdInscricao='${user}') AND USU.DsSenha ='${pwd}'
        `
        
        let data = await sqlQuery(sql)  

         let { Erro } = data
         if ((Erro) || (!data[0])) { 
              retorno.message = 'Credenciais fornecidas não são validas.'  
              retorno.erro = Erro
        } else {
              retorno.auth    = true 
              retorno.login   = data[0].CNPJ
              retorno.name    = data[0].NOME
              retorno.message = 'Credenciais validas'  
              console.log(moment().format(),`- Login : ${user} - ${req.connection.remoteAddress} - ${data[0].NOME}`)
         }
         return retorno
      }

    let dados = await credenciais(req.body.cnpj,req.body.senha)
    let expiration = new Date()
    let addTime = expiration.getHours() + 24

    expiration.setHours(addTime)

    if(dados.auth) {
      let token = jwt.sign({ "cnpj" : dados.login }, process.env.SECRET, { expiresIn: '24h'})
      dados.token = token
      dados.expiresIn = expiration
      res.json( dados )   // tinha um return
    } else {
		res.status(401).json( dados )
	}
}
 
module.exports = login
