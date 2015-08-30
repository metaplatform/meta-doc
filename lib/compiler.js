/*
 * META Doc
 * Documentation generator
 *
 * @author META Platform <www.meta-platform.com>
 * @license See LICENSE file distributed with this source code
 */

var fs = require("fs");
var mkdir = require("mkdir-p");
var MarkdownIt = require('markdown-it');
var jade = require("jade");

/**
 * Compiler constructor
 *
 * @param Object options
 */
var Compiler = function(options, pagesTree, config){

	if(!options) options = {};

	this.mediaPath = options.mediaPath || "media";
	this.assetsPath = options.assetsPath || "assets";
	this.outputDir = options.outputDir || "compile";
	this.templateDir = options.templateDir || "template";

	this.pagesTree = pagesTree || [];
	this.config = config || {};

	if(!this.config.template)
		this.config.template = "default";

};

/**
 * Shortcodes
 */
Compiler.shortcodes = require('meta-shortcodes')({
	openPattern: '\\[\\[',
	closePattern: '\\]\\]'
});
Compiler.helpers = [];

/**
 * Compile page
 *
 * @param Object page
 */
Compiler.prototype.compile = function(page){

	//Get local config
	var localConfig = {};

	//Merge global config
	for(var gi in this.config)
		localConfig[gi] = this.config[gi];

	//Merge page config
	if(fs.existsSync(page.path + "/config.json")){
		var pageConfigContent = fs.readFileSync(page.path + "/config.json", { encoding: 'utf-8' });
		pageConfig = JSON.parse(pageConfigContent);

		for(var li in pageConfig)
			localConfig[li] = pageConfig[li];
	}

	//Setup template instance
	var templateInstance = jade.compileFile(this.templateDir + "/" + localConfig.template + ".jade", {
		filename: this.templateDir + "/" + localConfig.template + ".jade",
		pretty: true
	});

	//Declare locals
	var locals = {
		config: localConfig,
		nav: this.pagesTree,
		page: page,
		sections: {},
		sidecode: false
	};

	//Set relative link
	var pathParts = page.id.split("/");
	var relativePath = ".";
	
	for(var i = 0; i < pathParts.length - 2; i++)
		relativePath = relativePath + "/..";

	//Setup compiler
	var md = new MarkdownIt();

	for(var h in Compiler.helpers)
		md.use.apply(md, Compiler.helpers[h]);

	//Check for current page excerpt
	if(page.excerpt){

		var pageExcerptHtml = null;

		if(page.excerpt && page.excerpt.match(/\.md$/)){
			
			excerptContents = fs.readFileSync(page.excerpt, { encoding: 'utf-8' });
			pageExcerptHtml = md.render(excerptContents);

		} else if(page.excerpt){

			pageExcerptHtml = fs.readFileSync(page.excerpt, { encoding: 'utf-8' });

		}

		page.excerptHtml = pageExcerptHtml;

	}

	//Compile page
	for(var p in page.sections){

		var section = page.sections[p];

		if(section.type == "page"){

			var excerptHtml = null;

			if(section.excerpt && section.excerpt.match(/\.md$/)){
				
				excerptContents = fs.readFileSync(section.excerpt, { encoding: 'utf-8' });
				excerptHtml = md.render(excerptContents);

			} else if(section.excerpt){

				excerptHtml = fs.readFileSync(section.excerpt, { encoding: 'utf-8' });

			}

			if(excerptHtml && excerptHtml.match(/class=".*sidecode.*"/))
				locals.sidecode = true;

			locals.sections[section.id] = section;
			locals.sections[section.id].excerptHtml = excerptHtml;

		} else {

			var pageHtml = null;

			if(section.path.match(/\.md$/)){
				
				pageContents = fs.readFileSync(section.path, { encoding: 'utf-8' });
				pageHtml = md.render(pageContents);

			} else {

				pageHtml = fs.readFileSync(section.path, { encoding: 'utf-8' });

			}

			if(pageHtml.match(/class=".*sidecode.*"/))
				locals.sidecode = true;

			locals.sections[section.id] = section;
			locals.sections[section.id].html = pageHtml;

		}

	}

	//Compile template
	var html = templateInstance(locals);

	//Replace shortcodes
	html = Compiler.shortcodes.parse(html);

	//Replace links
	html = html.replace(/(\{\{assets\}\}|\$assets\$)/g, relativePath + "/" + this.assetsPath);
	html = html.replace(/(\{\{media\}\}|\$media\$)/g, relativePath + "/" + this.mediaPath);
	html = html.replace(/(\{\{base\}\}|\$base\$)/g, relativePath);

	//Save
	var targetDir = this.outputDir + page.id;

	if(!fs.existsSync(targetDir))
		mkdir.sync(targetDir);

	fs.writeFileSync(targetDir + "/index.html", html);

};

//Export
module.exports = Compiler;