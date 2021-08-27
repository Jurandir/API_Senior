const Packer = require('zip-stream');
const archive = new Packer(); // OR new Packer(options)

archive.on('error', function(err) {
  throw err;
});

// pipe archive where you want it (ie fs, http, etc)
// listen to the destination's end, close, or finish event

archive.entry('string contents', { name: 'AAAA_01.TXT' }, function(err, entry) {
  if (err) throw err;
  archive.entry(null, { name: 'directory/' }, function(err, entry) {
    if (err) throw err;
    archive.finish();
  });
});