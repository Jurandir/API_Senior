const sqlExec         = require('../../connection/sqlExSENIOR')
const montaInsert_SQL = require('../../helpers/montaInsert_SQL')
const hodometro_SQL   = require('./hodometro')
const tabela          = 'TRAESVEI'

const saida = async(base,campos,origem) => {
    let NrPlaca         = campos.NrPlaca
    let valor           = campos.NrHodEntradaSaida
    let insert_SQL      = await montaInsert_SQL(base, tabela, campos)
    let update_SQL      = await hodometro_SQL(base, NrPlaca, valor )
    let CdEmpresa       = origem.CdEmpresa       
    let DtEntradaSaida  = origem.DtEntradaSaida  
    let HrEntradaSaida  = origem.HrEntradaSaida  
    let CdEmpRef        = campos.CdEmpresa
    let DtEntradaRef    = campos.DtEntradaSaida
    let HrEntradaRef    = campos.HrEntradaSaida

    let sql = `
    SET XACT_ABORT ON

    BEGIN TRY
        BEGIN TRANSACTION
        -- Insere Movimento de saída
        ${insert_SQL}
        ;

        -- Atualiza o KM (Hodômetro)
        ${update_SQL}
        ;

        -- Atualiza a refêrencia na entrada com a saída
        UPDATE ${base}.dbo.${tabela}
           SET  CdEmpRef      = '${CdEmpRef}'
               ,DtEntradaRef  = '${DtEntradaRef}'
               ,HrEntradaRef  = '${HrEntradaRef}'
            WHERE
                CdEmpresa                            = '${CdEmpresa}'      AND
                FORMAT(DtEntradaSaida,'yyyy-MM-dd')  = '${DtEntradaSaida}' AND
                FORMAT(HrEntradaSaida,'hh:mm:ss')    = '${HrEntradaSaida}' AND
                InEntradaSaida                       = 0                   AND
                NrPlaca                              = '${NrPlaca}'
        ;

        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY()
        DECLARE @ErrorState INT = ERROR_STATE()

        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
    ;    
    `

    console.log('SAIDA (campos)',campos)
    console.log('SAIDA (origem)',origem)
    console.log('SAIDA (SQL)',sql)

    try {
        let ret = await sqlExec(sql)
        return { success: ret.success , message: `SAÍDA: ${ret.message}` }
    } catch (err) {
        return { success: false, message: `SAÍDA: ${err.message}`, sql: sql }
    }

}

module.exports = saida