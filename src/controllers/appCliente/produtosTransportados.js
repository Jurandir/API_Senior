// 27-07-2021 
const sqlQuery     = require('../../connection/sqlSENIOR')

async function produtosTransportados(req, res) {
    let resposta = {
        success: false,
        message: 'Dados não localizados !!!',
        data: [],
        rows: 0
    }

    let { Base } = req.query

    if (!Base) {
        Base = 'softran_termaco'
    }

    let wsql = `
    SELECT 
        CdNatureza          as CODIGO
    ,   UPPER( DsNatureza ) as NOME 
    ,   CURRENT_TIMESTAMP   as DATATU
    FROM ${Base}.dbo.GTCNATUR
    ORDER BY UPPER( DsNatureza )`

    try {
        data = await sqlQuery(wsql)
             
        let { Erro } = data
        if (Erro) { 
            throw new Error(`DB ERRO - ${Erro} -> ${wsql}`)
        } 
        
        resposta.success = true
        resposta.message = 'Sucesso. OK.'
        resposta.data = data
        resposta.rows = data.length
                               
        res.json(resposta).status(200) 
                  
    } catch (err) { 
        
        resposta.message = 'Erro:'+err.message
        resposta.rotine  = 'produtosTransportados'
        resposta.err     = err                            
        res.json(resposta).status(500) 

    }    
}
                

module.exports = produtosTransportados
