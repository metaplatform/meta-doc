#!/usr/bin/env node

/*
 * META Doc
 * Documentation generator
 *
 * @author META Platform <www.meta-platform.com>
 * @license See LICENSE file distributed with this source code
 */

//Require dependencies
var fs = require("fs");
var ArgumentParser = require('argparse').ArgumentParser;
var readlineSync = require('readline-sync');
var logger = require("meta-logger");

var MetaDoc = require("../index.js");
var Compiler = require("./compiler.js");
var Utils = require("./utils.js");

var args = null;
var doc = null;

var setup = function(){

	//Setup parser
	var parser = new ArgumentParser({
		version: '1.0.0',
		addHelp:true,

	});

	parser.addArgument( [ '--pages-dir' ], {
		help: 'Pages dir',
		dest: 'pages'
	});

	parser.addArgument( [ '--media-dir' ], {
		help: 'Media dir',
		dest: 'media'
	});

	parser.addArgument( [ '--site-dir' ], {
		help: 'Site dir',
		dest: 'site'
	});

	parser.addArgument( [ '--template' ], {
		help: 'Template dir',
		dest: 'template'
	});

	parser.addArgument( [ '--assets-dir' ], {
		help: 'Assets dir',
		dest: 'assets'
	});

	parser.addArgument( [ '--config' ], {
		help: 'Config JSON filename',
		dest: 'config'
	});

	parser.addArgument( [ '--cache' ], {
		help: 'Cache filename',
		dest: 'cache'
	});

	parser.addArgument( [ '-i' ], {
		help: 'Copy skeleton to selected directory',
		dest: 'init',
		action: 'storeTrue'
	});

	parser.addArgument( [ '-w' ], {
		help: 'Dynamically watch for changes and recompile',
		dest: 'watch',
		action: 'storeTrue'
	});

	parser.addArgument( [ '-s' ], {
		help: 'Start express server',
		dest: 'server',
		action: 'storeTrue'
	});

	parser.addArgument( [ '--port' ], {
		help: 'Server port',
		dest: 'port',
		defaultValue: 8080
	});

	parser.addArgument( [ '--verbose' ], {
		help: 'Logging verbose level',
		dest: 'loglevel',
		choices: [ "log", "debug", "info", "warn", "error" ],
		defaultValue: "info"
	});

	parser.addArgument( ["directory"], {
		help: 'Documentation directory',
		defaultValue: ".",
		nargs: '*'
	});

	//Parse args
	args = parser.parseArgs();

	//Setup logger
	logger.toConsole({
	    level: args.loglevel,
	    timestamp: true,
	    colorize: true
	});

	//Check template directory
	if(!args.template){
		if(fs.existsSync(args.directory[0] + "/template"))
			args.template = args.directory[0] + "/template";
		else
			args.template = __dirname + "/../template";
	}

	if(!args.assets)
		args.assets = args.template + "/assets";

	//Init?
	if(args.init)
		initSkeleton();

	//Setup doc
	setupDoc(args.server);

	//Start server?
	if(args.server)
		startServer();

};

var setupDoc = function(runServer){

	//Create output dir
	var outputDir = args.site || args.directory[0] + "/site";

	if(!fs.existsSync(outputDir)){
		logger.info("Creating site directory '%s' ...", outputDir);
		fs.mkdirSync(outputDir);
	}

	//Create doc
	try {
		
		doc = MetaDoc({
			media:    args.media || args.directory[0] + "/media",
			pages:    args.pages || args.directory[0] + "/pages",
			site:     args.site || args.directory[0] + "/site",
			template: args.template,
			assets:   args.assets,
			config:   args.config || args.directory[0] + "/config.json",
			cache:    args.cache || args.directory[0] + "/.cache"
		});

	} catch(e) {

		logger.error(e.toString());
		process.exit(1);

	}

	doc.on("error", function(e){

		logger.error(e.toString(), e.stack);
		
		if(!args.watch)
			process.exit(1);

	});

	//Server?
	if(runServer)
		doc.config.base_path = "";

	//Init
	doc.useDefaultShortcodes();
	doc.useDefaultHelpers();
	doc.useCustomHelpers();

	//Process
	doc.cleanSite();
	doc.copyMedia();
	doc.copyAssets();
	doc.compile();

	if(args.watch)
		doc.watch();

};

