// 04/10/2021 15:10 - Dados de LOG - johnDeere.js

const sqlQuery     = require('../../connection/sqlSENIOR')

async function johnDeere( req, res ) {
    let params = (req.method=='GET') ? req.query : req.body
    let { numero, invoice } = params
    let retorno = {send:[]}

    if(invoice){
        numero = invoice
    }
    
    let wsql = `
    SELECT 
    CONCAT('PARTS_TRUCK_',INF.EVENTTYPE,'_601_',SUBSTRING(INF.TIMESTAMP,0,9),'_',SUBSTRING(INF.TIMESTAMP,9,6),'_',INF.CODEINSERT,'.XML') FILENAME
    , INF.*
    FROM SIC..JOHNDEERE_INFO INF 
    WHERE INVOICENUMBER = ${numero}
    `			
    try {
        data = await sqlQuery(wsql)
        retorno.send = data

        let { Erro } = data
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} `)
        }  
               
        res.json(retorno).status(200).end() 
  
    } catch (err) { 
        res.send({ "erro" : err.message, "rotina" : "johnDeere", "sql" : wsql , req: req.query }).status(500) 
    }    
}

module.exports = johnDeere