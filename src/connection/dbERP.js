const sql    = require('mssql')  
const config = require('../../config/dbERP.json')  

const poolPromise = new sql.ConnectionPool(config)  
    .connect()  
    .then(pool => {  
        console.log('ERP - BD Conectado com sucesso !!!')  
        return pool  
    })  
    .catch(err => console.log('Falha ao conectar ao BD (ERP) !!!', err))  

module.exports = { sql, poolPromise  } 