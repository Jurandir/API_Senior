const sqlExec         = require('../../connection/sqlExSENIOR')
const montaInsert_SQL = require('../../helpers/montaInsert_SQL')
const hodometro_SQL   = require('./hodometro')
const tabela          = 'TRAESVEI'

const entrada = async(base,campos,origem) => {
    let NrPlaca    = campos.NrPlaca
    let valor      = campos.NrHodEntradaSaida
    let insert_SQL = await montaInsert_SQL(base, tabela, campos)
    let update_SQL = await hodometro_SQL(base, NrPlaca, valor )
    let sql = `
    SET XACT_ABORT ON

    BEGIN TRY
        BEGIN TRANSACTION
        -- Insere Movimento de entrada
        ${insert_SQL}
        ;
        -- Atualiza o KM (Hodômetro)
        ${update_SQL}
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

    try {
        let ret = await sqlExec(sql)
        return { success: ret.success , message: `ENTRADA: ${ret.message}` }
    } catch (err) {
        return { success: false, message: `ENTRADA: ${err.message}`, sql: sql }
    }

}

module.exports = entrada