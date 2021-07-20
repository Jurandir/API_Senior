const { poolPromise } = require('../connection/dbTMS')
const jwt = require('jsonwebtoken')

async function senhaClienteEmail( req, res ) {
    let cnpj
    let email 
    let retorno = {
        sucesso: false,
        message: '',
        emails:[]
    }
    if ( req.method == 'GET' ) {
       cnpj = req.query.cnpj
    }

    if ( req.method == 'POST' ) {
        cnpj = req.body.cnpj
        email = req.body.email
    }
	
    let s_select = `SELECT lower(CONCAT(EMAIL,';',EMAILSADICIONAIS)) EMAILS FROM CLI WHERE CGCCPF = '${cnpj}' `
        
        
    try {  
        const pool = await poolPromise  
        const result = await pool.request()  
        .query( s_select ,function(err, profileset){  
            if (err) { 
                retorno.message = err 
                res.send(retorno).status(500)  
            } else {  
                let send_data = profileset.recordset[0]
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

                pool.close  
            }  
        })  
        } catch (err) {  
            retorno.message = message 
            res.send(retorno).status(500)  
        } 
}

module.exports = senhaClienteEmail
