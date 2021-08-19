const { poolPromise } = require('../../connection/dbERP')

async function faturaERP( req, res ) {
    let userId_Token = req.userId
    let raiz_user    = userId_Token.substr(0,8)
    let params       = req.method == 'GET' ? req.query : req.body

    let { cnpj, quitado, dataini, datafin } = params
    let a_dt, raiz_cnpj

    if (!cnpj) {
        raiz_cnpj = raiz_user
    } else {
        raiz_cnpj = `${cnpj}`.substr(0,8)
    }

    if  ( raiz_cnpj != raiz_user ) {
        res.json({ err: "Raiz do CNPJ não confere com login", Local: "faturaERP.js", sql: '' }).status(401)       
        return 0
    }

    let s_select = `SELECT (CASE WHEN (SE1010.E1_SALDO = 0 AND SE1010.E1_STATUS = 'B') 
                            THEN 'SIM' ELSE 'NÃO' END ) QUITADO,
                            SE1010.E1_PREFIXO, SE1010.E1_NUM, SE1010.E1_EMISSAO, SE1010.E1_VENCTO, 
                            SE1010.E1_BAIXA,SE1010.E1_VALOR,SE1010.E1_NUMBCO,
                            SEA010.EA_PORTADO, SEA010.EA_AGEDEP, SEA010.EA_NUMCON, 
                            SE1010.E1_FILIAL, SE1010.E1_PARCELA,SE1010.E1_TIPO, SA1010.A1_COD,
                            SA1010.A1_CGC
                    FROM SE1010
                    LEFT JOIN SEA010 ON SE1010.E1_PREFIXO = SEA010.EA_PREFIXO 
                                    AND SE1010.E1_NUM = SEA010.EA_NUM 
                                    AND SE1010.E1_PARCELA = SEA010.EA_PARCELA
                    LEFT JOIN SA1010 ON SA1010.A1_COD = SE1010.E1_CLIENTE 
                                    AND SE1010.E1_LOJA = SA1010.A1_LOJA
                    WHERE SE1010.E1_TIPO = 'CTE'
                    AND SE1010.E1_FILIAL = '0101'
                    AND SE1010.E1_SITFAT <> 3
                    AND SA1010.A1_CGC LIKE '${raiz_cnpj}%'      
                    AND SEA010.D_E_L_E_T_ <> '*' 
                    AND SE1010.D_E_L_E_T_ <> '*' 
                    AND SA1010.D_E_L_E_T_ <> '*'	
    `    
    let s_quitado = ''
    let s_dataini = ''
    let s_datafin = ''
    let s_orderBy = ' ORDER BY E1_NUM'

    if (quitado) { 
        if (quitado=='S') {
            s_quitado = ` AND SE1010.E1_SALDO = 0 AND SE1010.E1_STATUS = 'B'`
        } else {
            s_quitado = ` AND SE1010.E1_SALDO <> 0 AND SE1010.E1_STATUS = 'A'`
        }
    }
    if (dataini) { 
        a_dt = dataini.split('-')
        dt = a_dt[0] + a_dt[1] + a_dt[2]
        s_dataini = ` AND SE1010.E1_EMISSAO >= '${dt}'`
    }
    if (datafin) { 
        a_dt = datafin.split('-')
        dt = a_dt[0] + a_dt[1] + a_dt[2]
        s_datafin = ` AND SE1010.E1_EMISSAO <= '${dt}'`
    }

    let s_sql = s_select + s_quitado + s_dataini + s_datafin + s_orderBy
      
    try {  
   
        const pool = await poolPromise  
        const result = await pool.request()  
            .query( s_sql ,function(err, profileset){  
                if (err) {                
                    res.json({ err: err.message, Local: "faturaERP.js - profileset", sql: s_sql }).status(500)  
                } else {  
                    let send_data = profileset.recordset 
                    res.json(send_data).status(200)
                    pool.close  
                }  
        })  

    } catch (err) {  
            res.json({err: err.message, isErr: true}).status(500)  
    } 
}

module.exports = faturaERP
