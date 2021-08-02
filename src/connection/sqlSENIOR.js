const { poolPromise } = require('./dbSENIOR')

async function sqlSENIOR( sSQL ) {   
    // console.log('(sqlSENIOR) SQL:',sSQL)   
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