var startServer = function(){

	//Run server
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

	//Load rewrite rules
	if(fs.existsSync(doc.dirSite + "/rewrite.json")){

		logger.info('Rewrite rules found, parsing...');

		var addRedirect = function(oldUrl, newUrl){

			app.get(oldUrl.replace('^', '^/'), function(req, res){
				res.redirect(301, "/" + newUrl);
			});

		};

		var rulesContent = fs.readFileSync(doc.dirSite + "/rewrite.json", { encoding: 'utf-8' });
		var rules = JSON.parse(rulesContent);

		for(var pattern in rules)
			if(pattern !== "__404")
				addRedirect(pattern, rules[pattern]);

		if(rules.__404){
			app.get("*", function(req, res){

				res.sendFile(doc.dirSite + "/" + rules.__404, {
					root: process.cwd()
				});

			});
		}

	}

	//Start server
	var server = app.listen(args.port, function () {
		var host = server.address().address;
		var port = server.address().port;

		logger.info('Server listening at http://%s:%s', host, port);
	});

};

var initSkeleton = function(){

	//Get setup
	var opts = {};

	opts.title       = readlineSync.question('Title: ');
	opts.description = readlineSync.question('Description: ');
	opts.keywords    = readlineSync.question('Keywords: ');
	opts.author 	 = readlineSync.question('Author: ');
	opts.github 	 = readlineSync.question('GitHub URL: ');

	//Create dir
	if(!fs.existsSync(args.directory[0])){
		logger.debug("Creating project directory", args.directory[0]);
		fs.mkdirSync(args.directory[0]);
	}

	if(!fs.existsSync(args.directory[0] + "/media")){
		logger.debug("Creating media directory", args.directory[0] + "/media");
		fs.mkdirSync(args.directory[0] + "/media");
	}

	//Copy
	logger.info("Copying doc skeleton to '%s'...", args.directory[0]);

	Utils.copyDir(__dirname + "/../skeleton", args.directory[0]);
	Utils.copyDir(__dirname + "/../doc/media", args.directory[0] + "/media");
	Utils.copyDir(__dirname + "/../doc/pages/01_Writers_Guide", args.directory[0] + "/pages/01_Writers_Guide");
	Utils.copyDir(__dirname + "/../doc/pages/02_Usage", args.directory[0] + "/pages/02_Usage");
	Utils.copyDir(__dirname + "/../doc/pages/03_API_Reference", args.directory[0] + "/pages/03_API_Reference");

	//Create config
	var cfgval = function(val, def){ return ( val !== "" ? val : def ); };

	var config = {
		title: cfgval(opts.title, "My Documentation"),
		header_title: cfgval(opts.title, "My Documentation"),
		meta: {
			description: 	cfgval(opts.description, 	"Description of my new documentation.")
		},
		menu: [
			{
				"label": "Support",
				"link": "{{base}}/meta/#01_Support"
			},
			{
				"label": "META Doc on GitHub",
				"link": "https://github.com/metaplatform/meta-doc",
				"target": "_blank"
			}
		],
		footer_links: [
			{
				"label": "Privacy Policy",
				"link": "{{base}}/meta/#02_Privacy_policy"
			},
			{
				"label": "Report an issue",
				"link": "https://github.com/metaplatform/meta-doc/issues",
				"target": "_blank"
			}
		]
	};

	if(opts.keywords !== "")
		config.meta.keywords = opts.keywords;

	if(opts.author !== "")
		config.meta.author = opts.author;

	if(opts.github !== "")
		config.header_github = opts.github;

	//Write config
	logger.info("Writing config...");

	var configContent = JSON.stringify(config, null, 4);
	fs.writeFileSync(args.directory[0] + "/config.json", configContent, { encoding: 'utf-8' });

	logger.info("Done.");

};

setup();