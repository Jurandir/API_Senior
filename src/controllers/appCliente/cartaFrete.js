// AD
// 04/08/2021 14:28

const sqlSENIOR     = require('../../connection/sqlSENIOR')
const sqlSIC        = require('../../connection/sqlQuery')

async function cartaFrete( req, res ) {
    let params = req.method == 'GET' ? req.query : req.body
    let { Base, empresa, codigo } = params

    if(!Base){
        Base = 'softran_termaco'
    }
 
    let s_select1 = `
                SELECT 
                    CONCAT(EMP.DSAPELIDO,'-',CFT.CdCartaFrete) CARTAFRETE
                ,      (CONCAT(CFT.NrPlaca,' ',CFT.NrPlacaReboque1,' ',CFT.NrPlacaReboque2,' ',CFT.NrPlacaReboque3)) PLACAS
                ,      MOT.DsNome      MOTORISTA
                ,      CFT.DtEmissao   DATA
                FROM ${Base}.dbo.FTRCft CFT                                      -- Carta Frete
                JOIN ${Base}.dbo.SISEMPRE EMP ON EMP.cdempresa = CFT.cdempresa   -- Filial Origem
                JOIN ${Base}.dbo.GTCFUNDP MOT ON MOT.NrCPF     = CFT.NrCGCCPFMot -- Motorista
                WHERE EMP.DSAPELIDO='${empresa}' AND CFT.CdCartaFrete = ${codigo}
    `

    let s_select2 = `
                SELECT	
                    COUNT(APP.ID) FOTOS_API
                ,    SUM(ISNULL(APP.FLAG_MYSQL,0)) FOTOS_SCCD
                ,    COUNT( DISTINCT APP.IMAGEM_ID ) FOTOS_IDS
                FROM SIC.dbo.SCCD_APP APP 
                WHERE APP.DOCUMENTO = '${empresa}-${codigo}'
                GROUP BY APP.DOCUMENTO 
    `


    try {  

        let cartafrete  = await sqlSENIOR(s_select1)
        console.log('cartafrete:',cartafrete)

        let { Erro } = cartafrete            
        if (Erro) { 
            throw new Error(`DB ERRO - ${Erro} - Params = [ ${Base}, ${empresa}-${codigo} ]`)
        }        

        let sccd  = await sqlSIC(s_select2)
        console.log('sccd:',sccd)
        let sccd_data   =  sccd.length > 0 ? sccd[0] : {FOTOS_API:0, FOTOS_SCCD:0, FOTOS_IDS:0}
            
        let send_data   =  cartafrete.length > 0 ? cartafrete[0] : { }

        if(cartafrete.length > 0){
            send_data.FOTOS_API   = sccd_data.FOTOS_API
            send_data.FOTOS_SCCD  = sccd_data.FOTOS_SCCD
            send_data.FOTOS_IDS   = sccd_data.FOTOS_IDS
        }
            
        res.json(send_data).status(200)
            
    } catch (err) {  
        let erro = { isErr: true, message: err.message , rotine: 'cartaFrete.js'}
        res.json(erro).status(500)  
    } 


}

module.exports = cartaFrete
