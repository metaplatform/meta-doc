/*
 * META Doc
 * Documentation generator
 *
 * @author META Platform <www.meta-platform.com>
 * @license See LICENSE file distributed with this source code
 */

var fs = require("fs");
var cp = require("cp");

var logger = require("meta-logger");

var Utils = {

	/**
	 * Copy directory
	 *
	 * @param string srcDir
	 * @param string dstDir
	 */
	copyDir: function(srcDir, dstDir){

		if(!fs.existsSync(dstDir)){
			logger.debug("Creating directory", dstDir);
			fs.mkdirSync(dstDir);
		}

		var files = fs.readdirSync(srcDir);

		for(var i in files){

			var stats = fs.statSync(srcDir + "/" + files[i]);

			if(stats.isDirectory()){

				Utils.copyDir(srcDir + "/" + files[i], dstDir + "/" + files[i]);

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

	},

	/**
	 * Clean directory and optionaly remove itself
	 *
	 * @param string dir
	 * @param bool removeDir
	 */
	cleanDir: function(dir, removeDir){

		if(!fs.existsSync(dir))
			return false;

		var files = fs.readdirSync(dir);

		for(var i in files){

			var stats = fs.statSync(dir + "/" + files[i]);

			if(stats.isDirectory()){

				Utils.cleanDir(dir + "/" + files[i], true);

			} else {

				logger.debug("Removing file '%s' ...", dir + "/" + files[i]);
				fs.unlinkSync(dir + "/" + files[i]);

			}

		}

		if(removeDir){
			logger.debug("Removing directory '%s' ...", dir);
			fs.rmdirSync(dir);
		}

	}

};

module.exports = Utils;