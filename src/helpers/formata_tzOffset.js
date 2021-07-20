const formata_tzOffset = ( now ) => {
    let base = null
    if(now) {
        let str  = (new Date(now)).toISOString()
	    let len  = str.length
        let base = str.substr(0,19)+'-03:00'
        return base
    } else {
        return base
    }   
}

module.exports = formata_tzOffset

