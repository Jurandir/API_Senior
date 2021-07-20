const { poolPromise } = require('../connection/dbTMS')
const estadosAtendidos = require('../helpers/estadosAtendidos')

async function dadosCidadesAtendidasPOST( req, res ) {

    let {uf,cidade} = req.body
    let addSql = ''
    let value = ''

    if(uf) {
       value = `${uf}`.toUpperCase() 
       addSql = addSql + ` AND (CID.UF = '${value}') `
    }

    if(cidade) {
        value = `${cidade}`.toUpperCase()
        addSql = addSql + ` AND (CID.NOME LIKE '%${value}%') `
     }
 

    let resposta = {
        atende: false,
        success: false,
        message: 'Dados não localizados !!!',
        data: [],
        rows: 0
    }

    let listaUF        = estadosAtendidos()
    let estadosValidos = `AND '${ listaUF.join(',') }' like '%'+UF+'%'  `

    let s_select = `SELECT CODIGO CID_CODIGO,
                        UF,
                        NOME CID_NOME,
                        CID_CODIGO_BASE CID_BASE,
                        CID_CODIGO_BASEENTREGA CID_BASE_ENTREGA, 
                        ACEITACOLETA,
                        ACEITAENTREGA,
                        ACEITAFOB 
                    FROM CID
                    WHERE NOT ( (NOME LIKE '%NÃO%UTILIZAR%') OR
                                (NOME LIKE '%NAO%UTILIZAR%') ) 
                        AND CID_CODIGO_BASE IS NOT NULL
                        AND EXISTS (SELECT 1 FROM TRE 
                                    WHERE (CID.CODIGO = SUBSTRING(TRE.CODIGO,1,3) OR 
                                           CID.CODIGO = SUBSTRING(TRE.CODIGO,4,3) ) 
                                    AND NOT( (TRE.DESTINO LIKE '%NÃO%UTILIZAR%') OR 
                                                (TRE.DESTINO LIKE '%NAO%UTILIZAR%') OR 
                                                (TRE.ORIGEM  LIKE '%NÃO%UTILIZAR%') OR
                                                (TRE.ORIGEM  LIKE '%NAO%UTILIZAR%') ) )
                        ${estadosValidos}                                                
                        ${addSql}
                    ORDER BY UF,NOME`
        
    try {  
        const pool   = await poolPromise  
        const result = await pool.request()  
        .query( s_select ,function(err, profileset){  
            if (err) {
                resposta.success = false
                resposta.message = `ERRO: ${err}`  
            } else {  
                let dados = []
                dados.push(...profileset.recordset)
                resposta.rows    = dados.length
                resposta.success = (resposta.rows>0) ? true : false
                resposta.atende  = resposta.success
                resposta.message = resposta.success ? 'Sucesso. OK.' : resposta.message
                resposta.data    = dados
                res.json(resposta).status(200)
                pool.close  
            }  
        })  
        } catch (err) {  
            resposta.success = false
            resposta.message = 'ERRO: '+err.message
            res.send(resposta).status(500)  
        } 
}

module.exports = dadosCidadesAtendidasPOST
