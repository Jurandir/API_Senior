// 29/09/2021 08:30 - Dados de LOG - iTrack.js

const sqlQuery     = require('../../connection/sqlSENIOR')

async function iTrack( req, res ) {
    let params = (req.method=='GET') ? req.query : req.body
    let { danfe,idcarga } = params
    let retorno = {capa:[],itens:[]}
    let where = `WHERE NF.CHAVE = '${danfe}'`
    
    if(idcarga){
        where = `WHERE NF.IDCARGA = '${idcarga}'`
    }
    
    let wsql = `SELECT NF.*
                FROM SIC.dbo.ITRACK_DANFE NF
                ${where}`
				
    try {
        data = await sqlQuery(wsql)
        retorno.capa = data
        let id = data[0].ID

        wsql = `SELECT * FROM SIC.dbo.ITRACK_OCORRENCIA WHERE ITRACK_DANFE_ID = '${id}' ORDER BY ID`
        data = await sqlQuery(wsql)
        retorno.itens = data
  
        let { Erro } = data
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} `)
        }  
               
        res.json(retorno).status(200).end() 
  
    } catch (err) { 
        res.send({ "erro" : err.message, "rotina" : "iTrack", "sql" : wsql , req: req.query }).status(500) 
    }    
}

module.exports = iTrack