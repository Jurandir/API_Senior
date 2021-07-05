const sql    = require('mssql')  
const config = require('../../.config/dbSENIOR.json')

const poolPromise = new sql.ConnectionPool(config)  
    .connect()  
    .then(pool => {  
        console.log('SÊNIOR - BD Conectado com sucesso !!!')  
        return pool  
    })  
    .catch(err => console.log('Falha ao conectar ao BD (SÊNIOR) !!!', err))  

module.exports = { sql, poolPromise  } 