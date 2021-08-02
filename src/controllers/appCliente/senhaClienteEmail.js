// 02-08-2021 13:35
const sqlQuery  = require('../../connection/sqlSENIOR')
const jwt       = require('jsonwebtoken')

async function senhaClienteEmail( req, res ) {
    let retorno = {
        sucesso: false,
        message: '',
        emails:[]
    }
    let params = req.method == 'GET' ? req.query : req.body
    let { Base, cnpj, email } = params

    if(!Base){
        Base = 'softran_termaco'
    }

    let s_select = `SELECT lower(DsEMail) EMAILS FROM ${Base}.dbo.SISCli WHERE CdInscricao = '${cnpj}' `
        
    try { 
        let profileset = await sqlQuery(s_select)

        console.log('DADOS:',profileset)
  
        let { Erro } = profileset
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} - Params = [ ${Base}, ${cnpj} ]`)
        }

        let send_data = profileset[0]
        if(send_data){
            retorno.emails  = send_data.EMAILS.split(';').filter((f)=>f.length>0)
        }   

        retorno.sucesso = (retorno.emails.length>0)
        retorno.message = retorno.sucesso ? 'Emais relacionados ao cliente.' : 'Não existe email cadastrado para recuperação, contactar a TERMACO !!!'
                
        if(email){
            retorno.sucesso = false;
            retorno.sendTo = email
            if(retorno.emails.includes(email)){
                retorno.message = 'Serviço indisponível no momento, tente mais tarde !!!'

                let token = jwt.sign({ "cnpj" : cnpj, "sendTo": email }, process.env.SECRET, { expiresIn: '24h'})
                console.log('token:',token,cnpj,email)

                // (envia email com senha)
            } else {
                retorno.message = 'Email informado não está cadastrado para o cliente !!!'
            }
        }
               
        res.json(retorno).status(200)

        } catch (err) {  
            console.log(err)
            retorno.message = err.message
            retorno.rotine  = 'senhaClienteEmail.js' 
            res.send(retorno).status(500)  
        } 
}

module.exports = senhaClienteEmail
