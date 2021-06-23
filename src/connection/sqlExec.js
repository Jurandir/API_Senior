const { poolPromise } = require('./dbTMS')

async function sqlExec( sSQL ) {      
    let ret = {
        success: false,
        message:'',
        rowsAffected: 0,
        err: ''
    }
    try {  
        let pool   = await poolPromise 
        let result = await pool.request().query( sSQL )
        pool.close
        
        ret.rowsAffected = result.rowsAffected.reduce((a, b) => a + b, 0)
        ret.success = ret.rowsAffected>0
        ret.message = ret.success ? 'Sucesso. Ok.' : 'Sem registros afetados.'
        return ret

    } catch (err) {  

        ret.success      = false
        ret.message      = err.message
        ret.rowsAffected = -1
        ret.sql          = sSQL
        return ret
    } 
}
module.exports = sqlExec
