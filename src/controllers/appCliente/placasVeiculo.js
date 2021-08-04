// AD
// 04/08/2021 11:42

const sqlQuery     = require('../../connection/sqlSENIOR')


async function placasVeiculo( req, res ) {
    let params = req.method == 'GET' ? req.query : req.body
    let { Base, placas } = params

    if(!Base){
        Base = 'softran_termaco'
    }
 
    let s_select = `
        SELECT 
            A.NrPlaca         PLACA
        ,   C.DsAnoModelo     MARCA
        ,   (case A.InVeiculo
                when 0 then 'Veículo da Frota'
                when 1 then 'Terceiro'
                when 2 then 'Grupo'
                end)          AGREGADO
        ,   0                 BLOQUEIO
        ,   ''                CIDADE
        ,	CURRENT_TIMESTAMP DATA
        FROM ${Base}.dbo.GTCVEIDP A
        LEFT JOIN ${Base}.dbo.SISLOCID B ON A.NrPlaca   = B.NrPlaca
        LEFT JOIN ${Base}.dbo.SISVeicu C ON C.CdVeiculo = A.CdVeiculo
        WHERE A.NrPlaca = '${placas}' `

    try {  

        let profileset  = await sqlQuery(s_select)
                    
        let { Erro } = profileset
            
        if (Erro) { 
            throw new Error(`DB ERRO - ${Erro} - Params = [ ${Base}, ${placas} ]`)
        }        
            
        let send_data   =  profileset.length > 0 ? profileset[0] : { }
            
        res.json(send_data).status(200)
            
    } catch (err) {  
        let erro = { isErr: true, message: err.message , rotine: 'placasVeiculo.js'}
        res.json(erro).status(500)  
    } 
}

module.exports = placasVeiculo
