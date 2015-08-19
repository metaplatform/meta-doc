/*
 * META Doc
 * Documentation generator
 *
 * @author META Platform <www.meta-platform.com>
 * @license MIT
 */

var should = require("should");
var fs = require("fs");

var TreeParser = require(__dirname + "/../lib/treeParser.js");

describe("Tree parser", function(){

	var fileKeys = [
		__dirname + '/samplePages/01_Intro.md',
		__dirname + '/samplePages/02_Getting_started.md',
		__dirname + '/samplePages/03_Tutorial/01_Step_1.md',
		__dirname + '/samplePages/03_Tutorial/02_Step_2.md',
		__dirname + '/samplePages/03_Tutorial/_excerpt.html',
		__dirname + '/samplePages/03_Tutorial/_excerpt.md'
	];

	var parser = null;

	it("should parse directory when constructed", function(){

		parser = new TreeParser(__dirname + "/samplePages");

	});

	it("should has proper file list", function(){

		parser.files.should.have.keys(fileKeys);

	});

	it("should has proper pages structure", function(){

		parser.pages.should.eql([{
			type: 'section',
		    name: '01_Intro.md',
		    path: __dirname + '/samplePages/01_Intro.md',
		    label: 'Intro'
		}, {
			type: 'section',
		    name: '02_Getting_started.md',
		    path: __dirname + '/samplePages/02_Getting_started.md',
		    label: 'Getting started'
		}, {
			type: 'page',
		    name: '03_Tutorial',
		    path: __dirname + '/samplePages/03_Tutorial',
		    label: 'Tutorial',
		    excerpt: __dirname + '/samplePages/03_Tutorial/_excerpt.html',
		    sections: [
				{
					type: 'section',
					name: '01_Step_1.md',
					path: __dirname + '/samplePages/03_Tutorial/01_Step_1.md',
					label: 'Step 1'
				}, {
					type: 'section',
					name: '02_Step_2.md',
					path: __dirname + '/samplePages/03_Tutorial/02_Step_2.md',
					label: 'Step 2'
				}
		    ] 
		}]);

	});

	it("should has proper hash", function(){

		parser.structureHash.should.be.equal("28f270bf86be1913db1b6082f337eac1");

	});

	it("should return cache", function(){

		var cache = parser.getCache();

		cache.hash.should.eql("28f270bf86be1913db1b6082f337eac1");
		cache.files.should.has.keys(fileKeys);

	});

	it("should return empty changed files list when using up-to-date cache", function(){

		var cache = parser.getCache();
		var changes = parser.getChangedFiles(cache);

		changes.should.has.lengthOf(0);

	});

	it("should return proper changed files when using old cache", function(){

		var cache = parser.getCache();
		var shiftedFile = null;

		for(var i in cache.files){
			shiftedFile = i;
			cache.files[i] = 0;
			break;
		}			

		var changes = parser.getChangedFiles(cache);

		changes.should.be.eql([ shiftedFile ]);

	});

	it("should return full file list when using cache with different hash", function(){

		var cache = parser.getCache();
		cache.hash = "xxx";

		var changes = parser.getChangedFiles(cache);

		changes.should.eql(fileKeys);

	});

	it("should return full file list when not providing cache argument", function(){

		var changes = parser.getChangedFiles();
		changes.should.eql(fileKeys);

	});

});