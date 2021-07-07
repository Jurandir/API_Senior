const tabela = 'SISVeicu'
const campo  = 'NrHodAtual'

const hodometro = async(base, NrPlaca, valor) => {
    let sql = `
    UPDATE ${base}.dbo.${tabela}
       SET ${campo} = ${valor}
    WHERE NrPlaca = '${NrPlaca}'
    `
    return sql
}

module.exports = hodometro