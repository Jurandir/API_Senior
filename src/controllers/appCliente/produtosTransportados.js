const sqlQuery     = require('../connection/sqlQuery')

async function produtosTransportados(req, res) {
    let resposta = {
        success: false,
        message: 'Dados não localizados !!!',
        data: [],
        rows: 0
    }

    let wsql = `SELECT CODIGO,UPPER( NOME ) NOME ,DATATU FROM CARGASSQL.dbo.PRD ORDER BY NOME`

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
