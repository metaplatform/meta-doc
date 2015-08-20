/*
 * META Doc
 * Documentation generator
 *
 * @author META Platform <www.meta-platform.com>
 * @license MIT
 */

module.exports = {

	icon: function(contents){

		return '<i class="inline-icon mdi mdi-' + contents.trim() + '"></i>';

	},

	link: function(contents){

		var args = contents.trim().split("|");

		return '<a href="' + args[0] + '"' + ( args[2] ? ' target="' + args[2] + '"' : '' ) + '>' + args[1] + '</a>';

	}

};