// //192.168.0.45/c$/wamp64/www/DAEOnlineSenior/DAE/PDF

var SMB2 = require('smb2');

// create an SMB2 instance
//var smb2Client = new SMB2({
//  share:'\\\\192.168.000.045\\c$'
//, domain:'TERMACOLOG'
//, username:'jurandir.junior'
//, password:'abc4321$#@!'

//})

var smb2Client = new SMB2({
    share:'\\\\localhost\\c$'
  , domain:'TERMACOLOG'
  , username:'jurandir.junior'
  , password:'abc4321$#@!'
  
  })
  


smb2Client.readdir('Windows\\System32', function(err, files){
    if(err) throw err;
    console.log(files);
});


//smb2Client.readFile('path\\to\\my\\file.txt', function(err, data){
//    if(err) throw err;
//    console.log(data);
//});