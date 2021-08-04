const getUserAD = require('../helpers/getUserAD')
const jwt = require('jsonwebtoken')
const moment = require('moment')

require("dotenv").config()

//authentication
const loginAD = async (req, res) => {
    const credenciais = async (user,base64) => {

        let xpto = Buffer.from(base64, "base64").toString("ascii").substr(1)
        let len  = xpto.length
        let pwd  = xpto.substr(0,len-1)

        let retorno  = {}
        retorno.auth = false

        let expiration = new Date()
        let addTime = expiration.getHours() + 24
    
        expiration.setHours(addTime)
    

        let data = await getUserAD(user,pwd)

        let { success } = data
         if ( success === false ) { 
            retorno.auth       = false 
            retorno.isErr      = true
            retorno.expiresIn  = null

            retorno.message = 'Credenciais fornecidas não são validas.'  
        } else {

              retorno.data       = data
              retorno.auth       = true 
              retorno.isErr      = false
              retorno.expiresIn  = expiration
              retorno.message  = 'Credenciais validas'  
              console.log(moment().format(),`- Login : ${user} - ${req.connection.remoteAddress}`)

         }
         return retorno
      }

    let login = req.body.usuario
    let dados = await credenciais(login,req.body.senha)

    if(dados.auth) {

      let response = {}
      response.auth      = true
      response.matricula = dados.data.description
	    response.login     = login
      response.nome      = dados.data.displayName
      response.grupos    = []
      response.mail      = dados.data.mail
	  
      for await (grp of dados.data.groups) {
        response.grupos.push(grp.cn)
      }

      let cnpj = req.body.cnpj || '00000000000000'

      let token = jwt.sign({ 
        "cnpj" : cnpj,
        "nome": response.nome, 
        "login": login, 
        "matricula": response.matricula,
        "mail": response.mail,
        "grupos": response.grupos
      }, process.env.SECRET, { expiresIn: '24h'})
      response.token = token
      response.expiresIn = dados.expiresIn
      response.isErr = false

      res.status(200).json( response )
    } else {
      res.status(401).json( dados );
    }  
}
 
module.exports = loginAD
