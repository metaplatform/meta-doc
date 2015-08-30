var logger = require("meta-logger");
var MetaDoc = require("../index.js");
var Compiler = require("../lib/Compiler.js");

logger.toConsole({
    level: "debug",
    timestamp: true,
    colorize: true
});

var doc = MetaDoc({
	assets: "../doc/assets",
	pages:  "../test/samplePages",
	site:   __dirname + "/site",
	template: "../doc/template",
	config: "../doc/config.json",
	cache:  __dirname + "/cache.json"
})
	.shortcode("test", function(contents){
		return "juhu!";
	})
	.copyAssets()
	.compile();
	//.watch();