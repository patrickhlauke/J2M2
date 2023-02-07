/**
 * Original script by Fokke Zandbergen / https://github.com/FokkeZB/J2M
 * Horribly hacked to add needed support for alternative text for images by Patrick H. Lauke / https://github.com/patrickhlauke
 * Additional helper function to turn Jira images into links (to work around Jira's new broken behaviour with images/attachments)
 * Simplified to just do Markdown to Jira, not the other way around
 */


(function() {

	/**
	 * Takes Markdown and converts it to Jira formatted text
	 *
	 * @param {string} input
	 * @returns {string}
	 */
	function toJ(input) {
		// remove sections that shouldn't be recursively processed
		var START = 'J2MBLOCKPLACEHOLDER';
		var replacementsList = [];
		var counter = 0;
		
		// horizontal rule
		input = input.replace(/(\s*)---([\n\r\s]*)/g, '$1----$2');

		// code
		input = input.replace(/`{3,}[ .]*(\w+)?((?:\n|.)+?)`{3,}/g, function(match, synt, content) {
			var code = '{code';
		
			if (synt) {
				code += ':' + synt;
			}
		
			code += '}' + content + '{code}';
			var key = START + counter++ + '%%';
			replacementsList.push({key: key, value: code});
			return key;
		});
		
		input = input.replace(/`([^`]+)`/g, function(match, content) {
			var code = '{{'+ content + '}}';
			var key = START + counter++ + '%%';
			replacementsList.push({key: key, value: code});
			return key;
		});

		input = input.replace(/`([^`]+)`/g, '{{$1}}');

		input = input.replace(/^([#]+)(.*?)$/gm, function (match,level,content) {
			return 'h' + level.length + '.' + content;
		});

		// bold and italic
		input = input.replace(/([*_]+)(.*?)\1/g, function (match,wrapper,content) {
			var to = (wrapper.length === 1) ? '_' : '*';
			return to + content + to;
		});

		// multi-level bulleted list
		input = input.replace(/^(\s*)[\-\*] (.*)$/gm, function (match,level,content) {
			var len = 2;
			if(level.length > 0) {
				len = parseInt(level.length/4.0) + 2;
			}
			return Array(len).join("-") + ' ' + content;
		});

		// multi-level numbered list
		input = input.replace(/^(\s*)[0-9]+\. (.*)$/gm, function (match, level, content) {
			var len = 2;
			if (level.length > 1) {
				len = parseInt(level.length / 4) + 2;
			}
			return Array(len).join("#") + ' ' + content;
		});

		var map = {
			cite: '??',
			del: '-',
			ins: '+',
			sup: '^',
			sub: '~'
		};

		input = input.replace(new RegExp('<(' + Object.keys(map).join('|') + ')>(.*?)<\/\\1>', 'g'), function (match,from,content) {
			//console.log(from);
			var to = map[from];
			return to + content + to;
		});

		input = input.replace(/<span style="color:(#[^"]+)">([^]*?)<\/span>/gm, '{color:$1}$2{color}');

		input = input.replace(/~~(.*?)~~/g, '-$1-');

		// Images without alt
		input = input.replace(/!\[\]\(([^)\n\s]+)\)/g, '!$1!');
		// Images with alt
		input = input.replace(/!\[([^\]\n]+)\]\(([^)\n\s]+)\)/g, '!$2|alt=$1!');
		
		input = input.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[$1|$2]');
		input = input.replace(/<([^>]+)>/g, '[$1]');

		// restore extracted sections
		for(var i =0; i < replacementsList.length; i++){
			var sub = replacementsList[i];
			input = input.replace(sub["key"], sub["value"]);
		}

		// Convert header rows of tables by splitting input on lines
		lines = input.split(/\r?\n/gm);
		lines_to_remove = []
		for (var i = 0; i < lines.length; i++) {
			line_content = lines[i];

			if (line_content.match(/\|---/g) != null) {
				lines[i-1] = lines[i-1].replace(/\|/g, "||")
				lines.splice(i, 1)
			}
		}

		// Join the split lines back
		input = ""
		for (var i = 0; i < lines.length; i++) {
			input += lines[i] + "\n"
		}
		return input;
	};

	/**
	 * Takes Jira formatted text, keeps image references, adds thumbnail option
	 *
	 * @param {string} input
	 * @returns {string}
	 */
	function imgJthumb(input) {
		// Images with alt= among their parameters
		input = input.replace(/(!([^|\n\s]+)(\|)?(([^\n!]*))?!)/g, '!$2|thumbnail,$4!');
		// Images without any parameters or alt
		input = input.replace(/(!([^\n\s!]+)!)/g, '!$2!');
		return input;
	};


	/**
	 * Takes Jira formatted text, keeps image references, but forces alternative text as visible caption
	 *
	 * @param {string} input
	 * @returns {string}
	 */
	 function imgJcaption(input) {
		// Images with alt= among their parameters
		input = input.replace(/(!([^|\n\s]+)\|([^\n!]*)alt=([^\n!\,]+?)(,([^\n!]*))?!)/g, '!$2|alt=$4!  (*Caption:* $4)');
		// Images without any parameters or alt
		input = input.replace(/(!([^\n\s!]+)!)/g, '!$2!');
		return input;
	};
	
	/**
	 * Takes Jira formatted text and munges images/alternative texts into just visible text with filename (and text alternative)
	 *
	 * @param {string} input
	 * @returns {string}
	 */
	function imgJreplace(input) {
		// Images with alt= among their parameters
		input = input.replace(/(!([^|\n\s]+)\|([^\n!]*)alt=([^\n!\,]+?)(,([^\n!]*))?!)/g, '*Image ({{$2}}):* $4');
		// Images with just other parameters (ignore them)
		input = input.replace(/(!([^|\n\s]+)\|([^\n!]*)!)/g, '*Image ({{$2}})*');
		// Images without any parameters or alt
		input = input.replace(/(!([^\n\s!]+)!)/g, '*Image ({{$2}})*');
		return input;
	};

	/**
	 * Exports object
	 * @type {{toJ: toJ}}
	 */
	var J2M = {
		toJ: toJ,
		imgJthumb: imgJthumb,
		imgJcaption: imgJcaption,
		imgJreplace: imgJreplace
	};

	// exporting that can be used in a browser and in node
	try {
		window.J2M = J2M;
	} catch (e) {
		// not a browser, we assume it is node
		module.exports = J2M;
	}
})();
