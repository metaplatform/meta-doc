/*
 * META Doc
 * Documentation generator
 *
 * @author META Platform <www.meta-platform.com>
 * @license See LICENSE file distributed with this source code
 */

var should = require("should");
var rmdirRecursive = require('rmdir-recursive').sync;
var cheerio = require("cheerio");
var fs = require("fs");

var TreeParser = require(__dirname + "/../../lib/treeParser.js");
var Compiler = require(__dirname + "/../../lib/compiler.js");

describe("Compiler", function(){

	describe("#constructor", function(){

		it("should construct with default options", function(){

			var compiler = new Compiler();

			compiler.mediaPath.should.eql("media");
			compiler.assetsPath.should.eql("assets");
			compiler.outputDir.should.eql("compile");
			compiler.templateDir.should.eql("template");
			compiler.config.template.should.eql("default");

		});

		it("should accept options", function(){

			var compiler = new Compiler({
				mediaPath: "/media",
				assetsPath: "/assets",
				outputDir: "/output",
				templateDir: "/tpl"
			}, null, {
				template: "index",
				custom: "value"
			});

			compiler.mediaPath.should.eql("/media");
			compiler.assetsPath.should.eql("/assets");
			compiler.outputDir.should.eql("/output");
			compiler.templateDir.should.eql("/tpl");
			compiler.config.should.eql({
				template: "index",
				custom: "value"
			});			

		});

	});

	describe("#compile", function(){

		beforeEach(function(){
			rmdirRecursive(__dirname + "/../sample-doc/site");
			fs.mkdirSync(__dirname + "/../sample-doc/site");
		});

		context("root with default template", function(){

			var tree = new TreeParser(__dirname + "/../sample-doc/pages");

			var compiler = new Compiler({
				mediaPath: "__media__",
				assetsPath: "__assets__",
				outputDir: __dirname + "/../sample-doc/site",
				templateDir: __dirname + "/../sample-doc/template"
			}, tree.root, {
				global: "global-value"
			});

			Compiler.shortcodes.add("shortcode", function(opts, content){ return content + ":" + opts[0] + ":" + opts.y; });
			Compiler.helpers.push([ require('markdown-it-attrs') ]);

			compiler.compile({ pages: [tree.root] });

			if(!fs.existsSync(__dirname + "/../sample-doc/site/index.html"))
				throw new Error("Page not compiled!");

			var htmlContents = fs.readFileSync(__dirname + "/../sample-doc/site/index.html", { encoding: 'utf-8' });

			var dom = cheerio.load(htmlContents);

			it("should pass sections to template with excerpts", function(){

				dom("#001_Root_section .label").text().should.eql("Root section");
				dom("#002_Root_section .label").text().should.eql("Root section");
				dom("#003_Root_page .label").text().should.eql("Root page");
				dom("#003_Root_page .excerpt").text().should.not.eql("");
				dom("#004_Root_page_2 .label").text().should.eql("Root page 2");
				dom("#004_Root_page_2 .excerpt").text().should.not.eql("");

			});

			it("should pass nav to template", function(){
				dom("#nav").text().should.eql("$");
			});

			it("should pass global config to template", function(){
				dom("#config-global").text().should.eql("global-value");
			});

			it("should pass local config to template", function(){
				dom("#config-local").text().should.eql("local-value");
			});

			it("should pass page instance to template", function(){
				dom("#page-name").text().should.eql("$");
			});

			it("should render page excerpt", function(){
				dom("#page-excerpt").text().should.not.eql("");
			});

			it("should pass sidecode value to template", function(){
				dom("#page-sidecode").text().should.eql("true");
			});

			it("should rewrite base path", function(){
				dom("#base-path-a").text().should.eql(".");
				dom("#base-path-b").text().should.eql(".");
			});

			it("should rewrite media path", function(){
				dom("#media-path-a").text().should.eql("./__media__");
				dom("#media-path-b").text().should.eql("./__media__");
			});

			it("should rewrite assets path", function(){
				dom("#assets-path-a").text().should.eql("./__assets__");
				dom("#assets-path-b").text().should.eql("./__assets__");
			});

			it("should render shortcodes", function(){
				dom("#shortcode").text().should.eql("TRUE:X:Y");
			});

			it("should use helpers", function(){
				dom(".helper").text().should.not.eql("");
			});

		});

		context("child page with default template and custom slug", function(){

			var tree = new TreeParser(__dirname + "/../sample-doc/pages");

			var compiler = new Compiler({
				mediaPath: "__media__",
				assetsPath: "__assets__",
				outputDir: __dirname + "/../sample-doc/site",
				templateDir: __dirname + "/../sample-doc/template"
			}, tree.root, {
				global: "global-value"
			});

			compiler.compile({ pages: [tree.root.sections[2]] });

			if(!fs.existsSync(__dirname + "/../sample-doc/site/sub-page/index.html"))
				throw new Error("Page not compiled!");

			var htmlContents = fs.readFileSync(__dirname + "/../sample-doc/site/sub-page/index.html", { encoding: 'utf-8' });

			var dom = cheerio.load(htmlContents);

			it("should pass sections to template", function(){

				dom("#Subpage .label").text().should.eql("Subpage");

			});

			it("should pass nav to template", function(){
				dom("#nav").text().should.eql("$");
			});

			it("should pass global config to template", function(){
				dom("#config-global").text().should.eql("global-value");
			});

			it("should pass local config to template", function(){
				dom("#config-local").text().should.eql("");
			});

			it("should pass page instance to template", function(){
				dom("#page-name").text().should.eql("003_Root_page");
			});

			it("should pass sidecode value to template", function(){
				dom("#page-sidecode").text().should.eql("true");
			});

			it("should rewrite base path", function(){
				dom("#base-path-a").text().should.eql("./..");
				dom("#base-path-b").text().should.eql("./..");
			});

			it("should rewrite media path", function(){
				dom("#media-path-a").text().should.eql("./../__media__");
				dom("#media-path-b").text().should.eql("./../__media__");
			});

			it("should rewrite assets path", function(){
				dom("#assets-path-a").text().should.eql("./../__assets__");
				dom("#assets-path-b").text().should.eql("./../__assets__");
			});

		});

		context("child page with custom template", function(){

			var tree = new TreeParser(__dirname + "/../sample-doc/pages");

			var compiler = new Compiler({
				mediaPath: "__media__",
				assetsPath: "__assets__",
				outputDir: __dirname + "/../sample-doc/site",
				templateDir: __dirname + "/../sample-doc/template"
			}, tree.root, {
				global: "global-value"
			});

			compiler.compile({ pages: [tree.root.sections[3]] });

			if(!fs.existsSync(__dirname + "/../sample-doc/site/root-page-2/index.html"))
				throw new Error("Page not compiled!");

			var htmlContents = fs.readFileSync(__dirname + "/../sample-doc/site/root-page-2/index.html", { encoding: 'utf-8' });

			var dom = cheerio.load(htmlContents);

			it("should render custom template", function(){
				dom("#custom").text().should.eql("TRUE");
			});

		});

	});

});