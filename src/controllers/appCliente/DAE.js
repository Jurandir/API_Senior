const { poolPromise } = require('../../connection/dbTMS')

const NAO_IMPLEMENTADO = true

async function faturaCargas( req, res ) {
    let params = req.method == 'GET' ? req.query : req.body 
    let  { cnpj, baixado, dataini, datafin } = params
    let resposta = {
        success: false,
        message: '',
        data: []
    }

    if(NAO_IMPLEMENTADO){
        resposta.success = false
        resposta.data.push(params)
        resposta.message = 'DAE: rotina não impementada para sistema SÊNIOR.'
        res.send(resposta).status(400)  
        return 0 
    }
 
    var s_select = ` 
     SELECT 
	      dae.emp_codigo ,dae.emp_codigo_cnh as cnh_emp ,dae.cnh_serie  ,dae.cnh_ctrc 
	      ,dae.codigo	 ,dae.cli_cgccpf_clidest        ,cli.nome	    ,dae.valor
	      ,dae.status	 ,dae.dataemissao               ,dae.databaixa  ,dae.datatu
          ,dae.serienf   ,dae.banco                     ,dae.codreceita ,dae.nf
          ,dae.obs       ,dae.valornf                   ,dae.coddae     ,dae.vencimento
          ,dae.chavenfe
     FROM dae
        LEFT JOIN cnh ON cnh.emp_codigo = dae.emp_codigo_cnh
	    AND cnh.serie = dae.cnh_serie
	    AND cnh.ctrc = dae.cnh_ctrc
        LEFT JOIN cli ON cli.cgccpf = cnh.cli_cgccpf_remet
     WHERE cli_cgccpf_clidest IS NOT NULL
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
