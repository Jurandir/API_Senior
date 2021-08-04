// AD
// 04/08/2021 15:53

const sqlQuery     = require('../../connection/sqlSENIOR')

async function cartaFretePlacas( req, res ) {
    let params = req.method == 'GET' ? req.query : req.body
    let { Base, placas } = params

    if(!Base){
        Base = 'softran_termaco'
    }	
 
    var s_select = `
		SELECT 
			CONCAT(EMP.DSAPELIDO,'-',CFT.CdCartaFrete) CARTAFRETE
		,      (CONCAT(CFT.NrPlaca,' ',CFT.NrPlacaReboque1,' ',CFT.NrPlacaReboque2,' ',CFT.NrPlacaReboque3)) PLACAS
		,      ''              CIDADE
		,      MOT.DsNome      MOTORISTA
		,      EMP.DSAPELIDO   TRECHO
		,      CFT.DtEmissao   DATA
		FROM ${Base}.dbo.FTRCft CFT                                      -- Carta Frete
		JOIN ${Base}.dbo.SISEMPRE EMP ON EMP.cdempresa = CFT.cdempresa   -- Filial Origem
		JOIN ${Base}.dbo.GTCFUNDP MOT ON MOT.NrCPF     = CFT.NrCGCCPFMot -- Motorista
		WHERE (CFT.NrPlaca='${placas}' OR CFT.NrPlacaReboque1 ='${placas}' OR CFT.NrPlacaReboque2 ='${placas}' OR CFT.NrPlacaReboque3 = '${placas}')
		AND CAST(CFT.DtEmissao as date) >=  ( SELECT DATEADD(DAY, -5, MAX(CAST(CFT2.DtEmissao as date)) ) 
										FROM ${Base}.dbo.FTRCft CFT2
										WHERE CFT2.NrPlaca='${placas}' OR CFT2.NrPlacaReboque1 ='${placas}' OR CFT2.NrPlacaReboque2 ='${placas}' OR CFT2.NrPlacaReboque3 = '${placas}')
		ORDER BY CFT.DtEmissao DESC
	`
		let retorno = {
			success: false,
			message: '',
			data: []
		}

		console.log(s_select)

		try {  

			let profileset  = await sqlQuery(s_select)
						
			let { Erro } = profileset
				
			if (Erro) { 
				throw new Error(`DB ERRO - ${Erro} - Params = [ ${Base}, ${placas} ]`)
			}        
			retorno.success = (profileset.length > 0)	
			retorno.message = retorno.success ? 'Sucesso. OK.' : 'Dados não localizados !!!'
		    retorno.data    = profileset
			
			res.json(retorno).status(200)
				
		} catch (err) {  
			retorno.success = false
			retorno.message = err.message
			retorno.rotine  = 'cartaFretePlacas.js'
			retorno.isErr   = true
			res.json(retorno).status(500)  
		} 		
}

module.exports = cartaFretePlacas
