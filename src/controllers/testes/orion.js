// 29/09/2021 08:30 - Dados de LOG - orion.js

const sqlQuery     = require('../../connection/sqlSENIOR')

async function orion( req, res ) {
    let params = (req.method=='GET') ? req.query : req.body
    let { danfe, ctrc } = params
    let retorno = {capa:[],itens:[]}
    let sWhere  = `WHERE (CTE.CHAVE = '${danfe}' OR CTE.CHAVEORIGINAL = '${danfe}')`

    if(ctrc) {
        sWhere  = `WHERE CTE.DOCUMENTO = '${ctrc}'`
    } 
    
    let wsql = `SELECT TOP 1 CTE.*
                FROM SIC.dbo.ORION_CTE CTE
                ${sWhere}
                `		
    try {
        data = await sqlQuery(wsql)
        retorno.capa = data
        let documento = data[0].DOCUMENTO

        wsql = `SELECT * FROM SIC.dbo.ORION_OCORRENCIAS WHERE DOCUMENTO = '${documento}'`
        data = await sqlQuery(wsql)
        retorno.itens = data
  
        let { Erro } = data
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} `)
        }  
               
        res.json(retorno).status(200).end() 
  
    } catch (err) { 
        res.send({ "erro" : err.message, "rotina" : "orion", "sql" : wsql , req: req.query }).status(500) 
    }    
}

module.exports = orion