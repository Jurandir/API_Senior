// 20-07-2021
// - Falta implementar o TOKEN

const urlERPboleto = require('../../helpers/urlERPboleto')
const { poolPromise } = require('../../connection/dbERP')

async function faturasTOTVS(req, res) {
    let { quitado, dataini, datafin, pagina_nro, pagina_tam } = req.query
    let userId = req.userId
    let cnpj = `${userId}`.substr(0, 8)

    if(!pagina_nro) { pagina_nro = 1}
    if(!pagina_tam) { pagina_tam = 50}

    let resposta = {
        success: false,
        message: 'Dados não localizados !!!',
        data: [],
        rows: 0,
        page: pagina_nro,
        length: pagina_tam,
    }
    
    let a_dt

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
                    AND SA1010.A1_CGC LIKE '${cnpj}%'      
                    AND SEA010.D_E_L_E_T_ <> '*' 
                    AND SE1010.D_E_L_E_T_ <> '*' 
                    AND SA1010.D_E_L_E_T_ <> '*'	
    `
    var s_quitado = ''
    var s_dataini = ''
    var s_datafin = ''
    var s_orderBy = ` ORDER BY E1_NUM
                      OFFSET (${pagina_nro} - 1) * ${pagina_tam} ROWS
                      FETCH NEXT ${pagina_tam} ROWS ONLY `


    if (quitado) {
        if (quitado == 'S') {
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
            .query(s_sql, function (err, profileset) {
                if (err) {
                    resposta.success = false
                    resposta.message = err.message
                    res.send(resposta).status(500)

                } else {

                    let dados = []
                    profileset.recordset.forEach(element => {
                        element.URL_DOWNLOAD = urlERPboleto(element) 
                        dados.push(element) 
                    })
                    // dados.push(...profileset.recordset)
                    resposta.rows = dados.length
                    resposta.success = (resposta.rows > 0) ? true : false
                    resposta.message = resposta.success ? 'Sucesso. OK.' : resposta.message
                    resposta.data = dados
                    res.json(resposta).status(200)
                    pool.close
                }
            })

    } catch (err) {
        resposta.success = false
        resposta.message = err.message
        res.send(resposta).status(500)
    }
}

module.exports = faturasTOTVS
