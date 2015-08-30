var TreeParser = require("../lib/treeParser.js");
parser = new TreeParser("../test/samplePages");

console.log(parser.getChangedPages());

/*
var cache = parser.getCache();

for(var i in cache.files){
	cache.files[i] = 0;
	break;
}

//console.log(cache);

console.log(parser.getChangedPages(cache));

cache.hash = "blablabla";

//console.log(cache);

console.log(parser.getChangedPages(cache));
*/