/*
 * META Doc
 * Documentation generator
 *
 * @author META Platform <www.meta-platform.com>
 * @license See LICENSE file distributed with this source code
 */

module.exports = {

	icon: function(opts, content){

		return '<i class="inline-icon mdi mdi-' + opts[0] + '"></i>';

	},

	link: function(opts, content){

		return '<a href="' + opts.href + '"' + ( opts.target ? ' target="' + opts.target + '"' : '' ) + '>' + content + '</a>';

	},

	cta: function(opts, content){

		return '<a class="cta" href="' + opts.href + '"' + ( opts.target ? ' target="' + opts.target + '"' : '' ) + '>' + content + '</a>';

	}

};