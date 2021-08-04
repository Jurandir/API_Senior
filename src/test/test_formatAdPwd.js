// 04/08/2021

let senha  = process.argv[2]
let base64 =  Buffer.from(`"${senha}"`).toString("base64") 

console.log('API AD Pwd:',base64)