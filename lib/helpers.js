/*
 * META Doc
 * Documentation generator
 *
 * @author META Platform <www.meta-platform.com>
 * @license See LICENSE file distributed with this source code
 */

var messageConfig = function(classname, icon){

	return {
		render: function(tokens, idx, _options, env, self){

		    // add a class to the opening tag
		    if (tokens[idx].nesting === 1) {
		    	
		    	tokens[idx].attrPush([ 'class', "message " + classname]);

		    	return self.renderToken(tokens, idx, _options, env, self) + '<i class="mdi mdi-' + icon + '"></i>';

		    }

		    return self.renderToken(tokens, idx, _options, env, self);

		}
	};

};

var sidecodeConfig = function(classname){

	return {

		render: function (tokens, idx, _options, env, self) {

			if (tokens[idx].nesting === 1) {
				
				tokens[idx].attrPush([ 'class', classname ]);
				return self.renderToken(tokens, idx, _options, env, self) + '<div class="side-wrapper">\n';

			} else {
				
				return '</div>\n' + self.renderToken(tokens, idx, _options, env, self);

			}

			return self.renderToken(tokens, idx, _options, env, self);
		}

 	};

};

var blockConfig = function(classname, prefix, postfix){

	return {
		render: function(tokens, idx, _options, env, self){

		    // add a class to the opening tag
		    if (tokens[idx].nesting === 1) {
		    	
		    	tokens[idx].attrPush([ 'class', "block-" + classname]);

		    	return self.renderToken(tokens, idx, _options, env, self) + ( prefix || "" );

		    } else {

				return ( postfix || "" ) + self.renderToken(tokens, idx, _options, env, self);

		    }

		    return self.renderToken(tokens, idx, _options, env, self);

		}
	};

};

module.exports = {

	atts: 			[ require('markdown-it-attrs') ],
	highlight: 		[ require('markdown-it-highlightjs') ],

	message: 		[ require('markdown-it-container'), "message" ],
	info: 	 		[ require('markdown-it-container'), "info", messageConfig("info", "information") ],
 	warning: 		[ require('markdown-it-container'), "warning", messageConfig("warn", "alert-circle") ],
 	alert: 			[ require('markdown-it-container'), "alert", messageConfig("alert", "alert") ],
 	success: 		[ require('markdown-it-container'), "success", messageConfig("success", "checkbox-marked-circle") ],
 	
 	clear: 			[ require('markdown-it-container'), "clear" ],

 	sidecode: 		[ require('markdown-it-container'), "sidecode", sidecodeConfig("sidecode") ],
 	sidecode_h3: 	[ require('markdown-it-container'), "sidecode-h3", sidecodeConfig("sidecode h3") ],

 	_block: 		function(name, prefix, postfix){

 		return [ require('markdown-it-container'), name, blockConfig(name, prefix, postfix) ];

 	}

};