/*
 * META Doc
 * Documentation generator
 *
 * @author META Platform <www.meta-platform.com>
 * @license See LICENSE file distributed with this source code
 */

//Dependencies
var fs = require("fs");
var watch = require('node-watch');
var logger = require("meta-logger");

var EventEmitter = require('events').EventEmitter;

var TreeParser = require("./lib/treeParser.js");
var Compiler = require("./lib/compiler.js");
var Rewrite = require("./lib/rewrite.js");
var Utils = require("./lib/utils.js");

/**
 * Constructor
 */
var MetaDoc = function(options){

	if(!options) options = {};

	this.dirMedia = options.media || "./media";
	this.dirPages = options.pages || "./pages";
	this.dirSite = options.site || "./site";
	this.dirTemplate = options.template || "./template";
	this.dirAssets = options.assets || "./template/assets";
	this.configFile = options.config || "./config.json";
	this.cacheFile = options.cache || "./cache.json";

	this.config = {};
	this.compilers = [];

	//Validate configuration
	logger.info("Media dir:      ", this.dirMedia);
	logger.info("Pages dir:      ", this.dirPages);
	logger.info("Site output dir:", this.dirSite);
	logger.info("Template:       ", this.dirTemplate);
	logger.info("Asssets dir:    ", this.dirAssets);
	logger.info("Config:         ", this.configFile);

	//Validate setup
	if(!fs.existsSync(this.dirMedia))
		throw new Error("Media directory not found.");

	if(!fs.existsSync(this.dirPages))
		throw new Error("Pages directory not found.");

	if(!fs.existsSync(this.dirSite))
		throw new Error("Site output directory not found.");

	if(!fs.existsSync(this.dirTemplate + "/default.jade"))
		throw new Error("Default template file not found.");

	if(!fs.existsSync(this.dirAssets))
		throw new Error("Assets directory not found.");

	if(!fs.existsSync(this.configFile))
		throw new Error("Config file not found.");

	//Register default compiler
	this.useCompiler(Compiler);
	this.useCompiler(Rewrite);

	//Copy assets
	this.loadConfig();

};

MetaDoc.prototype = Object.create(EventEmitter.prototype);

/**
 * Loads config from JSON
 */
MetaDoc.prototype.loadConfig = function(){

	var configContents = fs.readFileSync(this.configFile);

	try {
		this.config = JSON.parse(configContents);
	} catch(e){
		return this.emit("error", new Error("Configuration file is not valid JSON."));
	}

};

/**
 * Loads cache from file if exists
 *
 * @return Object|null
 */
MetaDoc.prototype.getCache = function(){

	if(!fs.existsSync(this.cacheFile))
		return null;

	var cacheContents = fs.readFileSync(this.cacheFile);

	return JSON.parse(cacheContents);

};

/**
 * Save cache to file
 *
 * @param Object cache
 */
MetaDoc.prototype.saveCache = function(cache){

	fs.writeFileSync(this.cacheFile, JSON.stringify(cache));

};

/**
 * Copy modified media to target directory
 */
MetaDoc.prototype.copyMedia = function(){

	logger.info("Copying media...");

	try {
		Utils.copyDir(this.dirMedia, this.dirSite + "/media");
	} catch(e) {
		this.emit("error", e);
	}
 
	return this;

};

/**
 * Copy modified assets to target directory
 */
MetaDoc.prototype.copyAssets = function(){

	logger.info("Copying assets...");

	try {
		Utils.copyDir(this.dirAssets, this.dirSite + "/assets");
	} catch(e) {
		this.emit("error", e);
	}
 
	return this;

};

/**
 * Remove all files from site directory
 */
MetaDoc.prototype.cleanSite = function(){

	logger.info("Cleaning site directory...");

	Utils.cleanDir(this.dirSite);

	return this;

};

/**
 * Registers default compiler shortcode
 *
 * @param string name
 * @param Function cb
 */
MetaDoc.prototype.addShortcode = function(name, cb){

	Compiler.shortcodes.add(name, cb);

	return this;

};

/**
 * Registers default compiler helper
 *
 * @param Array args
 */
MetaDoc.prototype.addHelper = function(args){

	Compiler.helpers.push(args);

	return this;

};

/**
 * Registers another compiler
 *
 * @param Array args
 */
MetaDoc.prototype.useCompiler = function(compiler){

	this.compilers.push(compiler);

};

/**
 * Registers built-in shortcodes
 */
MetaDoc.prototype.useDefaultShortcodes = function(){

	var Shortcodes = require("./lib/shortcodes.js");

	//Use base shortcodes
	for(var s in Shortcodes)
		this.addShortcode(s, Shortcodes[s]);

};

/**
 * Registers built-in helpers
 */
MetaDoc.prototype.useDefaultHelpers = function(){

	var Helpers = require("./lib/helpers.js");

	//Use base helpers
	for(var h in Helpers)
		this.addHelper(Helpers[h]);

};

/**
 * Compile documentation from pages to site
 *
 * @param boolean useCache
 */
MetaDoc.prototype.compile = function(useCache){
	
	var self = this;

	var countProperties = function(obj){
		var x = 0;
		for(var i in obj) x++;
		return x;
	};

	logger.info("Compiling...");

	try {

		//Generate pages tree
		logger.info("Parsing pages tree...");

		var tree = new TreeParser(self.dirPages);

		//Check cache
		var changes = tree.getChanges( useCache ? self.getCache() : null );

		logger.info("Pages to be compiled:", countProperties(changes.pages));

		var compilerOpts = {
			mediaPath: "media",
			assetsPath: "assets",
			pagesDir: this.dirPages,
			outputDir: this.dirSite,
			templateDir: this.dirTemplate,
			templateIndex: "index.jade"
		};

		//Setup compiler
		for(var c in this.compilers){

			var compilerConstructor = this.compilers[c];

			var compiler = new compilerConstructor(compilerOpts, tree.root, this.config);
			compiler.compile(changes);

		}

		//Save cache
		logger.debug("Saving cache...");
		this.saveCache(tree.getCache());

		logger.info("Done.");

	} catch(e) {

		return this.emit("error", e);

	}

	return this;

};

MetaDoc.prototype.watch = function(){

	var self = this;

	logger.info("Watching for changes...");

	watch(this.dirPages, function(filename){

		logger.info("File '%s' has changed.", filename);
		self.compile(true);

	});

	watch(this.dirAssets, function(filename){

		logger.info("File '%s' has changed, copying assets...", filename);
		self.copyAssets();

	});

	watch(this.dirTemplate, function(filename){

		logger.info("Template '%s' has changed, recompiling all...", filename);
		self.compile();

	});

	watch(this.configFile, function(filename){

		logger.info("Config has changed, recompiling all...");
		self.loadConfig();
		self.compile();

	});

	watch(this.dirMedia, function(filename){

		logger.info("File '%s' has changed, copying media...", filename);
		self.copyMedia();

	});

	return this;

};

//Export
module.exports = function(options){
	return new MetaDoc(options);
};