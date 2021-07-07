const montaInsert_SQL = (base,tabela,campos) => {
    let nomes   = []
    let valores = []
    for (let campo in campos){
        let valor = `'${campos[campo]}'`
        nomes.push(campo)
        valores.push(valor)
    }
    let SQL = `
    INSERT INTO ${base}.dbo.${tabela}
    (${nomes.join(',')})
    VALUES
    (${valores.join(',')})
    `
    return SQL
}

module.exports = montaInsert_SQL
