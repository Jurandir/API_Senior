function formataDataSQL( dtParam ) {

    if(!dtParam){
        console.log('ERRO (formataDataSQL): dtParam=',dtParam)
    }

    let dt_iso =  new Date( Date.parse( dtParam+'-00:00' ) ).toISOString() 
    let dt_str = dt_iso.substr(0,4)+'-'+dt_iso.substr(5,2)+'-'+dt_iso.substr(8,2)+' '+dt_iso.substr(11,8) 
    return dt_str
}

module.exports = formataDataSQL
