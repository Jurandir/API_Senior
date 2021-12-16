// loadFileToBinaryData.js


const fs = require('fs')

const dataBIN = (linkOrigem) => {
    let binary = fs.readFileSync(linkOrigem).toString('binary');
    let arq    = linkOrigem.split('\\').pop()
    let tp     = '.'+linkOrigem.split('.').pop()
    return { fileName: arq , binary : binary, type: tp }
}

let linkOrigem = '\\\\192.168.0.34\\GED\\23-11-2021\\35211011552312000710570010034665731326577406.png'
let linkFile = '//192.168.0.34/GED/22-10-2021/35210911552312000710570010034402501944036689.png'

let binario = dataBIN(linkOrigem)

let buff        = Buffer.from( binario.binary ,'binary')
fs.writeFileSync(binario.fileName, buff)

console.log( 'TIPO:',binario.type )


console.log( '--------------------' )
console.log( linkFile )
console.log( linkFile.split('/').pop().split('.').shift() )
console.log( linkFile.split('/').pop() )
console.log( '--------------------' )
console.log( linkOrigem )
console.log( linkOrigem.split('\\').pop().split('.').shift() )
console.log( linkOrigem.split('\\').pop() )
