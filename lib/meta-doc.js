#!/usr/bin/env node

/*
 * META Doc
 * Documentation generator
 *
 * @author META Platform <www.meta-platform.com>
 * @license MIT
 */

//Require dependencies
var fs = require("fs");
var ArgumentParser = require('argparse').ArgumentParser;
var logger = require("meta-logger");

var MetaDoc = require("../index.js");
var Compiler = require("./Compiler.js");

//Setup parser
var parser = new ArgumentParser({
	version: '1.0.0',
	addHelp:true,

});

parser.addArgument( [ '--assets-dir' ], {
	help: 'Assets dir',
	dest: 'assets'
});

parser.addArgument( [ '--pages-dir' ], {
	help: 'Pages dir',
	dest: 'pages'
});

parser.addArgument( [ '--site-dir' ], {
	help: 'Site dir',
	dest: 'site'
});

parser.addArgument( [ '--template' ], {
	help: 'Template dir',
	dest: 'template'
});

parser.addArgument( [ '--config' ], {
	help: 'Config JSON filename',
	dest: 'config'
});

parser.addArgument( [ '--cache' ], {
	help: 'Cache filename',
	dest: 'cache'
});

parser.addArgument( [ '-w' ], {
	help: 'Dynamically watch for changes',
	dest: 'watch',
	action: 'storeTrue'
});

parser.addArgument( [ '-s' ], {
	help: 'Start express erver',
	dest: 'server',
	action: 'storeTrue'
});

parser.addArgument( [ '--port' ], {
	help: 'Server port',
	dest: 'port',
	defaultValue: 8080
});

//Parse args
var args = parser.parseArgs();

//Setup logger
logger.toConsole({
    level: "debug",
    timestamp: true,
    colorize: true
});

//Create doc
var doc = null;

try {
	
	doc = MetaDoc({
		assets:   args.assets,
		pages:    args.pages,
		site:     args.site,
		template: args.template,
		config:   args.config,
		cache:    args.cache
	});

} catch(e) {

	logger.error(e.toString());
	process.exit(1);

}

doc.on("error", function(e){

	logger.error(e.toString());
	process.exit(1);	

});

//Init
doc.copyAssets();
doc.compile();

if(args.watch)
	doc.watch();

//Run server?
if(args.server){

	var express = require('express');
	var app = express();

	app.use(express.static(doc.dirSite));

	app.get("/_mtime/*", function(req, res){

		var filename = doc.dirSite + req.url.substr(8) + "index.html";

		fs.exists(filename, function(r){

			if(!r) return res.status(404).end("Not found");

			fs.stat(filename, function(err, stat){

				if(err) return res.status(500).end("Internal error");

				res.end(stat.mtime.getTime().toString());

			});

		});

	});

	var server = app.listen(args.port, function () {
		var host = server.address().address;
		var port = server.address().port;

		console.log('Server listening at http://%s:%s', host, port);
	});

}