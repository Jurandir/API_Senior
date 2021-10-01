const { poolPromise } = require('../../connection/dbSENIOR')

async function faturaCargas( req, res ) {
    let params = req.method == 'GET' ? req.query : req.body 
    let  { cnpj, baixado, dataini, datafin } = params
    let resposta = {
        success: false,
        message: '',
        data: []
    }
 
    var s_select = ` 
    SELECT 
        dae.emp_codigo ,dae.emp_codigo_cnh as cnh_emp ,dae.cnh_serie  ,dae.cnh_ctrc 
    ,   dae.codigo	 ,dae.cli_cgccpf_clidest        ,CLI.DsEntidade nome ,dae.valor
    ,   dae.status	 ,dae.dataemissao               ,dae.databaixa  ,dae.datatu
    ,   dae.serienf   ,dae.banco                     ,dae.codreceita ,dae.nf
    ,   dae.obs       ,dae.valornf                   ,dae.coddae     ,dae.vencimento
    ,   dae.chavenfe
    FROM softran_termaco.dbo.DAE
    LEFT JOIN softran_termaco.dbo.sisempre FIL ON FIL.DSAPELIDO    = DAE.EMP_CODIGO_CNH   -- Filial Origem
    LEFT JOIN softran_termaco.dbo.gtcconhe CNH ON CNH.CdEmpresa    = FIL.CdEmpresa AND CNH.NrDoctoFiscal = DAE.CNH_CTRC
    LEFT JOIN softran_termaco.dbo.siscli   CLI ON CLI.CdInscricao  = CNH.CdRemetente
    WHERE DAE.CLI_CGCCPF_CLIDEST IS NOT NULL
    ` 
    var s_cnpj    = ''
    var s_baixado = ''
    var s_dataini = ''
    var s_datafin = ''
    var s_orderBy = ' ORDER BY cli_cgccpf_clidest desc,dae.dataemissao desc;'

    if (baixado) { baixado = baixado.toUpperCase() } else { baixado='N' } 
    
    if (cnpj)         { s_cnpj    = ` and dae.cli_cgccpf_clidest = '${cnpj}'`}
    if (baixado=='S') { s_baixado = ` and dae.databaixa IS NOT NULL`}
    if (baixado=='N') { s_baixado = ` and dae.databaixa IS NULL`}
    if (dataini)      { s_dataini = ` and dae.dataemissao >= '${dataini}'`}
    if (datafin)      { s_datafin = ` and dae.dataemissao <= '${datafin}'`}

    var s_sql = s_select + s_dataini + s_datafin + s_cnpj + s_baixado  + s_orderBy
        
    try {  
        const pool = await poolPromise  
        const result = await pool.request()  
        .query( s_sql ,function(err, profileset){  
            if (err) {  
                console.log(err)  
            } else {  
                var send_data = profileset.recordset; 
                res.json(send_data).status(200);
                pool.close  
            }  
        })  
        } catch (err) {  
            res.send(err.message).status(500)  
        } 
}

module.exports = faturaCargas

// Teste 1:
// http://localhost:5000/dae?cnpj=73694739000114&baixado=S&dataini=2020-09-01&datafin=2020-09-18
