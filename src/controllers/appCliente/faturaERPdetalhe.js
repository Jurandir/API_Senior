const { poolPromise } = require('../../connection/dbERP')

async function faturaERPdetalhe( req, res ) {
    let userId_Token = req.userId
    let raiz_user    = userId_Token.substr(0,8)
    let params       = req.method == 'GET' ? req.query : req.body

    let { prefixo, fatura, tipo } = params

    prefixo = `${prefixo}`.trim()

    let eFatura = 0 
    if ( prefixo=='FT' || prefixo=='REV' ) { 
        eFatura = 1 
    } else if ( prefixo=='FOR' ) {
        eFatura = 2
    }
    var s_resumo = `SELECT count(*) as QTDE,sum(DT6010.DT6_VALFRE) as Total
                    FROM DT6010
                    LEFT JOIN SE1010 ON E1_NUM = DT6_NUM AND E1_PREFIXO = DT6_PREFIX AND E1_TIPO = DT6_TIPO
                    WHERE 
                      SE1010.D_E_L_E_T_  <> '*' AND  DT6010.D_E_L_E_T_  <> '*' `
    var s_select = `SELECT
                      TRIM(CONCAT(DT6010.DT6_YFILCO,'-E-',DT6010.DT6_DOC)) as CONHECIMENTO, 
                      DT6010.DT6_YFILCO                as EMPCODIGO, 
                      DT6010.DT6_SERIE                 as SERIE, 
                      DT6010.DT6_DOC                   as CTRC, 
                      DT6010.DT6_DATEMI                as DATADOC, 
                      DT6010.DT6_VALFRE                as TOTFRETE
                    FROM DT6010
                    LEFT JOIN SE1010 ON E1_NUM = DT6_NUM AND E1_PREFIXO = DT6_PREFIX AND E1_TIPO = DT6_TIPO
                    WHERE 
                      SE1010.D_E_L_E_T_  <> '*' AND  DT6010.D_E_L_E_T_  <> '*' `
    if (eFatura==1) {
        var s_fatura  = ` AND SE1010.E1_FATURA  = '${fatura}'`
        var s_prefixo = ` AND SE1010.E1_FATPREF = '${prefixo}'`
        var s_tipo    = ` AND SE1010.E1_TIPO    = '${tipo}'`   
    } else {
        var s_fatura  = ` AND DT6010.DT6_NUM    = '${fatura}'`
        var s_prefixo = ` AND DT6010.DT6_PREFIX = '${prefixo}'`
        var s_tipo    = ` AND DT6010.DT6_TIPO   = '${tipo}'`   
    }                   
    var s_orderBy = ' ORDER BY DT6_FILDCO,DT6_DOC'
    var s_sql  = s_select + s_fatura + s_prefixo + s_tipo + s_orderBy
    var s_sql2 = s_resumo + s_fatura + s_prefixo + s_tipo
    try {  
   
            const pool = await poolPromise  

            const result1 = await pool.request()  
            .query( s_sql2 ,function(err, profileset){  
                if (err) {                
                    console.log('ERRO (module.exports = faturaERPdetalhe.js - Resumo)')
                    res.json({ err: err.message, Local: "faturaERPdetalhe.js - Resumo", sql: s_sql }).status(500)  
                } else {  
                    var resumo = profileset.recordset[0]; 

                    const result2 = pool.request()  
                    .query( s_sql ,function(err, profileset){  
                        if (err) {                
                            console.log('ERRO (module.exports = faturaERPdetalhe.js - profileset)')
                            res.json({ err: err.message, Local: "faturaERPdetalhe.js - profileset", sql: s_sql }).status(500)  
                        } else {  
                            var send_data = profileset.recordset; 
                            res.json({"data": send_data, "resumo": resumo }).status(200);
                            pool.close  
                        }  
                    })  
                }  
            })  
    } catch (err) {  
            res.send(err.message).status(500)  
    } 
}

module.exports = faturaERPdetalhe

