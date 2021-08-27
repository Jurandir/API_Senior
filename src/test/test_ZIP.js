var zipper = require('zip-local');

// zipping a file to memory without compression
var buff = zipper.sync.zip("./AAAA_01.TXT").memory();

// zipping a directory to disk with compression
// the directory has the following structure
// |-- hello-world.txt
// |-- cpp
//     |-- hello-world.cpp
// |-- java
//     |--hello-world.java

zipper.sync.zip("./AAAA_01.TXT").zip("./AAAA_02.TXT").compress().save("pack.zip")

