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
var RewriteCompiler = function(options, pagesTree, config){

	if(!options) options = {};

	this.pagesDir  = options.pagesDir || "pages";
	this.outputDir = options.outputDir || "compile";

	this.config = config || {};

	this.rewriteBase = this.config.rewrite_base || "/";
	this.rules = config.rewrite || {};

	//Has 404 page?
	if(fs.existsSync(this.pagesDir + "/_404"))
		this.rules.__404 = "404/index.html";

};

/**
 * Compile rewrite rules
 *
 * @param array pages
 */
RewriteCompiler.prototype.compile = function(changes){

	logger.info("Generating rewrite.json ...");
	fs.writeFileSync(this.outputDir + "/rewrite.json", JSON.stringify(this.rules), { encoding: 'utf-8' });

	logger.info("Generating .htaccess ...");

	var htRules = [ "<ifModule mod_rewrite.c>", "RewriteEngine on", "RewriteBase " + this.rewriteBase ];

	for(var pattern in this.rules){

		if(pattern === "__404"){
			htRules.push('ErrorDocument 404 ' + this.rewriteBase + "/" + this.rules[pattern]);
		} else {
			htRules.push('RewriteRule "' + pattern + '" "' + this.rules[pattern] + '" [L,R=301,NC]');
		}

	}

	htRules.push("</IfModule>");

	fs.writeFileSync(this.outputDir + "/.htaccess", htRules.join("\n"), { encoding: 'utf-8' });

};

//Export
module.exports = RewriteCompiler;