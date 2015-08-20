/*
 * META Doc
 * Documentation generator
 *
 * @author META Platform <www.meta-platform.com>
 * @license MIT
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
	this.templateindex = options.tempalteindex || "index.jade";

	this.pagesTree = pagesTree;
	this.config = config;

	if(!this.config.template)
		this.config.template = "default";

	this.shortcodes = {};

};

/**
 * Shortcodes
 */
Compiler.shortcodes = {};
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
			locals.sections[section.id].excerpt = excerptHtml;

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

	//Raplace shortcodes
	var replaces = [];

	for(var s in Compiler.shortcodes){

		var end = 0;
		var offset = s.length + 3;

		while(true){

			var start = html.indexOf("[[" + s, end);
			end = html.indexOf("]]", start);

			if(start < 0 || end < 0) break;

			var outer = html.substr(start, end - start + 2);
			var contents = html.substr(start + offset, end - start - offset);

			replaces.push([outer, Compiler.shortcodes[s](contents, outer)]);

		}

	}

	for(var r in replaces){
		html = html.replace(replaces[r][0], replaces[r][1]);
	}

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