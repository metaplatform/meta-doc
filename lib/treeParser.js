/*
 * META Doc
 * Documentation generator
 *
 * @author META Platform <www.meta-platform.com>
 * @license See LICENSE file distributed with this source code
 */

var fs = require("fs");
var crypto = require("crypto");
var logger = require("meta-logger");

/**
 * Parse constructor
 *
 * @param string dir
 */
var TreeParser = function(dir){

	this.dir   = dir;
	this.files = {};
	this.root  = {
		type: "page",
		parent: null,
		id: "/",
		anchor: "",
		icon: null,
		name: "$",
		path: dir,
		label: "Root",
		excerpt: null,
		sections: [],
		hidden: false
	};

	this.structureHashHandle = crypto.createHash("md5");
	this.structureHash = null;

	this.parse(dir);

};

/**
 * Converts filename into label
 *
 * @param string name
 * @return string
 */
TreeParser.prototype.getLabel = function(name){

	return name.replace(/^[0-9]+_/g, "").replace(/_/g, " ").replace(/\.[a-zA-Z]+$/, "");

};

/**
 * Converts filename into ID
 *
 * @param string name
 * @return string
 */
TreeParser.prototype.getId = function(name){

	return name.replace(/^[0-9]+_/g, "").replace(/_/g, "-").trim().toLowerCase();

};

/**
 * Converts filename into anchor
 *
 * @param string name
 * @return string
 */
TreeParser.prototype.getAnchor = function(name){

	return name.replace(/\.[a-zA-Z]+$/, "");

};

/**
 * Parse tree
 */
TreeParser.prototype.parse = function(){

	var self = this;

	var parseDir = function(dirname, parent){

		var files = fs.readdirSync(dirname);

		for(var i in files){

			var stats = fs.statSync(dirname + "/" + files[i]);

			if(stats.isDirectory()){
				
				var page = {
					type: "page",
					parent: parent,
					id: parent.id + self.getId(files[i]) + "/",
					anchor: self.getAnchor(files[i]),
					icon: null,
					name: files[i],
					path: dirname + "/" + files[i],
					label: self.getLabel(files[i]),
					excerpt: null,
					sections: [],
					hidden: false
				};

				//Add page
				parent.sections.push(page);

				parseDir(dirname + "/" + files[i], page);

				self.structureHashHandle.update(files[i] + "/");

			} else if(files[i].match(/\.(md|html)$/)) {
				
				self.files[ dirname + "/" + files[i] ] = stats.mtime.getTime();

				if(files[i] == "_excerpt.md" || files[i] == "_excerpt.html"){

					parent.excerpt = dirname + "/" + files[i];

				} else if(files[i].substr(0, 1) !== "_"){

					var section = {
						type: "section",
						parent: parent,
						id: parent.id + self.getId(files[i]),
						anchor: self.getAnchor(files[i]),
						name: files[i],
						path: dirname + "/" + files[i],
						label: self.getLabel(files[i])
					};

					parent.sections.push(section);

					self.structureHashHandle.update(files[i] + ";");

				}

			} else if(files[i] == "config.json") {

				self.files[ dirname + "/" + files[i] ] = stats.mtime.getTime();

				var configSrc = fs.readFileSync(dirname + "/" + files[i], { encoding: 'utf-8' });
				var config = {};

				try {
					config = JSON.parse(configSrc);
				} catch (e) {
					logger.warn("Invalid page config:", dirname + "/" + files[i]);
				}

				//Icon
				if(config.icon) parent.icon = config.icon;

				//Slug and hidden only if not root node
				if(parent.parent){
					if(config.hidden) parent.hidden = true;
					if(config.slug) parent.id = parent.parent.id + config.slug + "/";
				}

				//Update hash
				self.structureHashHandle.update(parent.icon + parent.hidden + parent.id + "#");

			}

		}

		parent.sections.sort(function(a, b){
			return ( a.name > b.name ? 1 : a.name < b.name ? -1 : 0 );
		});

	};

	parseDir(this.dir, this.root);

	this.structureHash = this.structureHashHandle.digest("hex");

	return this;

};

/**
 * Save cache to file
 *
 * @return Object
 */
TreeParser.prototype.getCache = function(){

	var cacheData = {
		hash: this.structureHash,
		files: {}
	};

	for(var f in this.files)
		cacheData.files[f] = this.files[f];

	return cacheData;

};

/**
 * Returns pages which differs from cache
 *
 * @param Object cache (optional)
 * @return Array
 */
TreeParser.prototype.getChangedPages = function(cache){

	var changedFiles = [];
	var changedPages = {};

	var specialFiles = [ "_excerpt.md", "_excerpt.html", "config.json" ];

	if(cache && cache.hash != this.structureHash)
		cache = null;

	for(var i in this.files)
		if(!cache || !cache.files[i] || cache.files[i] < this.files[i])
			changedFiles.push(i);

	var checkPages = function(page){

		for(var f in specialFiles){
			if(changedFiles.indexOf(page.path + "/" + specialFiles[f]) >= 0)
				changedPages[page.id] = page;
		}

		for(var i in page.sections){

			if(page.sections[i].type == "page"){

				checkPages(page.sections[i]);

			} else {

				if(changedFiles.indexOf(page.sections[i].path) >= 0)
					changedPages[page.id] = page;

			}

		}

	};

	checkPages(this.root);

	return changedPages;

};

//Export
module.exports = TreeParser;