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

	this.assetsPath = options.assetsPath || "assets";
	this.outputDir = options.outputDir || "compile";
	this.templateDir = options.templateDir || "template";
	this.templateindex = options.tempalteindex || "index.jade";

	this.pagesTree = pagesTree;
	this.config = config;

	this.shortcodes = {};

	this.template = jade.compileFile(this.templateDir + "/" + this.templateindex, {
		filename: this.templateDir + "/" + this.templateindex,
		pretty: true
	});

};

/**
 * Shortcodes
 */
Compiler.shortcodes = {};

/**
 * Compile page
 *
 * @param Object page
 */
Compiler.prototype.compile = function(page){

	//Declare locals
	var locals = {
		config: this.config,
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

	md.use(require('markdown-it-attrs'));
	md.use(require('markdown-it-highlightjs'));

	var messageConfig = function(classname, icon){

		return {
			render: function(tokens, idx, _options, env, self){

				var prefix = "";

			    // add a class to the opening tag
			    if (tokens[idx].nesting === 1) {
			    	
			    	tokens[idx].attrPush([ 'class', "message " + classname]);

			    	return self.renderToken(tokens, idx, _options, env, self) + '<i class="mdi mdi-' + icon + '"></i>';

			    }

			    return self.renderToken(tokens, idx, _options, env, self);

			}
		};

	};

 	md.use(require('markdown-it-container'), "sidecode");
 	md.use(require('markdown-it-container'), "message");
 	md.use(require('markdown-it-container'), "info", messageConfig("info", "information"));
 	md.use(require('markdown-it-container'), "warning", messageConfig("warn", "alert-circle"));
 	md.use(require('markdown-it-container'), "alert", messageConfig("alert", "alert"));
 	md.use(require('markdown-it-container'), "success", messageConfig("success", "checkbox-marked-circle"));
 	md.use(require('markdown-it-container'), "clear");

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

			locals.sections[section.id] = {
				type: section.type,
				id: section.id,
				anchor: section.anchor,
				name: section.name,
				label: section.label,
				excerpt: excerptHtml
			};

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

			locals.sections[section.id] = {
				type: section.type,
				id: section.id,
				anchor: section.anchor,
				name: section.name,
				label: section.label,
				html: pageHtml
			};

		}

	}

	//Compile template
	var html = this.template(locals);

	//Raplace shortcodes
	var replaces = [];

	for(var s in Compiler.shortcodes){

		var end = 0;
		var offset = s.length + 3;

		while(true){

			var start = html.indexOf("[[", end);
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
	html = html.replace(/\{\{assets\}\}/g, relativePath + "/" + this.assetsPath);
	html = html.replace(/\{\{base\}\}/g, relativePath);

	//Save
	var targetDir = this.outputDir + page.id;

	if(!fs.existsSync(targetDir))
		mkdir.sync(targetDir);

	fs.writeFileSync(targetDir + "/index.html", html);

};

//Export
module.exports = Compiler;