const sql    = require('mssql')  
const config = require('../../config/dbTMS.json')  

const poolPromise = new sql.ConnectionPool(config)  
    .connect()  
    .then(pool => {  
        console.log('TMS - BD Conectado com sucesso !!!')  
        return pool  
    })  
    .catch(err => console.log('Falha ao conectar ao BD (TMS) !!!', err))  

module.exports = { sql, poolPromise  } 