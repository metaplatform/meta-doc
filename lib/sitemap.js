/*
 * META Doc
 * Documentation generator
 *
 * @author META Platform <www.meta-platform.com>
 * @license See LICENSE file distributed with this source code
 */

var fs = require("fs");
var logger = require("meta-logger");

/**
 * Rewrite compiler constructor
 *
 * @param Object options
 */
var SitemapCompiler = function(options, pagesTree, config){

	if(!options) options = {};

	//Check config
	if(config.sitemap){

		if(!config.sitemap.base_url)
			throw new Error("Sitemap config must specify base_url property.");

		this.baseUrl = config.sitemap.base_url;
		this.outputPath = config.sitemap.output_path || "/sitemap.xml";
		this.exclude = config.sitemap.exclude;

	}

	this.outputDir = options.outputDir || "compile";
	this.config = config || {};

	this.cache = {};

};

/**
 * Compile rewrite rules
 *
 * @param array pages
 */
SitemapCompiler.prototype.compile = function(changes){

	if(!this.config.sitemap)
		return;

	logger.info("Generating sitemap ...");

	//Merge changes to cache
	for(var i in changes.pages)
		if(changes.pages[i].type == 'page')
			this.cache[ changes.pages[i].id ] = changes.pages[i].path;

	//Check if files exists
	for(var j in this.cache)
		if(!fs.existsSync(this.cache[j]))
			delete this.cache[j];

	//Generate sitemap
	var output = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

	for(var k in this.cache){

		if(this.exclude.indexOf(k) < 0)
  			output+= '<url><loc>' + this.baseUrl + k + '</loc></url>';

	}

	output+= '</urlset>';

	logger.info("Saving sitemap to '" + this.outputDir + this.outputPath + "' ...");

	fs.writeFileSync(this.outputDir + this.outputPath, output, { encoding: 'utf-8' });


};

//Export
module.exports = SitemapCompiler;