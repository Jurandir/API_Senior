const { poolPromise } = require('./dbSENIOR')

async function sqlSENIOR( sSQL ) {      
    try {  
        let pool = await poolPromise 
        let result = await pool.request().query( sSQL )
        return result.recordset
        // return result.recordset
    } catch (err) {  
        return ( { "Erro" : err.message } )
    } 
}
module.exports = sqlSENIOR
