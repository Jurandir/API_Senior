function formataDataBD( dtParam ) {
    let dt_iso =  new Date( Date.parse( dtParam ) ).toISOString() 
    let dt_str = dt_iso.substr(8,2) +'/'+dt_iso.substr(5,2)+'/'+dt_iso.substr(0,4) 
    return dt_str
}

module.exports = formataDataBD
