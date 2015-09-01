/*
 * META Doc
 * Documentation generator
 *
 * @author META Platform <www.meta-platform.com>
 * @license See LICENSE file distributed with this source code
 */

var should = require("should");
var mockFs = require("mock-fs");
var fs = require("fs");

var TreeParser = require(__dirname + "/../../lib/treeParser.js");

describe("Tree parser", function(){

	var cdate = new Date(new Date().getTime() - 60);

	var fsMockTree = {
		
		"/test-tree": {
			"config.json": 				mockFs.file({ content: '{ "icon": "root", "hidden": true, "slug": "root" }', atime: cdate, ctime: cdate, mtime: cdate }),
			"_excerpt.md": 				mockFs.file({ content: "MD root excerpt", atime: cdate, ctime: cdate, mtime: cdate }),
			"_excerpt.html": 			mockFs.file({ content: "HTML root excerpt", atime: cdate, ctime: cdate, mtime: cdate }),

			"001_Root_section.md": 		mockFs.file({ content: "Sample contents", atime: cdate, ctime: cdate, mtime: cdate }),
			"002_Root_section.html": 	mockFs.file({ content: "Sample contents", atime: cdate, ctime: cdate, mtime: cdate }),
			"003_Root_page": {

				"config.json": 			mockFs.file({ content: '{ "icon": "page", "hidden": true }', atime: cdate, ctime: cdate, mtime: cdate }),
				"_excerpt.html": 		mockFs.file({ content: "HTML page excerpt", atime: cdate, ctime: cdate, mtime: cdate }),

				"001_Page_section.md": 	mockFs.file({ content: "Sample contents", atime: cdate, ctime: cdate, mtime: cdate }),
				"002_Page_Subpage": {

					"config.json": 		mockFs.file({ content: '{ "icon": "subpage", "hidden": true, "slug": "sub-page" }', atime: cdate, ctime: cdate, mtime: cdate }),
					"A_Section.md": 	mockFs.file({ content: "Sample contents", atime: cdate, ctime: cdate, mtime: cdate }),
					"B_Section.html": 	mockFs.file({ content: "Sample contents", atime: cdate, ctime: cdate, mtime: cdate })

				},

				"003_Page_section.html": mockFs.file({ content: "Sample contents", atime: cdate, ctime: cdate, mtime: cdate })

			},

			"Invalid_dir": {
				"config.json": mockFs.file({ content: "Some invalid data", atime: cdate, ctime: cdate, mtime: cdate })
			}

		}

	};

	mockFs(fsMockTree);

	var parser = new TreeParser("/test-tree");

	describe("#constructor", function(){

		it("should create root node", function(){

			should.exist(parser.root);

		});

	});

	describe("#getLabel", function(){

		it("should replace number sequence at beginning", function(){

			parser.getLabel("001_Hello_label").should.not.startWith("001");

		});

		it("should replace underscore with space", function(){

			parser.getLabel("Hello_label").should.eql("Hello label");

		});

		it("should remove file extension", function(){

			parser.getLabel("Hello_label.md").should.not.endWith(".md");

		});

	});

	describe("#getId", function(){

		it("should replace number sequence at beginning", function(){

			parser.getId("001_Hello_label").should.not.startWith("001");

		});

		it("should replace underscore with dash and convert to lower case", function(){

			parser.getId("Hello_label").should.eql("hello-label");

		});

	});

	describe("#getAnchor", function(){

		it("should remove file extension", function(){

			parser.getAnchor("Hello_label.md").should.not.endWith(".md");

		});

	});

	describe("#parse", function(){

		context("node with invalid confix", function(){

			var node = parser.root.sections[3];

			it("should silently ignore invalid config", function(){
				should.not.exist(node.icon);
				node.hidden.should.eql(false);
				node.id.should.eql("/invalid-dir/");
			});

		});

		context("node at root level", function(){

			var node = parser.root;

			it("should parse child nodes and sort them ascending by name", function(){

				node.sections.should.has.lengthOf(4);

				node.sections[0].should.containEql({
					"type": "section",
					"name": "001_Root_section.md"
				});

				node.sections[1].should.containEql({
					"type": "section",
					"name": "002_Root_section.html"
				});

				node.sections[2].should.containEql({
					"type": "page",
					"name": "003_Root_page"
				});

				node.sections[3].should.containEql({
					"type": "page",
					"name": "Invalid_dir"
				});

			});

			it("should parse node icon from config", function(){
				node.icon.should.eql("root");
			});

			it("should NOT parse node hidden from config", function(){
				node.hidden.should.not.eql(true);
			});

			it("should NOT parse node slug from config", function(){
				node.id.should.eql("/");
			});

			it("should parse node excerpt", function(){
				node.excerpt.should.eql("/test-tree/_excerpt.md");
			});

		});

		context("section at root level", function(){

			var node = parser.root.sections[0];

			it("should has NO subsections", function(){
				should.not.exist(node.sections);
			});

			it("should has proper type", function(){
				node.type.should.eql("section");
			});

			it("should has proper parent", function(){
				node.parent.should.eql(parser.root);
			});

			it("should has proper id", function(){
				node.id.should.eql("/root-section.md");
			});

			it("should has proper anchor", function(){
				node.anchor.should.eql("001_Root_section");
			});

			it("should has proper name", function(){
				node.name.should.eql("001_Root_section.md");
			});

			it("should has proper path", function(){
				node.path.should.eql("/test-tree/001_Root_section.md");
			});

			it("should has proper label", function(){
				node.label.should.eql("Root section");
			});			

		});

		context("page without config", function(){

			var node = parser.root.sections[3];

			it("should has proper type", function(){
				node.type.should.eql("page");
			});

			it("should has proper parent", function(){
				node.parent.should.eql(parser.root);
			});

			it("should has proper anchor", function(){
				node.anchor.should.eql("Invalid_dir");
			});

			it("should has proper name", function(){
				node.name.should.eql("Invalid_dir");
			});

			it("should has proper path", function(){
				node.path.should.eql("/test-tree/Invalid_dir");
			});

			it("should has proper label", function(){
				node.label.should.eql("Invalid dir");
			});

			it("should NOT parse node icon", function(){
				should.not.exist(node.icon);
			});

			it("should NOT parse node hidden state from config", function(){
				node.hidden.should.eql(false);
			});

			it("should NOT parse slug from config", function(){
				node.id.should.eql("/invalid-dir/");
			});

		});

		context("page at page level 1", function(){

			var node = parser.root.sections[2];

			it("should has proper type", function(){
				node.type.should.eql("page");
			});

			it("should has proper parent", function(){
				node.parent.should.eql(parser.root);
			});

			it("should has proper id", function(){
				node.id.should.eql("/root-page/");
			});

			it("should has proper anchor", function(){
				node.anchor.should.eql("003_Root_page");
			});

			it("should has proper name", function(){
				node.name.should.eql("003_Root_page");
			});

			it("should has proper path", function(){
				node.path.should.eql("/test-tree/003_Root_page");
			});

			it("should has proper label", function(){
				node.label.should.eql("Root page");
			});

			it("should parse node icon from config", function(){
				node.icon.should.eql("page");
			});

			it("should parse node hidden from config", function(){
				node.hidden.should.eql(true);
			});

			it("should parse node excerpt", function(){
				node.excerpt.should.eql("/test-tree/003_Root_page/_excerpt.html");
			});

			it("should parse child nodes and sort them ascending by name", function(){

				node.sections.should.has.lengthOf(3);

				node.sections[0].should.containEql({
					"type": "section",
					"name": "001_Page_section.md"
				});

				node.sections[1].should.containEql({
					"type": "page",
					"name": "002_Page_Subpage"
				});

				node.sections[2].should.containEql({
					"type": "section",
					"name": "003_Page_section.html"
				});

			});

		});

		context("section at page level 1", function(){

			var node = parser.root.sections[2].sections[2];

			it("should has NO subsections", function(){
				should.not.exist(node.sections);
			});

			it("should has proper type", function(){
				node.type.should.eql("section");
			});

			it("should has proper parent", function(){
				node.parent.should.eql(parser.root.sections[2]);
			});

			it("should has proper id", function(){
				node.id.should.eql("/root-page/page-section.html");
			});

			it("should has proper anchor", function(){
				node.anchor.should.eql("003_Page_section");
			});

			it("should has proper name", function(){
				node.name.should.eql("003_Page_section.html");
			});

			it("should has proper path", function(){
				node.path.should.eql("/test-tree/003_Root_page/003_Page_section.html");
			});

			it("should has proper label", function(){
				node.label.should.eql("Page section");
			});			

		});

		context("page at page level 2", function(){

			var node = parser.root.sections[2].sections[1];

			it("should has proper type", function(){
				node.type.should.eql("page");
			});

			it("should has proper parent", function(){
				node.parent.should.eql(parser.root.sections[2]);
			});

			it("should has proper id", function(){
				node.id.should.eql("/root-page/sub-page/");
			});

			it("should has proper anchor", function(){
				node.anchor.should.eql("002_Page_Subpage");
			});

			it("should has proper name", function(){
				node.name.should.eql("002_Page_Subpage");
			});

			it("should has proper path", function(){
				node.path.should.eql("/test-tree/003_Root_page/002_Page_Subpage");
			});

			it("should has proper label", function(){
				node.label.should.eql("Page Subpage");
			});

			it("should parse node icon from config", function(){
				node.icon.should.eql("subpage");
			});

			it("should parse node hidden from config", function(){
				node.hidden.should.eql(true);
			});

			it("should parse node excerpt", function(){
				should.not.exist(node.excerpt);
			});

			it("should parse child nodes and sort them ascending by name", function(){

				node.sections.should.has.lengthOf(2);

				node.sections[0].should.containEql({
					"type": "section",
					"name": "A_Section.md"
				});

				node.sections[1].should.containEql({
					"type": "section",
					"name": "B_Section.html"
				});

			});

		});

		context("section at page level 2", function(){

			var node = parser.root.sections[2].sections[1].sections[0];

			it("should has NO subsections", function(){
				should.not.exist(node.sections);
			});

			it("should has proper type", function(){
				node.type.should.eql("section");
			});

			it("should has proper parent", function(){
				node.parent.should.eql(parser.root.sections[2].sections[1]);
			});

			it("should has proper id", function(){
				node.id.should.eql("/root-page/page-subpage/a-section.md");
			});

			it("should has proper anchor", function(){
				node.anchor.should.eql("A_Section");
			});

			it("should has proper name", function(){
				node.name.should.eql("A_Section.md");
			});

			it("should has proper path", function(){
				node.path.should.eql("/test-tree/003_Root_page/002_Page_Subpage/A_Section.md");
			});

			it("should has proper label", function(){
				node.label.should.eql("A Section");
			});			

		});

	});

	describe("#getCache", function(){

		var cacheData = parser.getCache();

		it("should return cache object with hash property", function(){

			cacheData.should.has.property("hash");

		});

		it("should return cache object with files object with its modification times as property values", function(){

			cacheData.should.has.property("files");

			cacheData.files.should.has.keys([
				'/test-tree/001_Root_section.md',
				'/test-tree/002_Root_section.html',
				'/test-tree/003_Root_page/001_Page_section.md',
				'/test-tree/003_Root_page/002_Page_Subpage/A_Section.md',
				'/test-tree/003_Root_page/002_Page_Subpage/B_Section.html',
				'/test-tree/003_Root_page/002_Page_Subpage/config.json',
				'/test-tree/003_Root_page/003_Page_section.html',
				'/test-tree/003_Root_page/_excerpt.html',
				'/test-tree/003_Root_page/config.json',
				'/test-tree/Invalid_dir/config.json',
				'/test-tree/_excerpt.html',
				'/test-tree/_excerpt.md',
				'/test-tree/config.json'
			]);

		});

	});

	describe("#getChanges", function(){

		it("should not return any changes if cache is same (eg. tree not modified)", function(){

			var cacheData = parser.getCache();
			var changes = parser.getChanges(cacheData);
			changes.pages.should.be.eql({});

		});

		context("root config changed", function(){

			var cacheData = parser.getCache();
			cacheData.files['/test-tree/config.json'] = 0;

			var changes = parser.getChanges(cacheData);

			it("should return root node", function(){
				changes.pages.should.has.property("/");
			});

		});

		context("root excerpt contents changed", function(){
			
			var cacheData = parser.getCache();
			cacheData.files['/test-tree/_excerpt.md'] = 0;

			var changes = parser.getChanges(cacheData);

			it("should return root node", function(){
				changes.pages.should.has.property("/");
			});

		});

		context("root section contents changed", function(){
			
			var cacheData = parser.getCache();
			cacheData.files['/test-tree/001_Root_section.md'] = 0;

			var changes = parser.getChanges(cacheData);

			it("should return root node", function(){
				changes.pages.should.has.property("/");
			});

		});

		context("level 1 section contents changed", function(){
			
			var cacheData = parser.getCache();
			cacheData.files['/test-tree/003_Root_page/001_Page_section.md'] = 0;

			var changes = parser.getChanges(cacheData);

			it("should return level 1 node", function(){
				changes.pages.should.has.property("/root-page/");
			});

		});

		context("level 2 section contents changed", function(){
			
			var cacheData = parser.getCache();
			cacheData.files['/test-tree/003_Root_page/002_Page_Subpage/A_Section.md'] = 0;

			var changes = parser.getChanges(cacheData);

			it("should return level 2 node", function(){
				changes.pages.should.has.property("/root-page/sub-page/");
			});

		});

		context("child page config changed", function(){
			
			var cacheData = parser.getCache();

			fsMockTree["/test-tree"]["003_Root_page"]["config.json"] = mockFs.file({ content: '{ "icon": "page-m", "hidden": false }', mtime: new Date() });
			mockFs(fsMockTree);

			var parserB = new TreeParser("/test-tree");
			var changes = parserB.getChanges(cacheData);

			it("should return all nodes", function(){
				changes.pages.should.has.property("/");
				changes.pages.should.has.property("/root-page/");
				changes.pages.should.has.property("/root-page/sub-page/");
			});

		});

	});

	mockFs.restore();

});