const { poolPromise } = require('./dbERP')

async function sqlQuery( sSQL ) {      
    try {  
        let pool = await poolPromise 
        let result = await pool.request().query( sSQL )
        return result.recordset
    } catch (err) {  
        return ( { "Erro" : err.message } )
    } 
}
module.exports = sqlQuery
