/*
 * META Doc
 * Documentation generator
 *
 * @author META Platform <www.meta-platform.com>
 * @license MIT
 */

//Dependencies
var fs = require("fs");
var cp = require("cp");
var watch = require('node-watch');
var logger = require("meta-logger");

var EventEmitter = require('events').EventEmitter;

var TreeParser = require("./lib/treeParser.js");
var Compiler = require("./lib/compiler.js");

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
 * Copy directory
 *
 * @param string srcDir
 * @param string dstDir
 */
MetaDoc.prototype.copyDir = function(srcDir, dstDir){

	if(!fs.existsSync(dstDir)){
		logger.debug("Creating directory", dstDir);
		fs.mkdirSync(dstDir);
	}

	var files = fs.readdirSync(srcDir);

	for(var i in files){

		var stats = fs.statSync(srcDir + "/" + files[i]);

		if(stats.isDirectory()){

			this.copyDir(srcDir + "/" + files[i], dstDir + "/" + files[i]);

		} else {

			if(fs.existsSync(dstDir + "/" + files[i])){

				var dstStats = fs.statSync(dstDir + "/" + files[i]);

				if(dstStats.mtime.getTime() >= stats.mtime.getTime())
					continue;

			}

			logger.debug("Copying '%s' to '%s' ...", srcDir + "/" + files[i], dstDir + "/" + files[i]);
			cp.sync(srcDir + "/" + files[i], dstDir + "/" + files[i]);

		}

	}

};

/**
 * Clean directory and optionaly remove itself
 *
 * @param string dir
 * @param bool removeDir
 */
MetaDoc.prototype.cleanDir = function(dir, removeDir){

	if(!fs.existsSync(dir))
		return false;

	var files = fs.readdirSync(dir);

	for(var i in files){

		var stats = fs.statSync(dir + "/" + files[i]);

		if(stats.isDirectory()){

			this.cleanDir(dir + "/" + files[i], true);

		} else {

			logger.debug("Removing file '%s' ...", dir + "/" + files[i]);
			fs.unlinkSync(dir + "/" + files[i]);

		}

	}

	if(removeDir){
		logger.debug("Removing directory '%s' ...", dir);
		fs.rmdirSync(dir);
	}

};

/**
 * Copy modified media to target directory
 */
MetaDoc.prototype.copyMedia = function(){

	logger.info("Copying media...");

	try {
		this.copyDir(this.dirMedia, this.dirSite + "/media");
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
		this.copyDir(this.dirAssets, this.dirSite + "/assets");
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

	this.cleanDir(this.dirSite);

	return this;

};

/**
 * Registers compiler shortcode
 *
 * @param string name
 * @param Function cb
 */
MetaDoc.prototype.shortcode = function(name, cb){

	Compiler.shortcodes[name] = cb;

	return this;

};

/**
 * Registers compiler helper
 *
 * @param Array args
 */
MetaDoc.prototype.helper = function(args){

	Compiler.helpers.push(args);

	return this;

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
		var compileList = tree.getChangedPages( useCache ? self.getCache() : null );

		logger.info("Pages to be compiled:", countProperties(compileList));

		//Setup compiler
		var compiler = new Compiler({
			mediaPath: "media",
			assetsPath: "assets",
			outputDir: this.dirSite,
			templateDir: this.dirTemplate,
			templateIndex: "index.jade"
		}, tree.root, this.config);

		//Compile changed files
		for(var i in compileList){
			logger.info("Compiling '%s'...", i);
			compiler.compile(compileList[i]);
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