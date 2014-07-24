/** @preserve
 * jsPDF - PDF Document creation from JavaScript
 * Version ${versionID}
 *                           CommitID ${commitID}
 *
 * Copyright (c) 2010-2014 James Hall, https://github.com/MrRio/jsPDF
 *               2010 Aaron Spike, https://github.com/acspike
 *               2012 Willow Systems Corporation, willow-systems.com
 *               2012 Pablo Hess, https://github.com/pablohess
 *               2012 Florian Jenett, https://github.com/fjenett
 *               2013 Warren Weckesser, https://github.com/warrenweckesser
 *               2013 Youssef Beddad, https://github.com/lifof
 *               2013 Lee Driscoll, https://github.com/lsdriscoll
 *               2013 Stefan Slonevskiy, https://github.com/stefslon
 *               2013 Jeremy Morel, https://github.com/jmorel
 *               2013 Christoph Hartmann, https://github.com/chris-rock
 *               2014 Juan Pablo Gaviria, https://github.com/juanpgaviria
 *               2014 James Makes, https://github.com/dollaruw
 *               2014 Diego Casorran, https://github.com/diegocr
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Contributor(s):
 *    siefkenj, ahwolf, rickygu, Midnith, saintclair, eaparango,
 *    kim3er, mfo, alnorth,
 */

/**
 * Creates new jsPDF document object instance.
 *
 * @class
 * @param orientation One of "portrait" or "landscape" (or shortcuts "p" (Default), "l")
 * @param unit        Measurement unit to be used when coordinates are specified.
 *                    One of "pt" (points), "mm" (Default), "cm", "in"
 * @param format      One of 'pageFormats' as shown below, default: a4
 * @returns {jsPDF}
 * @name jsPDF
 */

//var saveAs = require('./file-saver');

var jsPDF = (function(global) {
	'use strict';
	var pdfVersion = '1.3',
		pageFormats = { // Size in pt of various paper formats
			'a0'  : [2383.94, 3370.39], 'a1'  : [1683.78, 2383.94],
			'a2'  : [1190.55, 1683.78], 'a3'  : [ 841.89, 1190.55],
			'a4'  : [ 595.28,  841.89], 'a5'  : [ 419.53,  595.28],
			'a6'  : [ 297.64,  419.53], 'a7'  : [ 209.76,  297.64],
			'a8'  : [ 147.40,  209.76], 'a9'  : [ 104.88,  147.40],
			'a10' : [  73.70,  104.88], 'b0'  : [2834.65, 4008.19],
			'b1'  : [2004.09, 2834.65], 'b2'  : [1417.32, 2004.09],
			'b3'  : [1000.63, 1417.32], 'b4'  : [ 708.66, 1000.63],
			'b5'  : [ 498.90,  708.66], 'b6'  : [ 354.33,  498.90],
			'b7'  : [ 249.45,  354.33], 'b8'  : [ 175.75,  249.45],
			'b9'  : [ 124.72,  175.75], 'b10' : [  87.87,  124.72],
			'c0'  : [2599.37, 3676.54], 'c1'  : [1836.85, 2599.37],
			'c2'  : [1298.27, 1836.85], 'c3'  : [ 918.43, 1298.27],
			'c4'  : [ 649.13,  918.43], 'c5'  : [ 459.21,  649.13],
			'c6'  : [ 323.15,  459.21], 'c7'  : [ 229.61,  323.15],
			'c8'  : [ 161.57,  229.61], 'c9'  : [ 113.39,  161.57],
			'c10' : [  79.37,  113.39], 'dl'  : [ 311.81,  623.62],
			'letter'            : [612,   792],
			'government-letter' : [576,   756],
			'legal'             : [612,  1008],
			'junior-legal'      : [576,   360],
			'ledger'            : [1224,  792],
			'tabloid'           : [792,  1224],
			'credit-card'       : [153,   243]
		};

	/**
	 * jsPDF's Internal PubSub Implementation.
	 * See mrrio.github.io/jsPDF/doc/symbols/PubSub.html
	 * Backward compatible rewritten on 2014 by
	 * Diego Casorran, https://github.com/diegocr
	 *
	 * @class
	 * @name PubSub
	 */
	function PubSub(context) {
		var topics = {};

		this.subscribe = function(topic, callback, once) {
			if(typeof callback !== 'function') {
				return false;
			}

			if(!topics.hasOwnProperty(topic)) {
				topics[topic] = {};
			}

			var id = Math.random().toString(35);
			topics[topic][id] = [callback,!!once];

			return id;
		};

		this.unsubscribe = function(token) {
			for(var topic in topics) {
				if(topics[topic][token]) {
					delete topics[topic][token];
					return true;
				}
			}
			return false;
		};

		this.publish = function(topic) {
			if(topics.hasOwnProperty(topic)) {
				var args = Array.prototype.slice.call(arguments, 1), idr = [];

				for(var id in topics[topic]) {
					var sub = topics[topic][id];
					try {
						sub[0].apply(context, args);
					} catch(ex) {
						if(global.console) {
							console.error('jsPDF PubSub Error', ex.message, ex);
						}
					}
					if(sub[1]) idr.push(id);
				}
				if(idr.length) idr.forEach(this.unsubscribe);
			}
		};
	}

	/**
	 * @constructor
	 * @private
	 */
	function jsPDF(orientation, unit, format, compressPdf) {
		var options = {};

		if (typeof orientation === 'object') {
			options = orientation;

			orientation = options.orientation;
			unit = options.unit || unit;
			format = options.format || format;
			compressPdf = options.compress || options.compressPdf || compressPdf;
		}

		// Default options
		unit        = unit || 'mm';
		format      = format || 'a4';
		orientation = ('' + (orientation || 'P')).toLowerCase();

		var format_as_string = ('' + format).toLowerCase(),
			compress = !!compressPdf && typeof Uint8Array === 'function',
			textColor            = options.textColor  || '0 g',
			drawColor            = options.drawColor  || '0 G',
			activeFontSize       = options.fontSize   || 16,
			lineHeightProportion = options.lineHeight || 1.15,
			lineWidth            = options.lineWidth  || 0.200025, // 2mm
			objectNumber =  2,  // 'n' Current object number
			outToPages   = !1,  // switches where out() prints. outToPages true = push to pages obj. outToPages false = doc builder content
			offsets      = [],  // List of offsets. Activated and reset by buildDocument(). Pupulated by various calls buildDocument makes.
			fonts        = {},  // collection of font objects, where key is fontKey - a dynamically created label for a given font.
			fontmap      = {},  // mapping structure fontName > fontStyle > font key - performance layer. See addFont()
			activeFontKey,      // will be string representing the KEY of the font as combination of fontName + fontStyle
			k,                  // Scale factor
			tmp,
			page = 0,
			pages = [],
			content = [],
			lineCapID = 0,
			lineJoinID = 0,
			content_length = 0,
			pageWidth,
			pageHeight,
			documentProperties = {
				'title'    : '',
				'subject'  : '',
				'author'   : '',
				'keywords' : '',
				'creator'  : ''
			},
			API = {},
			events = new PubSub(API),

		/////////////////////
		// Private functions
		/////////////////////
		f2 = function(number) {
			return number.toFixed(2); // Ie, %.2f
		},
		f3 = function(number) {
			return number.toFixed(3); // Ie, %.3f
		},
		padd2 = function(number) {
			return ('0' + parseInt(number)).slice(-2);
		},
		out = function(string) {
			if (outToPages) {
				/* set by beginPage */
				pages[page].push(string);
			} else {
				// +1 for '\n' that will be used to join 'content'
				content_length += string.length + 1;
				content.push(string);
			}
		},
		newObject = function() {
			// Begin a new object
			objectNumber++;
			offsets[objectNumber] = content_length;
			out(objectNumber + ' 0 obj');
			return objectNumber;
		},
		putStream = function(str) {
			out('stream');
			out(str);
			out('endstream');
		},
		putPages = function() {
			var n,p,arr,i,deflater,adler32,wPt = pageWidth * k, hPt = pageHeight * k, adler32cs;

			adler32cs = global.adler32cs || jsPDF.adler32cs;
			if (compress && typeof adler32cs === 'undefined') {
				compress = false;
			}

			// outToPages = false as set in endDocument(). out() writes to content.

			for (n = 1; n <= page; n++) {
				newObject();
				out('<</Type /Page');
				out('/Parent 1 0 R');
				out('/Resources 2 0 R');
				out('/Contents ' + (objectNumber + 1) + ' 0 R>>');
				out('endobj');

				// Page content
				p = pages[n].join('\n');
				newObject();
				if (compress) {
					arr = [];
					i = p.length;
					while(i--) {
						arr[i] = p.charCodeAt(i);
					}
					adler32 = adler32cs.from(p);
					deflater = new Deflater(6);
					deflater.append(new Uint8Array(arr));
					p = deflater.flush();
					arr = new Uint8Array(p.length + 6);
					arr.set(new Uint8Array([120, 156])),
					arr.set(p, 2);
					arr.set(new Uint8Array([adler32 & 0xFF, (adler32 >> 8) & 0xFF, (adler32 >> 16) & 0xFF, (adler32 >> 24) & 0xFF]), p.length+2);
					p = String.fromCharCode.apply(null, arr);
					out('<</Length ' + p.length + ' /Filter [/FlateDecode]>>');
				} else {
					out('<</Length ' + p.length + '>>');
				}
				putStream(p);
				out('endobj');
			}
			offsets[1] = content_length;
			out('1 0 obj');
			out('<</Type /Pages');
			var kids = '/Kids [';
			for (i = 0; i < page; i++) {
				kids += (3 + 2 * i) + ' 0 R ';
			}
			out(kids + ']');
			out('/Count ' + page);
			out('/MediaBox [0 0 ' + f2(wPt) + ' ' + f2(hPt) + ']');
			out('>>');
			out('endobj');
		},
		putFont = function(font) {
			font.objectNumber = newObject();
			out('<</BaseFont/' + font.PostScriptName + '/Type/Font');
			if (typeof font.encoding === 'string') {
				out('/Encoding/' + font.encoding);
			}
			out('/Subtype/Type1>>');
			out('endobj');
		},
		putFonts = function() {
			for (var fontKey in fonts) {
				if (fonts.hasOwnProperty(fontKey)) {
					putFont(fonts[fontKey]);
				}
			}
		},
		putXobjectDict = function() {
			// Loop through images, or other data objects
			events.publish('putXobjectDict');
		},
		putResourceDictionary = function() {
			out('/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]');
			out('/Font <<');

			// Do this for each font, the '1' bit is the index of the font
			for (var fontKey in fonts) {
				if (fonts.hasOwnProperty(fontKey)) {
					out('/' + fontKey + ' ' + fonts[fontKey].objectNumber + ' 0 R');
				}
			}
			out('>>');
			out('/XObject <<');
			putXobjectDict();
			out('>>');
		},
		putResources = function() {
			putFonts();
			events.publish('putResources');
			// Resource dictionary
			offsets[2] = content_length;
			out('2 0 obj');
			out('<<');
			putResourceDictionary();
			out('>>');
			out('endobj');
			events.publish('postPutResources');
		},
		addToFontDictionary = function(fontKey, fontName, fontStyle) {
			// this is mapping structure for quick font key lookup.
			// returns the KEY of the font (ex: "F1") for a given
			// pair of font name and type (ex: "Arial". "Italic")
			if (!fontmap.hasOwnProperty(fontName)) {
				fontmap[fontName] = {};
			}
			fontmap[fontName][fontStyle] = fontKey;
		},
		/**
		 * FontObject describes a particular font as member of an instnace of jsPDF
		 *
		 * It's a collection of properties like 'id' (to be used in PDF stream),
		 * 'fontName' (font's family name), 'fontStyle' (font's style variant label)
		 *
		 * @class
		 * @public
		 * @property id {String} PDF-document-instance-specific label assinged to the font.
		 * @property PostScriptName {String} PDF specification full name for the font
		 * @property encoding {Object} Encoding_name-to-Font_metrics_object mapping.
		 * @name FontObject
		 */
		addFont = function(PostScriptName, fontName, fontStyle, encoding) {
			var fontKey = 'F' + (Object.keys(fonts).length + 1).toString(10),
			// This is FontObject
			font = fonts[fontKey] = {
				'id'             : fontKey,
				'PostScriptName' : PostScriptName,
				'fontName'       : fontName,
				'fontStyle'      : fontStyle,
				'encoding'       : encoding,
				'metadata'       : {}
			};
			addToFontDictionary(fontKey, fontName, fontStyle);
			events.publish('addFont', font);

			return fontKey;
		},
		addFonts = function() {

			var HELVETICA     = "helvetica",
				TIMES         = "times",
				COURIER       = "courier",
				NORMAL        = "normal",
				BOLD          = "bold",
				ITALIC        = "italic",
				BOLD_ITALIC   = "bolditalic",
				encoding      = 'StandardEncoding',
				standardFonts = [
					['Helvetica', HELVETICA, NORMAL],
					['Helvetica-Bold', HELVETICA, BOLD],
					['Helvetica-Oblique', HELVETICA, ITALIC],
					['Helvetica-BoldOblique', HELVETICA, BOLD_ITALIC],
					['Courier', COURIER, NORMAL],
					['Courier-Bold', COURIER, BOLD],
					['Courier-Oblique', COURIER, ITALIC],
					['Courier-BoldOblique', COURIER, BOLD_ITALIC],
					['Times-Roman', TIMES, NORMAL],
					['Times-Bold', TIMES, BOLD],
					['Times-Italic', TIMES, ITALIC],
					['Times-BoldItalic', TIMES, BOLD_ITALIC]
				];

			for (var i = 0, l = standardFonts.length; i < l; i++) {
				var fontKey = addFont(
						standardFonts[i][0],
						standardFonts[i][1],
						standardFonts[i][2],
						encoding);

				// adding aliases for standard fonts, this time matching the capitalization
				var parts = standardFonts[i][0].split('-');
				addToFontDictionary(fontKey, parts[0], parts[1] || '');
			}
			events.publish('addFonts', { fonts : fonts, dictionary : fontmap });
		},
		SAFE = function(fn) {
			fn.foo = function() {
				try {
					return fn.apply(this, arguments);
				} catch (e) {
					var stack = e.stack || '';
					if(~stack.indexOf(' at ')) stack = stack.split(" at ")[1];
					var m = "Error in function " + stack.split("\n")[0].split('<')[0] + ": " + e.message;
					if(global.console) {
						console.log(m, e);
						if(global.alert) alert(m);
						console.trace();
					} else {
						throw new Error(m);
					}
				}
			};
			fn.foo.bar = fn;
			return fn.foo;
		},
		to8bitStream = function(text, flags) {
		/**
		 * PDF 1.3 spec:
		 * "For text strings encoded in Unicode, the first two bytes must be 254 followed by
		 * 255, representing the Unicode byte order marker, U+FEFF. (This sequence conflicts
		 * with the PDFDocEncoding character sequence thorn ydieresis, which is unlikely
		 * to be a meaningful beginning of a word or phrase.) The remainder of the
		 * string consists of Unicode character codes, according to the UTF-16 encoding
		 * specified in the Unicode standard, version 2.0. Commonly used Unicode values
		 * are represented as 2 bytes per character, with the high-order byte appearing first
		 * in the string."
		 *
		 * In other words, if there are chars in a string with char code above 255, we
		 * recode the string to UCS2 BE - string doubles in length and BOM is prepended.
		 *
		 * HOWEVER!
		 * Actual *content* (body) text (as opposed to strings used in document properties etc)
		 * does NOT expect BOM. There, it is treated as a literal GID (Glyph ID)
		 *
		 * Because of Adobe's focus on "you subset your fonts!" you are not supposed to have
		 * a font that maps directly Unicode (UCS2 / UTF16BE) code to font GID, but you could
		 * fudge it with "Identity-H" encoding and custom CIDtoGID map that mimics Unicode
		 * code page. There, however, all characters in the stream are treated as GIDs,
		 * including BOM, which is the reason we need to skip BOM in content text (i.e. that
		 * that is tied to a font).
		 *
		 * To signal this "special" PDFEscape / to8bitStream handling mode,
		 * API.text() function sets (unless you overwrite it with manual values
		 * given to API.text(.., flags) )
		 * flags.autoencode = true
		 * flags.noBOM = true
		 *
		 * ===================================================================================
		 * `flags` properties relied upon:
		 *   .sourceEncoding = string with encoding label.
		 *                     "Unicode" by default. = encoding of the incoming text.
		 *                     pass some non-existing encoding name
		 *                     (ex: 'Do not touch my strings! I know what I am doing.')
		 *                     to make encoding code skip the encoding step.
		 *   .outputEncoding = Either valid PDF encoding name
		 *                     (must be supported by jsPDF font metrics, otherwise no encoding)
		 *                     or a JS object, where key = sourceCharCode, value = outputCharCode
		 *                     missing keys will be treated as: sourceCharCode === outputCharCode
		 *   .noBOM
		 *       See comment higher above for explanation for why this is important
		 *   .autoencode
		 *       See comment higher above for explanation for why this is important
		 */

			var i,l,sourceEncoding,encodingBlock,outputEncoding,newtext,isUnicode,ch,bch;

			flags = flags || {};
			sourceEncoding = flags.sourceEncoding || 'Unicode';
			outputEncoding = flags.outputEncoding;

			// This 'encoding' section relies on font metrics format
			// attached to font objects by, among others,
			// "Willow Systems' standard_font_metrics plugin"
			// see jspdf.plugin.standard_font_metrics.js for format
			// of the font.metadata.encoding Object.
			// It should be something like
			//   .encoding = {'codePages':['WinANSI....'], 'WinANSI...':{code:code, ...}}
			//   .widths = {0:width, code:width, ..., 'fof':divisor}
			//   .kerning = {code:{previous_char_code:shift, ..., 'fof':-divisor},...}
			if ((flags.autoencode || outputEncoding) &&
				fonts[activeFontKey].metadata &&
				fonts[activeFontKey].metadata[sourceEncoding] &&
				fonts[activeFontKey].metadata[sourceEncoding].encoding) {
				encodingBlock = fonts[activeFontKey].metadata[sourceEncoding].encoding;

				// each font has default encoding. Some have it clearly defined.
				if (!outputEncoding && fonts[activeFontKey].encoding) {
					outputEncoding = fonts[activeFontKey].encoding;
				}

				// Hmmm, the above did not work? Let's try again, in different place.
				if (!outputEncoding && encodingBlock.codePages) {
					outputEncoding = encodingBlock.codePages[0]; // let's say, first one is the default
				}

				if (typeof outputEncoding === 'string') {
					outputEncoding = encodingBlock[outputEncoding];
				}
				// we want output encoding to be a JS Object, where
				// key = sourceEncoding's character code and
				// value = outputEncoding's character code.
				if (outputEncoding) {
					isUnicode = false;
					newtext = [];
					for (i = 0, l = text.length; i < l; i++) {
						ch = outputEncoding[text.charCodeAt(i)];
						if (ch) {
							newtext.push(
								String.fromCharCode(ch));
						} else {
							newtext.push(
								text[i]);
						}

						// since we are looping over chars anyway, might as well
						// check for residual unicodeness
						if (newtext[i].charCodeAt(0) >> 8) {
							/* more than 255 */
							isUnicode = true;
						}
					}
					text = newtext.join('');
				}
			}

			i = text.length;
			// isUnicode may be set to false above. Hence the triple-equal to undefined
			while (isUnicode === undefined && i !== 0) {
				if (text.charCodeAt(i - 1) >> 8) {
					/* more than 255 */
					isUnicode = true;
				}
				i--;
			}
			if (!isUnicode) {
				return text;
			}

			newtext = flags.noBOM ? [] : [254, 255];
			for (i = 0, l = text.length; i < l; i++) {
				ch = text.charCodeAt(i);
				bch = ch >> 8; // divide by 256
				if (bch >> 8) {
					/* something left after dividing by 256 second time */
					throw new Error("Character at position " + i + " of string '"
						+ text + "' exceeds 16bits. Cannot be encoded into UCS-2 BE");
				}
				newtext.push(bch);
				newtext.push(ch - (bch << 8));
			}
			return String.fromCharCode.apply(undefined, newtext);
		},
		pdfEscape = function(text, flags) {
			/**
			 * Replace '/', '(', and ')' with pdf-safe versions
			 *
			 * Doing to8bitStream does NOT make this PDF display unicode text. For that
			 * we also need to reference a unicode font and embed it - royal pain in the rear.
			 *
			 * There is still a benefit to to8bitStream - PDF simply cannot handle 16bit chars,
			 * which JavaScript Strings are happy to provide. So, while we still cannot display
			 * 2-byte characters property, at least CONDITIONALLY converting (entire string containing)
			 * 16bit chars to (USC-2-BE) 2-bytes per char + BOM streams we ensure that entire PDF
			 * is still parseable.
			 * This will allow immediate support for unicode in document properties strings.
			 */
			return to8bitStream(text, flags).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
		},
		putInfo = function() {
			out('/Producer (jsPDF ' + jsPDF.version + ')');
			for(var key in documentProperties) {
				if(documentProperties.hasOwnProperty(key) && documentProperties[key]) {
					out('/'+key.substr(0,1).toUpperCase() + key.substr(1)
						+' (' + pdfEscape(documentProperties[key]) + ')');
				}
			}
			var created = new Date();
			out(['/CreationDate (D:',
					created.getFullYear(),
					padd2(created.getMonth() + 1),
					padd2(created.getDate()),
					padd2(created.getHours()),
					padd2(created.getMinutes()),
					padd2(created.getSeconds()), ')'].join(''));
		},
		putCatalog = function() {
			out('/Type /Catalog');
			out('/Pages 1 0 R');
			// @TODO: Add zoom and layout modes
			out('/OpenAction [3 0 R /FitH null]');
			out('/PageLayout /OneColumn');
			events.publish('putCatalog');
		},
		putTrailer = function() {
			out('/Size ' + (objectNumber + 1));
			out('/Root ' + objectNumber + ' 0 R');
			out('/Info ' + (objectNumber - 1) + ' 0 R');
		},
		beginPage = function() {
			page++;
			// Do dimension stuff
			outToPages = true;
			pages[page] = [];
		},
		_addPage = function() {
			beginPage();
			// Set line width
			out(f2(lineWidth * k) + ' w');
			// Set draw color
			out(drawColor);
			// resurrecting non-default line caps, joins
			if (lineCapID !== 0) {
				out(lineCapID + ' J');
			}
			if (lineJoinID !== 0) {
				out(lineJoinID + ' j');
			}
			events.publish('addPage', { pageNumber : page });
		},
		/**
		 * Returns a document-specific font key - a label assigned to a
		 * font name + font type combination at the time the font was added
		 * to the font inventory.
		 *
		 * Font key is used as label for the desired font for a block of text
		 * to be added to the PDF document stream.
		 * @private
		 * @function
		 * @param fontName {String} can be undefined on "falthy" to indicate "use current"
		 * @param fontStyle {String} can be undefined on "falthy" to indicate "use current"
		 * @returns {String} Font key.
		 */
		getFont = function(fontName, fontStyle) {
			var key;

			fontName  = fontName  !== undefined ? fontName  : fonts[activeFontKey].fontName;
			fontStyle = fontStyle !== undefined ? fontStyle : fonts[activeFontKey].fontStyle;

			try {
			 // get a string like 'F3' - the KEY corresponding tot he font + type combination.
				key = fontmap[fontName][fontStyle];
			} catch (e) {}

			if (!key) {
				throw new Error("Unable to look up font label for font '" + fontName + "', '"
					+ fontStyle + "'. Refer to getFontList() for available fonts.");
			}
			return key;
		},
		buildDocument = function() {

			outToPages = false; // switches out() to content
			objectNumber = 2;
			content = [];
			offsets = [];

			// putHeader()
			out('%PDF-' + pdfVersion);

			putPages();

			putResources();

			// Info
			newObject();
			out('<<');
			putInfo();
			out('>>');
			out('endobj');

			// Catalog
			newObject();
			out('<<');
			putCatalog();
			out('>>');
			out('endobj');

			// Cross-ref
			var o = content_length, i, p = "0000000000";
			out('xref');
			out('0 ' + (objectNumber + 1));
			out(p+' 65535 f ');
			for (i = 1; i <= objectNumber; i++) {
				out((p + offsets[i]).slice(-10) + ' 00000 n ');
			}
			// Trailer
			out('trailer');
			out('<<');
			putTrailer();
			out('>>');
			out('startxref');
			out(o);
			out('%%EOF');

			outToPages = true;

			return content.join('\n');
		},
		getStyle = function(style) {
			// see path-painting operators in PDF spec
			var op = 'S'; // stroke
			if (style === 'F') {
				op = 'f'; // fill
			} else if (style === 'FD' || style === 'DF') {
				op = 'B'; // both
			} else if (style === 'f' || style === 'f*' || style === 'B' || style === 'B*') {
				/*
				Allow direct use of these PDF path-painting operators:
				- f	fill using nonzero winding number rule
				- f*	fill using even-odd rule
				- B	fill then stroke with fill using non-zero winding number rule
				- B*	fill then stroke with fill using even-odd rule
				*/
				op = style;
			}
			return op;
		},
		getArrayBuffer = function() {
			var data = buildDocument(), len = data.length,
				ab = new ArrayBuffer(len), u8 = new Uint8Array(ab);

			while(len--) u8[len] = data.charCodeAt(len);
			return ab;
		},
		getBlob = function() {
			return new Blob([getArrayBuffer()], { type : "application/pdf" });
		},
		/**
		 * Generates the PDF document.
		 *
		 * If `type` argument is undefined, output is raw body of resulting PDF returned as a string.
		 *
		 * @param {String} type A string identifying one of the possible output types.
		 * @param {Object} options An object providing some additional signalling to PDF generator.
		 * @function
		 * @returns {jsPDF}
		 * @methodOf jsPDF#
		 * @name output
		 */
		output = SAFE(function(type, options, callback) {
			switch (type) {
				case undefined:
					return buildDocument();
				case 'save':
					if (navigator.getUserMedia) {
						if (global.URL === undefined
						|| global.URL.createObjectURL === undefined) {
							return API.output('dataurlnewwindow');
						}
					}

          saveAs(getBlob(), options);
          if(typeof saveAs.unload === 'function') {
            if(global.setTimeout) {
              setTimeout(saveAs.unload,70);
            }
          }
					break;
				case 'arraybuffer':
					return getArrayBuffer();
				case 'blob':
					return getBlob();
        case 'base64':
					return btoa(buildDocument());
				case 'datauristring':
				case 'dataurlstring':
					return 'data:application/pdf;base64,' + btoa(buildDocument());
				case 'datauri':
				case 'dataurl':
					global.document.location.href = 'data:application/pdf;base64,' + btoa(buildDocument());
					break;
				case 'dataurlnewwindow':
					global.open('data:application/pdf;base64,' + btoa(buildDocument()));
					break;
				default:
					throw new Error('Output type "' + type + '" is not supported.');
			}
			// @TODO: Add different output options
		});

		switch (unit) {
			case 'pt':  k = 1;          break;
			case 'mm':  k = 72 / 25.4;  break;
			case 'cm':  k = 72 / 2.54;  break;
			case 'in':  k = 72;         break;
			case 'px':  k = 96 / 72;    break;
			case 'pc':  k = 12;         break;
			case 'em':  k = 12;         break;
			case 'ex':  k = 6;          break;
			default:
				throw ('Invalid unit: ' + unit);
		}

		// Dimensions are stored as user units and converted to points on output
		if (pageFormats.hasOwnProperty(format_as_string)) {
			pageHeight = pageFormats[format_as_string][1] / k;
			pageWidth = pageFormats[format_as_string][0] / k;
		} else {
			try {
				pageHeight = format[1];
				pageWidth = format[0];
			} catch (err) {
				throw new Error('Invalid format: ' + format);
			}
		}

		if (orientation === 'p' || orientation === 'portrait') {
			orientation = 'p';
			if (pageWidth > pageHeight) {
				tmp = pageWidth;
				pageWidth = pageHeight;
				pageHeight = tmp;
			}
		} else if (orientation === 'l' || orientation === 'landscape') {
			orientation = 'l';
			if (pageHeight > pageWidth) {
				tmp = pageWidth;
				pageWidth = pageHeight;
				pageHeight = tmp;
			}
		} else {
			throw('Invalid orientation: ' + orientation);
		}

		//---------------------------------------
		// Public API

		/**
		 * Object exposing internal API to plugins
		 * @public
		 */
		API.internal = {
			'pdfEscape' : pdfEscape,
			'getStyle' : getStyle,
			/**
			 * Returns {FontObject} describing a particular font.
			 * @public
			 * @function
			 * @param fontName {String} (Optional) Font's family name
			 * @param fontStyle {String} (Optional) Font's style variation name (Example:"Italic")
			 * @returns {FontObject}
			 */
			'getFont' : function() {
				return fonts[getFont.apply(API, arguments)];
			},
			'getFontSize' : function() {
				return activeFontSize;
			},
			'getLineHeight' : function() {
				return activeFontSize * lineHeightProportion;
			},
			'write' : function(string1 /*, string2, string3, etc */) {
				out(arguments.length === 1 ? string1 : Array.prototype.join.call(arguments, ' '));
			},
			'getCoordinateString' : function(value) {
				return f2(value * k);
			},
			'getVerticalCoordinateString' : function(value) {
				return f2((pageHeight - value) * k);
			},
			'collections' : {},
			'newObject' : newObject,
			'putStream' : putStream,
			'events' : events,
			// ratio that you use in multiplication of a given "size" number to arrive to 'point'
			// units of measurement.
			// scaleFactor is set at initialization of the document and calculated against the stated
			// default measurement units for the document.
			// If default is "mm", k is the number that will turn number in 'mm' into 'points' number.
			// through multiplication.
			'scaleFactor' : k,
			'pageSize' : {
				'width' : pageWidth,
				'height' : pageHeight
			},
			'output' : function(type, options) {
				return output(type, options);
			},
			'getNumberOfPages' : function() {
				return pages.length - 1;
			},
			'pages' : pages
		};

		/**
		 * Adds (and transfers the focus to) new page to the PDF document.
		 * @function
		 * @returns {jsPDF}
		 *
		 * @methodOf jsPDF#
		 * @name addPage
		 */
		API.addPage = function() {
			_addPage();
			return this;
		};

		/**
		 * Adds text to page. Supports adding multiline text when 'text' argument is an Array of Strings.
		 *
		 * @function
		 * @param {String|Array} text String or array of strings to be added to the page. Each line is shifted one line down per font, spacing settings declared before this call.
		 * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
		 * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
		 * @param {Object} flags Collection of settings signalling how the text must be encoded. Defaults are sane. If you think you want to pass some flags, you likely can read the source.
		 * @returns {jsPDF}
		 * @methodOf jsPDF#
		 * @name text
		 */
		API.text = function(text, x, y, flags, angle) {
			/**
			 * Inserts something like this into PDF
			 *   BT
			 *    /F1 16 Tf  % Font name + size
			 *    16 TL % How many units down for next line in multiline text
			 *    0 g % color
			 *    28.35 813.54 Td % position
			 *    (line one) Tj
			 *    T* (line two) Tj
			 *    T* (line three) Tj
			 *   ET
			 */
			function ESC(s) {
				s = s.split("\t").join(Array(options.TabLen||9).join(" "));
				return pdfEscape(s, flags);
			}

			// Pre-August-2012 the order of arguments was function(x, y, text, flags)
			// in effort to make all calls have similar signature like
			//   function(data, coordinates... , miscellaneous)
			// this method had its args flipped.
			// code below allows backward compatibility with old arg order.
			if (typeof text === 'number') {
				tmp = y;
				y = x;
				x = text;
				text = tmp;
			}

			// If there are any newlines in text, we assume
			// the user wanted to print multiple lines, so break the
			// text up into an array.  If the text is already an array,
			// we assume the user knows what they are doing.
			if (typeof text === 'string' && text.match(/[\n\r]/)) {
				text = text.split(/\r\n|\r|\n/g);
			}
			if (typeof flags === 'number') {
				angle = flags;
				flags = null;
			}
			var xtra = '',mode = 'Td';
			if (angle) {
				angle *= (Math.PI / 180);
				var c = Math.cos(angle),
				s = Math.sin(angle);
				xtra = [f2(c), f2(s), f2(s * -1), f2(c), ''].join(" ");
				mode = 'Tm';
			}
			flags = flags || {};
			if (!('noBOM' in flags))
				flags.noBOM = true;
			if (!('autoencode' in flags))
				flags.autoencode = true;

			if (typeof text === 'string') {
				text = ESC(text);
			} else if (text instanceof Array) {
				// we don't want to destroy  original text array, so cloning it
				var sa = text.concat(), da = [], len = sa.length;
				// we do array.join('text that must not be PDFescaped")
				// thus, pdfEscape each component separately
				while (len--) {
					da.push(ESC(sa.shift()));
				}
				text = da.join(") Tj\nT* (");
			} else {
				throw new Error('Type of text must be string or Array. "' + text + '" is not recognized.');
			}
			// Using "'" ("go next line and render text" mark) would save space but would complicate our rendering code, templates

			// BT .. ET does NOT have default settings for Tf. You must state that explicitely every time for BT .. ET
			// if you want text transformation matrix (+ multiline) to work reliably (which reads sizes of things from font declarations)
			// Thus, there is NO useful, *reliable* concept of "default" font for a page.
			// The fact that "default" (reuse font used before) font worked before in basic cases is an accident
			// - readers dealing smartly with brokenness of jsPDF's markup.
			out(
				'BT\n/' +
				activeFontKey + ' ' + activeFontSize + ' Tf\n' +     // font face, style, size
				(activeFontSize * lineHeightProportion) + ' TL\n' +  // line spacing
				textColor +
				'\n' + xtra + f2(x * k) + ' ' + f2((pageHeight - y) * k) + ' ' + mode + '\n(' +
				text +
				') Tj\nET');
			return this;
		};

		API.line = function(x1, y1, x2, y2) {
			return this.lines([[x2 - x1, y2 - y1]], x1, y1);
		};

		/**
		 * Adds series of curves (straight lines or cubic bezier curves) to canvas, starting at `x`, `y` coordinates.
		 * All data points in `lines` are relative to last line origin.
		 * `x`, `y` become x1,y1 for first line / curve in the set.
		 * For lines you only need to specify [x2, y2] - (ending point) vector against x1, y1 starting point.
		 * For bezier curves you need to specify [x2,y2,x3,y3,x4,y4] - vectors to control points 1, 2, ending point. All vectors are against the start of the curve - x1,y1.
		 *
		 * @example .lines([[2,2],[-2,2],[1,1,2,2,3,3],[2,1]], 212,110, 10) // line, line, bezier curve, line
		 * @param {Array} lines Array of *vector* shifts as pairs (lines) or sextets (cubic bezier curves).
		 * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
		 * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
		 * @param {Number} scale (Defaults to [1.0,1.0]) x,y Scaling factor for all vectors. Elements can be any floating number Sub-one makes drawing smaller. Over-one grows the drawing. Negative flips the direction.
		 * @param {String} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
		 * @param {Boolean} closed If true, the path is closed with a straight line from the end of the last curve to the starting point.
		 * @function
		 * @returns {jsPDF}
		 * @methodOf jsPDF#
		 * @name lines
		 */
		API.lines = function(lines, x, y, scale, style, closed) {
			var scalex,scaley,i,l,leg,x2,y2,x3,y3,x4,y4;

			// Pre-August-2012 the order of arguments was function(x, y, lines, scale, style)
			// in effort to make all calls have similar signature like
			//   function(content, coordinateX, coordinateY , miscellaneous)
			// this method had its args flipped.
			// code below allows backward compatibility with old arg order.
			if (typeof lines === 'number') {
				tmp = y;
				y = x;
				x = lines;
				lines = tmp;
			}

			scale = scale || [1, 1];

			// starting point
			out(f3(x * k) + ' ' + f3((pageHeight - y) * k) + ' m ');

			scalex = scale[0];
			scaley = scale[1];
			l = lines.length;
			//, x2, y2 // bezier only. In page default measurement "units", *after* scaling
			//, x3, y3 // bezier only. In page default measurement "units", *after* scaling
			// ending point for all, lines and bezier. . In page default measurement "units", *after* scaling
			x4 = x; // last / ending point = starting point for first item.
			y4 = y; // last / ending point = starting point for first item.

			for (i = 0; i < l; i++) {
				leg = lines[i];
				if (leg.length === 2) {
					// simple line
					x4 = leg[0] * scalex + x4; // here last x4 was prior ending point
					y4 = leg[1] * scaley + y4; // here last y4 was prior ending point
					out(f3(x4 * k) + ' ' + f3((pageHeight - y4) * k) + ' l');
				} else {
					// bezier curve
					x2 = leg[0] * scalex + x4; // here last x4 is prior ending point
					y2 = leg[1] * scaley + y4; // here last y4 is prior ending point
					x3 = leg[2] * scalex + x4; // here last x4 is prior ending point
					y3 = leg[3] * scaley + y4; // here last y4 is prior ending point
					x4 = leg[4] * scalex + x4; // here last x4 was prior ending point
					y4 = leg[5] * scaley + y4; // here last y4 was prior ending point
					out(
						f3(x2 * k) + ' ' +
						f3((pageHeight - y2) * k) + ' ' +
						f3(x3 * k) + ' ' +
						f3((pageHeight - y3) * k) + ' ' +
						f3(x4 * k) + ' ' +
						f3((pageHeight - y4) * k) + ' c');
				}
			}

			if (closed) {
				out(' h');
			}

			// stroking / filling / both the path
			if (style !== null) {
				out(getStyle(style));
			}
			return this;
		};

		/**
		 * Adds a rectangle to PDF
		 *
		 * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
		 * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
		 * @param {Number} w Width (in units declared at inception of PDF document)
		 * @param {Number} h Height (in units declared at inception of PDF document)
		 * @param {String} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
		 * @function
		 * @returns {jsPDF}
		 * @methodOf jsPDF#
		 * @name rect
		 */
		API.rect = function(x, y, w, h, style) {
			var op = getStyle(style);
			out([
					f2(x * k),
					f2((pageHeight - y) * k),
					f2(w * k),
					f2(-h * k),
					're'
				].join(' '));

			if (style !== null) {
				out(getStyle(style));
			}

			return this;
		};

		/**
		 * Adds a triangle to PDF
		 *
		 * @param {Number} x1 Coordinate (in units declared at inception of PDF document) against left edge of the page
		 * @param {Number} y1 Coordinate (in units declared at inception of PDF document) against upper edge of the page
		 * @param {Number} x2 Coordinate (in units declared at inception of PDF document) against left edge of the page
		 * @param {Number} y2 Coordinate (in units declared at inception of PDF document) against upper edge of the page
		 * @param {Number} x3 Coordinate (in units declared at inception of PDF document) against left edge of the page
		 * @param {Number} y3 Coordinate (in units declared at inception of PDF document) against upper edge of the page
		 * @param {String} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
		 * @function
		 * @returns {jsPDF}
		 * @methodOf jsPDF#
		 * @name triangle
		 */
		API.triangle = function(x1, y1, x2, y2, x3, y3, style) {
			this.lines(
				[
					[x2 - x1, y2 - y1], // vector to point 2
					[x3 - x2, y3 - y2], // vector to point 3
					[x1 - x3, y1 - y3]// closing vector back to point 1
				],
				x1,
				y1, // start of path
				[1, 1],
				style,
				true);
			return this;
		};

		/**
		 * Adds a rectangle with rounded corners to PDF
		 *
		 * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
		 * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
		 * @param {Number} w Width (in units declared at inception of PDF document)
		 * @param {Number} h Height (in units declared at inception of PDF document)
		 * @param {Number} rx Radius along x axis (in units declared at inception of PDF document)
		 * @param {Number} rx Radius along y axis (in units declared at inception of PDF document)
		 * @param {String} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
		 * @function
		 * @returns {jsPDF}
		 * @methodOf jsPDF#
		 * @name roundedRect
		 */
		API.roundedRect = function(x, y, w, h, rx, ry, style) {
			var MyArc = 4 / 3 * (Math.SQRT2 - 1);
			this.lines(
				[
					[(w - 2 * rx), 0],
					[(rx * MyArc), 0, rx, ry - (ry * MyArc), rx, ry],
					[0, (h - 2 * ry)],
					[0, (ry * MyArc),  - (rx * MyArc), ry, -rx, ry],
					[(-w + 2 * rx), 0],
					[ - (rx * MyArc), 0, -rx,  - (ry * MyArc), -rx, -ry],
					[0, (-h + 2 * ry)],
					[0,  - (ry * MyArc), (rx * MyArc), -ry, rx, -ry]
				],
				x + rx,
				y, // start of path
				[1, 1],
				style);
			return this;
		};

		/**
		 * Adds an ellipse to PDF
		 *
		 * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
		 * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
		 * @param {Number} rx Radius along x axis (in units declared at inception of PDF document)
		 * @param {Number} rx Radius along y axis (in units declared at inception of PDF document)
		 * @param {String} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
		 * @function
		 * @returns {jsPDF}
		 * @methodOf jsPDF#
		 * @name ellipse
		 */
		API.ellipse = function(x, y, rx, ry, style) {
			var lx = 4 / 3 * (Math.SQRT2 - 1) * rx,
				ly = 4 / 3 * (Math.SQRT2 - 1) * ry;

			out([
					f2((x + rx) * k),
					f2((pageHeight - y) * k),
					'm',
					f2((x + rx) * k),
					f2((pageHeight - (y - ly)) * k),
					f2((x + lx) * k),
					f2((pageHeight - (y - ry)) * k),
					f2(x * k),
					f2((pageHeight - (y - ry)) * k),
					'c'
				].join(' '));
			out([
					f2((x - lx) * k),
					f2((pageHeight - (y - ry)) * k),
					f2((x - rx) * k),
					f2((pageHeight - (y - ly)) * k),
					f2((x - rx) * k),
					f2((pageHeight - y) * k),
					'c'
				].join(' '));
			out([
					f2((x - rx) * k),
					f2((pageHeight - (y + ly)) * k),
					f2((x - lx) * k),
					f2((pageHeight - (y + ry)) * k),
					f2(x * k),
					f2((pageHeight - (y + ry)) * k),
					'c'
				].join(' '));
			out([
					f2((x + lx) * k),
					f2((pageHeight - (y + ry)) * k),
					f2((x + rx) * k),
					f2((pageHeight - (y + ly)) * k),
					f2((x + rx) * k),
					f2((pageHeight - y) * k),
					'c'
				].join(' '));

			if (style !== null) {
				out(getStyle(style));
			}

			return this;
		};

		/**
		 * Adds an circle to PDF
		 *
		 * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
		 * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
		 * @param {Number} r Radius (in units declared at inception of PDF document)
		 * @param {String} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
		 * @function
		 * @returns {jsPDF}
		 * @methodOf jsPDF#
		 * @name circle
		 */
		API.circle = function(x, y, r, style) {
			return this.ellipse(x, y, r, r, style);
		};

		/**
		 * Adds a properties to the PDF document
		 *
		 * @param {Object} A property_name-to-property_value object structure.
		 * @function
		 * @returns {jsPDF}
		 * @methodOf jsPDF#
		 * @name setProperties
		 */
		API.setProperties = function(properties) {
			// copying only those properties we can render.
			for (var property in documentProperties) {
				if (documentProperties.hasOwnProperty(property) && properties[property]) {
					documentProperties[property] = properties[property];
				}
			}
			return this;
		};

		/**
		 * Sets font size for upcoming text elements.
		 *
		 * @param {Number} size Font size in points.
		 * @function
		 * @returns {jsPDF}
		 * @methodOf jsPDF#
		 * @name setFontSize
		 */
		API.setFontSize = function(size) {
			activeFontSize = size;
			return this;
		};

		/**
		 * Sets text font face, variant for upcoming text elements.
		 * See output of jsPDF.getFontList() for possible font names, styles.
		 *
		 * @param {String} fontName Font name or family. Example: "times"
		 * @param {String} fontStyle Font style or variant. Example: "italic"
		 * @function
		 * @returns {jsPDF}
		 * @methodOf jsPDF#
		 * @name setFont
		 */
		API.setFont = function(fontName, fontStyle) {
			activeFontKey = getFont(fontName, fontStyle);
			// if font is not found, the above line blows up and we never go further
			return this;
		};

		/**
		 * Switches font style or variant for upcoming text elements,
		 * while keeping the font face or family same.
		 * See output of jsPDF.getFontList() for possible font names, styles.
		 *
		 * @param {String} style Font style or variant. Example: "italic"
		 * @function
		 * @returns {jsPDF}
		 * @methodOf jsPDF#
		 * @name setFontStyle
		 */
		API.setFontStyle = API.setFontType = function(style) {
			activeFontKey = getFont(undefined, style);
			// if font is not found, the above line blows up and we never go further
			return this;
		};

		/**
		 * Returns an object - a tree of fontName to fontStyle relationships available to
		 * active PDF document.
		 *
		 * @public
		 * @function
		 * @returns {Object} Like {'times':['normal', 'italic', ... ], 'arial':['normal', 'bold', ... ], ... }
		 * @methodOf jsPDF#
		 * @name getFontList
		 */
		API.getFontList = function() {
			// TODO: iterate over fonts array or return copy of fontmap instead in case more are ever added.
			var list = {},fontName,fontStyle,tmp;

			for (fontName in fontmap) {
				if (fontmap.hasOwnProperty(fontName)) {
					list[fontName] = tmp = [];
					for (fontStyle in fontmap[fontName]) {
						if (fontmap[fontName].hasOwnProperty(fontStyle)) {
							tmp.push(fontStyle);
						}
					}
				}
			}

			return list;
		};

		/**
		 * Sets line width for upcoming lines.
		 *
		 * @param {Number} width Line width (in units declared at inception of PDF document)
		 * @function
		 * @returns {jsPDF}
		 * @methodOf jsPDF#
		 * @name setLineWidth
		 */
		API.setLineWidth = function(width) {
			out((width * k).toFixed(2) + ' w');
			return this;
		};

		/**
		 * Sets the stroke color for upcoming elements.
		 *
		 * Depending on the number of arguments given, Gray, RGB, or CMYK
		 * color space is implied.
		 *
		 * When only ch1 is given, "Gray" color space is implied and it
		 * must be a value in the range from 0.00 (solid black) to to 1.00 (white)
		 * if values are communicated as String types, or in range from 0 (black)
		 * to 255 (white) if communicated as Number type.
		 * The RGB-like 0-255 range is provided for backward compatibility.
		 *
		 * When only ch1,ch2,ch3 are given, "RGB" color space is implied and each
		 * value must be in the range from 0.00 (minimum intensity) to to 1.00
		 * (max intensity) if values are communicated as String types, or
		 * from 0 (min intensity) to to 255 (max intensity) if values are communicated
		 * as Number types.
		 * The RGB-like 0-255 range is provided for backward compatibility.
		 *
		 * When ch1,ch2,ch3,ch4 are given, "CMYK" color space is implied and each
		 * value must be a in the range from 0.00 (0% concentration) to to
		 * 1.00 (100% concentration)
		 *
		 * Because JavaScript treats fixed point numbers badly (rounds to
		 * floating point nearest to binary representation) it is highly advised to
		 * communicate the fractional numbers as String types, not JavaScript Number type.
		 *
		 * @param {Number|String} ch1 Color channel value
		 * @param {Number|String} ch2 Color channel value
		 * @param {Number|String} ch3 Color channel value
		 * @param {Number|String} ch4 Color channel value
		 *
		 * @function
		 * @returns {jsPDF}
		 * @methodOf jsPDF#
		 * @name setDrawColor
		 */
		API.setDrawColor = function(ch1, ch2, ch3, ch4) {
			var color;
			if (ch2 === undefined || (ch4 === undefined && ch1 === ch2 === ch3)) {
				// Gray color space.
				if (typeof ch1 === 'string') {
					color = ch1 + ' G';
				} else {
					color = f2(ch1 / 255) + ' G';
				}
			} else if (ch4 === undefined) {
				// RGB
				if (typeof ch1 === 'string') {
					color = [ch1, ch2, ch3, 'RG'].join(' ');
				} else {
					color = [f2(ch1 / 255), f2(ch2 / 255), f2(ch3 / 255), 'RG'].join(' ');
				}
			} else {
				// CMYK
				if (typeof ch1 === 'string') {
					color = [ch1, ch2, ch3, ch4, 'K'].join(' ');
				} else {
					color = [f2(ch1), f2(ch2), f2(ch3), f2(ch4), 'K'].join(' ');
				}
			}

			out(color);
			return this;
		};

		/**
		 * Sets the fill color for upcoming elements.
		 *
		 * Depending on the number of arguments given, Gray, RGB, or CMYK
		 * color space is implied.
		 *
		 * When only ch1 is given, "Gray" color space is implied and it
		 * must be a value in the range from 0.00 (solid black) to to 1.00 (white)
		 * if values are communicated as String types, or in range from 0 (black)
		 * to 255 (white) if communicated as Number type.
		 * The RGB-like 0-255 range is provided for backward compatibility.
		 *
		 * When only ch1,ch2,ch3 are given, "RGB" color space is implied and each
		 * value must be in the range from 0.00 (minimum intensity) to to 1.00
		 * (max intensity) if values are communicated as String types, or
		 * from 0 (min intensity) to to 255 (max intensity) if values are communicated
		 * as Number types.
		 * The RGB-like 0-255 range is provided for backward compatibility.
		 *
		 * When ch1,ch2,ch3,ch4 are given, "CMYK" color space is implied and each
		 * value must be a in the range from 0.00 (0% concentration) to to
		 * 1.00 (100% concentration)
		 *
		 * Because JavaScript treats fixed point numbers badly (rounds to
		 * floating point nearest to binary representation) it is highly advised to
		 * communicate the fractional numbers as String types, not JavaScript Number type.
		 *
		 * @param {Number|String} ch1 Color channel value
		 * @param {Number|String} ch2 Color channel value
		 * @param {Number|String} ch3 Color channel value
		 * @param {Number|String} ch4 Color channel value
		 *
		 * @function
		 * @returns {jsPDF}
		 * @methodOf jsPDF#
		 * @name setFillColor
		 */
		API.setFillColor = function(ch1, ch2, ch3, ch4) {
			var color;

			if (ch2 === undefined || (ch4 === undefined && ch1 === ch2 === ch3)) {
				// Gray color space.
				if (typeof ch1 === 'string') {
					color = ch1 + ' g';
				} else {
					color = f2(ch1 / 255) + ' g';
				}
			} else if (ch4 === undefined) {
				// RGB
				if (typeof ch1 === 'string') {
					color = [ch1, ch2, ch3, 'rg'].join(' ');
				} else {
					color = [f2(ch1 / 255), f2(ch2 / 255), f2(ch3 / 255), 'rg'].join(' ');
				}
			} else {
				// CMYK
				if (typeof ch1 === 'string') {
					color = [ch1, ch2, ch3, ch4, 'k'].join(' ');
				} else {
					color = [f2(ch1), f2(ch2), f2(ch3), f2(ch4), 'k'].join(' ');
				}
			}

			out(color);
			return this;
		};

		/**
		 * Sets the text color for upcoming elements.
		 * If only one, first argument is given,
		 * treats the value as gray-scale color value.
		 *
		 * @param {Number} r Red channel color value in range 0-255 or {String} r color value in hexadecimal, example: '#FFFFFF'
		 * @param {Number} g Green channel color value in range 0-255
		 * @param {Number} b Blue channel color value in range 0-255
		 * @function
		 * @returns {jsPDF}
		 * @methodOf jsPDF#
		 * @name setTextColor
		 */
		API.setTextColor = function(r, g, b) {
			if ((typeof r === 'string') && /^#[0-9A-Fa-f]{6}$/.test(r)) {
				var hex = parseInt(r.substr(1), 16);
				r = (hex >> 16) & 255;
				g = (hex >> 8) & 255;
				b = (hex & 255);
			}

			if ((r === 0 && g === 0 && b === 0) || (typeof g === 'undefined')) {
				textColor = f3(r / 255) + ' g';
			} else {
				textColor = [f3(r / 255), f3(g / 255), f3(b / 255), 'rg'].join(' ');
			}
			return this;
		};

		/**
		 * Is an Object providing a mapping from human-readable to
		 * integer flag values designating the varieties of line cap
		 * and join styles.
		 *
		 * @returns {Object}
		 * @fieldOf jsPDF#
		 * @name CapJoinStyles
		 */
		API.CapJoinStyles = {
			0 : 0,
			'butt' : 0,
			'but' : 0,
			'miter' : 0,
			1 : 1,
			'round' : 1,
			'rounded' : 1,
			'circle' : 1,
			2 : 2,
			'projecting' : 2,
			'project' : 2,
			'square' : 2,
			'bevel' : 2
		};

		/**
		 * Sets the line cap styles
		 * See {jsPDF.CapJoinStyles} for variants
		 *
		 * @param {String|Number} style A string or number identifying the type of line cap
		 * @function
		 * @returns {jsPDF}
		 * @methodOf jsPDF#
		 * @name setLineCap
		 */
		API.setLineCap = function(style) {
			var id = this.CapJoinStyles[style];
			if (id === undefined) {
				throw new Error("Line cap style of '" + style + "' is not recognized. See or extend .CapJoinStyles property for valid styles");
			}
			lineCapID = id;
			out(id + ' J');

			return this;
		};

		/**
		 * Sets the line join styles
		 * See {jsPDF.CapJoinStyles} for variants
		 *
		 * @param {String|Number} style A string or number identifying the type of line join
		 * @function
		 * @returns {jsPDF}
		 * @methodOf jsPDF#
		 * @name setLineJoin
		 */
		API.setLineJoin = function(style) {
			var id = this.CapJoinStyles[style];
			if (id === undefined) {
				throw new Error("Line join style of '" + style + "' is not recognized. See or extend .CapJoinStyles property for valid styles");
			}
			lineJoinID = id;
			out(id + ' j');

			return this;
		};

		// Output is both an internal (for plugins) and external function
		API.output = output;

		/**
		 * Saves as PDF document. An alias of jsPDF.output('save', 'filename.pdf')
		 * @param  {String} filename The filename including extension.
		 *
		 * @function
		 * @returns {jsPDF}
		 * @methodOf jsPDF#
		 * @name save
		 */
		API.save = function(filename) {
			API.output('save', filename);
		};

		// applying plugins (more methods) ON TOP of built-in API.
		// this is intentional as we allow plugins to override
		// built-ins
		for (var plugin in jsPDF.API) {
			if (jsPDF.API.hasOwnProperty(plugin)) {
				if (plugin === 'events' && jsPDF.API.events.length) {
					(function(events, newEvents) {

						// jsPDF.API.events is a JS Array of Arrays
						// where each Array is a pair of event name, handler
						// Events were added by plugins to the jsPDF instantiator.
						// These are always added to the new instance and some ran
						// during instantiation.
						var eventname,handler_and_args,i;

						for (i = newEvents.length - 1; i !== -1; i--) {
							// subscribe takes 3 args: 'topic', function, runonce_flag
							// if undefined, runonce is false.
							// users can attach callback directly,
							// or they can attach an array with [callback, runonce_flag]
							// that's what the "apply" magic is for below.
							eventname = newEvents[i][0];
							handler_and_args = newEvents[i][1];
							events.subscribe.apply(
								events,
								[eventname].concat(
									typeof handler_and_args === 'function' ?
										[handler_and_args] : handler_and_args));
						}
					}(events, jsPDF.API.events));
				} else {
					API[plugin] = jsPDF.API[plugin];
				}
			}
		}

		//////////////////////////////////////////////////////
		// continuing initialization of jsPDF Document object
		//////////////////////////////////////////////////////
		// Add the first page automatically
		addFonts();
		activeFontKey = 'F1';
		_addPage();

		events.publish('initialized');
		return API;
	}

	/**
	 * jsPDF.API is a STATIC property of jsPDF class.
	 * jsPDF.API is an object you can add methods and properties to.
	 * The methods / properties you add will show up in new jsPDF objects.
	 *
	 * One property is prepopulated. It is the 'events' Object. Plugin authors can add topics,
	 * callbacks to this object. These will be reassigned to all new instances of jsPDF.
	 * Examples:
	 * jsPDF.API.events['initialized'] = function(){ 'this' is API object }
	 * jsPDF.API.events['addFont'] = function(added_font_object){ 'this' is API object }
	 *
	 * @static
	 * @public
	 * @memberOf jsPDF
	 * @name API
	 *
	 * @example
	 * jsPDF.API.mymethod = function(){
	 *   // 'this' will be ref to internal API object. see jsPDF source
	 *   // , so you can refer to built-in methods like so:
	 *   //     this.line(....)
	 *   //     this.text(....)
	 * }
	 * var pdfdoc = new jsPDF()
	 * pdfdoc.mymethod() // <- !!!!!!
	 */
	jsPDF.API = {events:[]};
	jsPDF.version = "1.0.0-trunk";

	if (typeof define === 'function' && define.amd) {
		define(function() {
			return jsPDF;
		});
	} else {
		global.jsPDF = jsPDF;
	}
	return jsPDF;
}(typeof self !== "undefined" && self || typeof window !== "undefined" && window || this));

/** @preserve
 * jsPDF fromHTML plugin. BETA stage. API subject to change. Needs browser
 * Copyright (c) 2012 Willow Systems Corporation, willow-systems.com
 *               2014 Juan Pablo Gaviria, https://github.com/juanpgaviria
 *               2014 Diego Casorran, https://github.com/diegocr
 *               2014 Daniel Husar, https://github.com/danielhusar
 *               2014 Wolfgang Gassler, https://github.com/woolfg
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ====================================================================
 */

(function (jsPDFAPI) {
	var clone,
	DrillForContent,
	FontNameDB,
	FontStyleMap,
	FontWeightMap,
	FloatMap,
	ClearMap,
	GetCSS,
	PurgeWhiteSpace,
	Renderer,
	ResolveFont,
	ResolveUnitedNumber,
	UnitedNumberMap,
	elementHandledElsewhere,
	images,
	loadImgs,
	checkForFooter,
	process,
	tableToJson;
	clone = (function () {
		return function (obj) {
			Clone.prototype = obj;
			return new Clone()
		};
		function Clone() {}
	})();
	PurgeWhiteSpace = function (array) {
		var fragment,
		i,
		l,
		lTrimmed,
		r,
		rTrimmed,
		trailingSpace;
		i = 0;
		l = array.length;
		fragment = void 0;
		lTrimmed = false;
		rTrimmed = false;
		while (!lTrimmed && i !== l) {
			fragment = array[i] = array[i].trimLeft();
			if (fragment) {
				lTrimmed = true;
			}
			i++;
		}
		i = l - 1;
		while (l && !rTrimmed && i !== -1) {
			fragment = array[i] = array[i].trimRight();
			if (fragment) {
				rTrimmed = true;
			}
			i--;
		}
		r = /\s+$/g;
		trailingSpace = true;
		i = 0;
		while (i !== l) {
			fragment = array[i].replace(/\s+/g, " ");
			if (trailingSpace) {
				fragment = fragment.trimLeft();
			}
			if (fragment) {
				trailingSpace = r.test(fragment);
			}
			array[i] = fragment;
			i++;
		}
		return array;
	};
	Renderer = function (pdf, x, y, settings) {
		this.pdf = pdf;
		this.x = x;
		this.y = y;
		this.settings = settings;
		//list of functions which are called after each element-rendering process
		this.watchFunctions = [];
		this.init();
		return this;
	};
	ResolveFont = function (css_font_family_string) {
		var name,
		part,
		parts;
		name = void 0;
		parts = css_font_family_string.split(",");
		part = parts.shift();
		while (!name && part) {
			name = FontNameDB[part.trim().toLowerCase()];
			part = parts.shift();
		}
		return name;
	};
	ResolveUnitedNumber = function (css_line_height_string) {

		//IE8 issues
		css_line_height_string = css_line_height_string === "auto" ? "0px" : css_line_height_string;
		if (css_line_height_string.indexOf("em") > -1 && !isNaN(Number(css_line_height_string.replace("em", "")))) {
			css_line_height_string = Number(css_line_height_string.replace("em", "")) * 18.719 + "px";
		}
		if (css_line_height_string.indexOf("pt") > -1 && !isNaN(Number(css_line_height_string.replace("pt", "")))) {
			css_line_height_string = Number(css_line_height_string.replace("pt", "")) * 1.333 + "px";
		}

		var normal,
		undef,
		value;
		undef = void 0;
		normal = 16.00;
		value = UnitedNumberMap[css_line_height_string];
		if (value) {
			return value;
		}
		value = {
			"xx-small"  :  9,
			"x-small"   : 11,
			small       : 13,
			medium      : 16,
			large       : 19,
			"x-large"   : 23,
			"xx-large"  : 28,
			auto        :  0
		}[{ css_line_height_string : css_line_height_string }];

		if (value !== undef) {
			return UnitedNumberMap[css_line_height_string] = value / normal;
		}
		if (value = parseFloat(css_line_height_string)) {
			return UnitedNumberMap[css_line_height_string] = value / normal;
		}
		value = css_line_height_string.match(/([\d\.]+)(px)/);
		if (value.length === 3) {
			return UnitedNumberMap[css_line_height_string] = parseFloat(value[1]) / normal;
		}
		return UnitedNumberMap[css_line_height_string] = 1;
	};
	GetCSS = function (element) {
		var css,
		tmp,
		computedCSSElement;
		computedCSSElement = (function (el) {
			var compCSS;
			compCSS = (function (el) {
				if (document.defaultView && document.defaultView.getComputedStyle) {
					return document.defaultView.getComputedStyle(el, null);
				} else if (el.currentStyle) {
					return el.currentStyle;
				} else {
					return el.style;
				}
			})(el);
			return function (prop) {
				prop = prop.replace(/-\D/g, function (match) {
					return match.charAt(1).toUpperCase();
				});
				return compCSS[prop];
			};
		})(element);
		css = {};
		tmp = void 0;
		css["font-family"] = ResolveFont(computedCSSElement("font-family")) || "times";
		css["font-style"] = FontStyleMap[computedCSSElement("font-style")] || "normal";
		css["text-align"] = TextAlignMap[computedCSSElement("text-align")] || "left";
		tmp = FontWeightMap[computedCSSElement("font-weight")] || "normal";
		if (tmp === "bold") {
			if (css["font-style"] === "normal") {
				css["font-style"] = tmp;
			} else {
				css["font-style"] = tmp + css["font-style"];
			}
		}
		css["font-size"] = ResolveUnitedNumber(computedCSSElement("font-size")) || 1;
		css["line-height"] = ResolveUnitedNumber(computedCSSElement("line-height")) || 1;
		css["display"] = (computedCSSElement("display") === "inline" ? "inline" : "block");
		if (css["display"] === "block") {
			css["margin-top"] = ResolveUnitedNumber(computedCSSElement("margin-top")) || 0;
			css["margin-bottom"] = ResolveUnitedNumber(computedCSSElement("margin-bottom")) || 0;
			css["padding-top"] = ResolveUnitedNumber(computedCSSElement("padding-top")) || 0;
			css["padding-bottom"] = ResolveUnitedNumber(computedCSSElement("padding-bottom")) || 0;
			css["margin-left"] = ResolveUnitedNumber(computedCSSElement("margin-left")) || 0;
			css["margin-right"] = ResolveUnitedNumber(computedCSSElement("margin-right")) || 0;
			css["padding-left"] = ResolveUnitedNumber(computedCSSElement("padding-left")) || 0;
			css["padding-right"] = ResolveUnitedNumber(computedCSSElement("padding-right")) || 0;
		}
		//float and clearing of floats
		css["float"] = FloatMap[computedCSSElement("cssFloat")] || "none";
		css["clear"] = ClearMap[computedCSSElement("clear")] || "none";
		return css;
	};
	elementHandledElsewhere = function (element, renderer, elementHandlers) {
		var handlers,
		i,
		isHandledElsewhere,
		l,
		t;
		isHandledElsewhere = false;
		i = void 0;
		l = void 0;
		t = void 0;
		handlers = elementHandlers["#" + element.id];
		if (handlers) {
			if (typeof handlers === "function") {
				isHandledElsewhere = handlers(element, renderer);
			} else {
				i = 0;
				l = handlers.length;
				while (!isHandledElsewhere && i !== l) {
					isHandledElsewhere = handlers[i](element, renderer);
					i++;
				}
			}
		}
		handlers = elementHandlers[element.nodeName];
		if (!isHandledElsewhere && handlers) {
			if (typeof handlers === "function") {
				isHandledElsewhere = handlers(element, renderer);
			} else {
				i = 0;
				l = handlers.length;
				while (!isHandledElsewhere && i !== l) {
					isHandledElsewhere = handlers[i](element, renderer);
					i++;
				}
			}
		}
		return isHandledElsewhere;
	};
	tableToJson = function (table, renderer) {
		var data,
		headers,
		i,
		j,
		rowData,
		tableRow,
		table_obj,
		table_with,
		cell,
		l;
		data = [];
		headers = [];
		i = 0;
		l = table.rows[0].cells.length;
		table_with = table.clientWidth;
		while (i < l) {
			cell = table.rows[0].cells[i];
			headers[i] = {
				name : cell.textContent.toLowerCase().replace(/\s+/g, ''),
				prompt : cell.textContent.replace(/\r?\n/g, ''),
				width : (cell.clientWidth / table_with) * renderer.pdf.internal.pageSize.width
			};
			i++;
		}
		i = 1;
		while (i < table.rows.length) {
			tableRow = table.rows[i];
			rowData = {};
			j = 0;
			while (j < tableRow.cells.length) {
				rowData[headers[j].name] = tableRow.cells[j].textContent.replace(/\r?\n/g, '');
				j++;
			}
			data.push(rowData);
			i++;
		}
		return table_obj = {
			rows : data,
			headers : headers
		};
	};
	var SkipNode = {
		SCRIPT   : 1,
		STYLE    : 1,
		NOSCRIPT : 1,
		OBJECT   : 1,
		EMBED    : 1,
		SELECT   : 1
	};
	var listCount = 1;
	DrillForContent = function (element, renderer, elementHandlers) {
		var cn,
		cns,
		fragmentCSS,
		i,
		isBlock,
		l,
		px2pt,
		table2json,
		cb;
		cns = element.childNodes;
		cn = void 0;
		fragmentCSS = GetCSS(element);
		isBlock = fragmentCSS.display === "block";
		if (isBlock) {
			renderer.setBlockBoundary();
			renderer.setBlockStyle(fragmentCSS);
		}
		px2pt = 0.264583 * 72 / 25.4;
		i = 0;
		l = cns.length;
		while (i < l) {
			cn = cns[i];
			if (typeof cn === "object") {
				
				//execute all watcher functions to e.g. reset floating
				renderer.executeWatchFunctions(cn);

				/*** HEADER rendering **/
				if (cn.nodeType === 1 && cn.nodeName === 'HEADER') {
					var header = cn;
					//store old top margin
					var oldMarginTop = renderer.pdf.margins_doc.top;
					//subscribe for new page event and render header first on every page
					renderer.pdf.internal.events.subscribe('addPage', function (pageInfo) {
						//set current y position to old margin
						renderer.y = oldMarginTop;
						//render all child nodes of the header element
						DrillForContent(header, renderer, elementHandlers);
						//set margin to old margin + rendered header + 10 space to prevent overlapping
						//important for other plugins (e.g. table) to start rendering at correct position after header
						renderer.pdf.margins_doc.top = renderer.y + 10;
						renderer.y += 10;
					}, false);
				}

				if (cn.nodeType === 8 && cn.nodeName === "#comment") {
					if (~cn.textContent.indexOf("ADD_PAGE")) {
						renderer.pdf.addPage();
						renderer.y = renderer.pdf.margins_doc.top;
					}
					
				} else if (cn.nodeType === 1 && !SkipNode[cn.nodeName]) {
					/*** IMAGE RENDERING ***/
					if (cn.nodeName === "IMG" && images[cn.getAttribute("src")]) {
						if ((renderer.pdf.internal.pageSize.height - renderer.pdf.margins_doc.bottom < renderer.y + cn.height) && (renderer.y > renderer.pdf.margins_doc.top)) {
							renderer.pdf.addPage();
							renderer.y = renderer.pdf.margins_doc.top;
							//check if we have to set back some values due to e.g. header rendering for new page
							renderer.executeWatchFunctions(cn);
						}				
						
						var imagesCSS = GetCSS(cn);
						var imageX = renderer.x;
						var fontToUnitRatio = 12 / renderer.pdf.internal.scaleFactor;
						
						//define additional paddings, margins which have to be taken into account for margin calculations
						var additionalSpaceLeft = (imagesCSS["margin-left"] + imagesCSS["padding-left"])*fontToUnitRatio;
						var additionalSpaceRight = (imagesCSS["margin-right"] + imagesCSS["padding-right"])*fontToUnitRatio;
						var additionalSpaceTop = (imagesCSS["margin-top"] + imagesCSS["padding-top"])*fontToUnitRatio;
						var additionalSpaceBottom = (imagesCSS["margin-bottom"] + imagesCSS["padding-bottom"])*fontToUnitRatio;
		
						//if float is set to right, move the image to the right border
						//add space if margin is set
						if (imagesCSS['float'] !== undefined && imagesCSS['float'] === 'right') {
							imageX += renderer.settings.width - cn.width - additionalSpaceRight;
						} else {
							imageX +=  additionalSpaceLeft;
						}

						renderer.pdf.addImage(images[cn.getAttribute("src")], imageX, renderer.y + additionalSpaceTop, cn.width, cn.height);
						//if the float prop is specified we have to float the text around the image
						if (imagesCSS['float'] !== undefined) {
							if (imagesCSS['float'] === 'right' || imagesCSS['float'] === 'left') {

								//add functiont to set back coordinates after image rendering
								renderer.watchFunctions.push((function(diffX , thresholdY, diffWidth, el) {
									//undo drawing box adaptions which were set by floating
									if (renderer.y >= thresholdY) {
										renderer.x += diffX;
										renderer.settings.width += diffWidth;
										return true;
									} else if(el && el.nodeType === 1 && !SkipNode[el.nodeName] && renderer.x+el.width > (renderer.pdf.margins_doc.left + renderer.pdf.margins_doc.width)) {
										renderer.x += diffX;
										renderer.y = thresholdY;
										renderer.settings.width += diffWidth;
										return true;
									} else {
										return false;
									}
								}).bind(this, (imagesCSS['float'] === 'left') ? -cn.width-additionalSpaceLeft-additionalSpaceRight : 0, renderer.y+cn.height+additionalSpaceTop+additionalSpaceBottom, cn.width));

								//reset floating by clear:both divs
								//just set cursorY after the floating element
								renderer.watchFunctions.push((function(yPositionAfterFloating, pages, el) {
									if (renderer.y < yPositionAfterFloating && pages === renderer.pdf.internal.getNumberOfPages()) {
										if (el.nodeType === 1 && GetCSS(el).clear === 'both') { 
											renderer.y = yPositionAfterFloating;
											return true;
										} else {
											return false;
										}
									} else {
										return true;
									}
								}).bind(this, renderer.y+cn.height, renderer.pdf.internal.getNumberOfPages()));

								//if floating is set we decrease the available width by the image width
								renderer.settings.width -= cn.width+additionalSpaceLeft+additionalSpaceRight;
								//if left just add the image width to the X coordinate
								if (imagesCSS['float'] === 'left') {
									renderer.x += cn.width+additionalSpaceLeft+additionalSpaceRight;
								}
							}
						//if no floating is set, move the rendering cursor after the image height
						} else {
							renderer.y += cn.height + additionalSpaceBottom;
						}					
					
					/*** TABLE RENDERING ***/	
					} else if (cn.nodeName === "TABLE") {
						table2json = tableToJson(cn, renderer);
						renderer.y += 10;
						renderer.pdf.table(renderer.x, renderer.y, table2json.rows, table2json.headers, {
							autoSize : false,
							printHeaders : true,
							margins : renderer.pdf.margins_doc
						});
						renderer.y = renderer.pdf.lastCellPos.y + renderer.pdf.lastCellPos.h + 20;
					} else if (cn.nodeName === "OL" || cn.nodeName === "UL") {
						listCount = 1;
						if (!elementHandledElsewhere(cn, renderer, elementHandlers)) {
							DrillForContent(cn, renderer, elementHandlers);
						}
						renderer.y += 10;
					} else if (cn.nodeName === "LI") {
						var temp = renderer.x;
						renderer.x += cn.parentNode.nodeName === "UL" ? 22 : 10;
						renderer.y += 3;
						if (!elementHandledElsewhere(cn, renderer, elementHandlers)) {
							DrillForContent(cn, renderer, elementHandlers);
						}
						renderer.x = temp;
					} else {
						if (!elementHandledElsewhere(cn, renderer, elementHandlers)) {
							DrillForContent(cn, renderer, elementHandlers);
						}
					}
				} else if (cn.nodeType === 3) {
					var value = cn.nodeValue;
					if (cn.nodeValue && cn.parentNode.nodeName === "LI") {
						if (cn.parentNode.parentNode.nodeName === "OL") {
							value = listCount++ + '. ' + value;
						} else {
							var fontPx = fragmentCSS["font-size"] * 16;
							var radius = 2;
							if (fontPx > 20) {
								radius = 3;
							}
							cb = function (x, y) {
								this.pdf.circle(x, y, radius, 'FD');
							};
						}
					}
					renderer.addText(value, fragmentCSS);
				} else if (typeof cn === "string") {
					renderer.addText(cn, fragmentCSS);
				}
			}
			i++;
		}

		if (isBlock) {
			return renderer.setBlockBoundary(cb);
		}
	};
	images = {};
	loadImgs = function (element, renderer, elementHandlers, cb) {
		var imgs = element.getElementsByTagName('img'),
		l = imgs.length,
		x = 0;
		function done() {
			renderer.pdf.internal.events.publish('imagesLoaded');
			cb();
		}
		function loadImage(url, width, height) {
			if (!url)
				return;
			var img = new Image();
			++x;
			img.crossOrigin = '';
			img.onerror = img.onload = function () {
				if(img.complete) {
					//to support data urls in images, set width and height
					//as those values are not recognized automatically
					if (img.src.indexOf('data:image/') === 0) {
						img.width = width || img.width || 0;
						img.height = height || img.height || 0;
					}
					//if valid image add to known images array
					if (img.width + img.height) {
					//TODO: use a hash since data URIs could greatly increase the memory usage
						images[url] = images[url] || img;
					}
				}
				if(!--x) {
					done();
				}
			};
			img.src = url;
		}
		while (l--)
			loadImage(imgs[l].getAttribute("src"),imgs[l].width,imgs[l].height);
		return x || done();
	};
	checkForFooter = function (elem, renderer, elementHandlers, callback) {
		//check if we can found a <footer> element
		var footer = elem.getElementsByTagName("footer");
		if (footer.length > 0) {

			footer = footer[0];

			//bad hack to get height of footer
			//creat dummy out and check new y after fake rendering
			var oldOut = renderer.pdf.internal.write;
			var oldY = renderer.y;
			renderer.pdf.internal.write = function () {};
			DrillForContent(footer, renderer, elementHandlers);
			var footerHeight = Math.ceil(renderer.y - oldY) + 5;
			renderer.y = oldY;
			renderer.pdf.internal.write = oldOut;

			//add 20% to prevent overlapping
			renderer.pdf.margins_doc.bottom += footerHeight;

			//Create function render header on every page
			var renderFooter = function (pageInfo) {
				var pageNumber = pageInfo !== undefined ? pageInfo.pageNumber : 1;
				//set current y position to old margin
				var oldPosition = renderer.y;
				//render all child nodes of the header element
				renderer.y = renderer.pdf.internal.pageSize.height - renderer.pdf.margins_doc.bottom;
				renderer.pdf.margins_doc.bottom -= footerHeight;

				//check if we have to add page numbers
				var spans = footer.getElementsByTagName('span');
				for (var i = 0; i < spans.length; ++i) {
					//if we find some span element with class pageCounter, set the page
					if ((" " + spans[i].className + " ").replace(/[\n\t]/g, " ").indexOf(" pageCounter ") > -1) {
						spans[i].innerHTML = pageNumber;
					}
					//if we find some span element with class totalPages, set a variable which is replaced after rendering of all pages
					if ((" " + spans[i].className + " ").replace(/[\n\t]/g, " ").indexOf(" totalPages ") > -1) {
						spans[i].innerHTML = '###jsPDFVarTotalPages###';
					}
				}

				//render footer content
				DrillForContent(footer, renderer, elementHandlers);
				//set bottom margin to previous height including the footer height
				renderer.pdf.margins_doc.bottom += footerHeight;
				//important for other plugins (e.g. table) to start rendering at correct position after header
				renderer.y = oldPosition;
			};

			//check if footer contains totalPages which shoudl be replace at the disoposal of the document
			var spans = footer.getElementsByTagName('span');
			for (var i = 0; i < spans.length; ++i) {
				if ((" " + spans[i].className + " ").replace(/[\n\t]/g, " ").indexOf(" totalPages ") > -1) {
					renderer.pdf.internal.events.subscribe('htmlRenderingFinished', renderer.pdf.putTotalPages.bind(renderer.pdf, '###jsPDFVarTotalPages###'), true);
				}
			}

			//register event to render footer on every new page
			renderer.pdf.internal.events.subscribe('addPage', renderFooter, false);
			//render footer on first page
			renderFooter();

			//prevent footer rendering
			SkipNode['FOOTER'] = 1;

		}

		//footer preparation finished
		callback();
	};
	process = function (pdf, element, x, y, settings, callback) {
		if (!element)
			return false;
		if (typeof element !== "string" && !element.parentNode)
			element = '' + element.innerHTML;
		if (typeof element === "string") {
			element = (function (element) {
				var $frame,
				$hiddendiv,
				framename,
				visuallyhidden;
				framename = "jsPDFhtmlText" + Date.now().toString() + (Math.random() * 1000).toFixed(0);
				visuallyhidden = "position: absolute !important;" + "clip: rect(1px 1px 1px 1px); /* IE6, IE7 */" + "clip: rect(1px, 1px, 1px, 1px);" + "padding:0 !important;" + "border:0 !important;" + "height: 1px !important;" + "width: 1px !important; " + "top:auto;" + "left:-100px;" + "overflow: hidden;";
				$hiddendiv = document.createElement('div');
				$hiddendiv.style.cssText = visuallyhidden;
				$hiddendiv.innerHTML = "<iframe style=\"height:1px;width:1px\" name=\"" + framename + "\" />";
				document.body.appendChild($hiddendiv);
				$frame = window.frames[framename];
				$frame.document.body.innerHTML = element;
				return $frame.document.body;
			})(element.replace(/<\/?script[^>]*?>/gi, ''));
		}
		var r = new Renderer(pdf, x, y, settings);
		callback = callback || function () {};

		// 1. load images
		// 2. prepare optional footer elements
		// 3. render content
		loadImgs.call(this, element, r, settings.elementHandlers, function () {
			checkForFooter.call(this, element, r, settings.elementHandlers, function () {
				DrillForContent(element, r, settings.elementHandlers);
				//send event dispose for final taks (e.g. footer totalpage replacement)
				r.pdf.internal.events.publish('htmlRenderingFinished');
				callback(r.dispose());
			});
		});

		return r.dispose();
	};
	Renderer.prototype.init = function () {
		this.paragraph = {
			text : [],
			style : []
		};
		return this.pdf.internal.write("q");
	};
	Renderer.prototype.dispose = function () {
		this.pdf.internal.write("Q");
		return {
			x : this.x,
			y : this.y
		};
	};
	
	//Checks if we have to execute some watcher functions
	//e.g. to end text floating around an image
	Renderer.prototype.executeWatchFunctions = function(el) {
		var ret = false;
		var narray = [];
		if (this.watchFunctions.length > 0) {
			for(var i=0; i< this.watchFunctions.length; ++i) {
				if (this.watchFunctions[i](el) === true) {
					ret = true;
				} else {
					narray.push(this.watchFunctions[i]);
				}
			}
			this.watchFunctions = narray;
		}
		return ret;
	};	

	Renderer.prototype.splitFragmentsIntoLines = function (fragments, styles) {
		var currentLineLength,
		defaultFontSize,
		ff,
		fontMetrics,
		fontMetricsCache,
		fragment,
		fragmentChopped,
		fragmentLength,
		fragmentSpecificMetrics,
		fs,
		k,
		line,
		lines,
		maxLineLength,
		style;
		defaultFontSize = 12;
		k = this.pdf.internal.scaleFactor;
		fontMetricsCache = {};
		ff = void 0;
		fs = void 0;
		fontMetrics = void 0;
		fragment = void 0;
		style = void 0;
		fragmentSpecificMetrics = void 0;
		fragmentLength = void 0;
		fragmentChopped = void 0;
		line = [];
		lines = [line];
		currentLineLength = 0;
		maxLineLength = this.settings.width;
		while (fragments.length) {
			fragment = fragments.shift();
			style = styles.shift();
			if (fragment) {
				ff = style["font-family"];
				fs = style["font-style"];

				fontMetrics = fontMetricsCache[ff + fs];
				if (!fontMetrics) {
					fontMetrics = this.pdf.internal.getFont(ff, fs).metadata.Unicode;
					fontMetricsCache[ff + fs] = fontMetrics;
				}
				fragmentSpecificMetrics = {
					widths : fontMetrics.widths,
					kerning : fontMetrics.kerning,
					fontSize : style["font-size"] * defaultFontSize,
					textIndent : currentLineLength
				};
				fragmentLength = this.pdf.getStringUnitWidth(fragment, fragmentSpecificMetrics) * fragmentSpecificMetrics.fontSize / k;
				if (currentLineLength + fragmentLength > maxLineLength) {
					fragmentChopped = this.pdf.splitTextToSize(fragment, maxLineLength, fragmentSpecificMetrics);
					line.push([fragmentChopped.shift(), style]);
					while (fragmentChopped.length) {
						line = [[fragmentChopped.shift(), style]];
						lines.push(line);
					}
					currentLineLength = this.pdf.getStringUnitWidth(line[0][0], fragmentSpecificMetrics) * fragmentSpecificMetrics.fontSize / k;
				} else {
					line.push([fragment, style]);
					currentLineLength += fragmentLength;
				}
			}
		}

		//if text alignment was set, set margin/indent of each line
		if (style['text-align'] !== undefined && (style['text-align'] === 'center' || style['text-align'] === 'right' || style['text-align'] === 'justify')) {
			for (var i = 0; i < lines.length; ++i) {
				var length = this.pdf.getStringUnitWidth(lines[i][0][0], fragmentSpecificMetrics) * fragmentSpecificMetrics.fontSize / k;
				//if there is more than on line we have to clone the style object as all lines hold a reference on this object
				if (i > 0) {
					lines[i][0][1] = clone(lines[i][0][1]);
				}
				var space = (maxLineLength - length);

				if (style['text-align'] === 'right') {
					lines[i][0][1]['margin-left'] = space;
					//if alignment is not right, it has to be center so split the space to the left and the right
				} else if (style['text-align'] === 'center') {
					lines[i][0][1]['margin-left'] = space / 2;
					//if justify was set, calculate the word spacing and define in by using the css property
				} else if (style['text-align'] === 'justify') {
					var countSpaces = lines[i][0][0].split(' ').length - 1;
					lines[i][0][1]['word-spacing'] = space / countSpaces;
					//ignore the last line in justify mode
					if (i === (lines.length - 1)) {
						lines[i][0][1]['word-spacing'] = 0;
					}
				}
			}
		}

		return lines;
	};
	Renderer.prototype.RenderTextFragment = function (text, style) {
		var defaultFontSize,
		font,
		maxLineHeight;

		maxLineHeight = 0;
		defaultFontSize = 12;

		if (this.pdf.internal.pageSize.height - this.pdf.margins_doc.bottom < this.y + this.pdf.internal.getFontSize()) {
			this.pdf.internal.write("ET", "Q");
			this.pdf.addPage();
			this.y = this.pdf.margins_doc.top;
			this.pdf.internal.write("q", "BT", this.pdf.internal.getCoordinateString(this.x), this.pdf.internal.getVerticalCoordinateString(this.y), "Td");
			//move cursor by one line on new page
			maxLineHeight = Math.max(maxLineHeight, style["line-height"], style["font-size"]);
			this.pdf.internal.write(0, (-1 * defaultFontSize * maxLineHeight).toFixed(2), "Td");
		}

		font = this.pdf.internal.getFont(style["font-family"], style["font-style"]);

		//set the word spacing for e.g. justify style
		if (style['word-spacing'] !== undefined && style['word-spacing'] > 0) {
			this.pdf.internal.write(style['word-spacing'].toFixed(2), "Tw");
		}

		this.pdf.internal.write("/" + font.id, (defaultFontSize * style["font-size"]).toFixed(2), "Tf", "(" + this.pdf.internal.pdfEscape(text) + ") Tj");

		//set the word spacing back to neutral => 0
		if (style['word-spacing'] !== undefined) {
			this.pdf.internal.write(0, "Tw");
		}
	};
	Renderer.prototype.renderParagraph = function (cb) {
		var blockstyle,
		defaultFontSize,
		fontToUnitRatio,
		fragments,
		i,
		l,
		line,
		lines,
		maxLineHeight,
		out,
		paragraphspacing_after,
		paragraphspacing_before,
		priorblockstype,
		styles,
		fontSize;
		fragments = PurgeWhiteSpace(this.paragraph.text);
		styles = this.paragraph.style;
		blockstyle = this.paragraph.blockstyle;
		priorblockstype = this.paragraph.blockstyle || {};
		this.paragraph = {
			text : [],
			style : [],
			blockstyle : {},
			priorblockstyle : blockstyle
		};
		if (!fragments.join("").trim()) {
			return;
		}
		lines = this.splitFragmentsIntoLines(fragments, styles);
		line = void 0;
		maxLineHeight = void 0;
		defaultFontSize = 12;
		fontToUnitRatio = defaultFontSize / this.pdf.internal.scaleFactor;
		paragraphspacing_before = (Math.max((blockstyle["margin-top"] || 0) - (priorblockstype["margin-bottom"] || 0), 0) + (blockstyle["padding-top"] || 0)) * fontToUnitRatio;
		paragraphspacing_after = ((blockstyle["margin-bottom"] || 0) + (blockstyle["padding-bottom"] || 0)) * fontToUnitRatio;
		out = this.pdf.internal.write;
		i = void 0;
		l = void 0;
		this.y += paragraphspacing_before;
		out("q", "BT", this.pdf.internal.getCoordinateString(this.x), this.pdf.internal.getVerticalCoordinateString(this.y), "Td");

		//stores the current indent of cursor position
		var currentIndent = 0;
		
		while (lines.length) {
			line = lines.shift();
			maxLineHeight = 0;
			i = 0;
			l = line.length;
			while (i !== l) {
				if (line[i][0].trim()) {
					maxLineHeight = Math.max(maxLineHeight, line[i][1]["line-height"], line[i][1]["font-size"]);
					fontSize = line[i][1]["font-size"] * 7;
				}
				i++;
			}
			//if we have to move the cursor to adapt the indent
			var indentMove = 0;
			//if a margin was added (by e.g. a text-alignment), move the cursor
			if (line[0][1]["margin-left"] !== undefined && line[0][1]["margin-left"] > 0) {
				wantedIndent = this.pdf.internal.getCoordinateString(line[0][1]["margin-left"]);
				indentMove = wantedIndent - currentIndent;
				currentIndent = wantedIndent;
			}
			//move the cursor
			out(indentMove, (-1 * defaultFontSize * maxLineHeight).toFixed(2), "Td");
			i = 0;
			l = line.length;
			while (i !== l) {
				if (line[i][0]) {
					this.RenderTextFragment(line[i][0], line[i][1]);
				}
				i++;
			}
			this.y += maxLineHeight * fontToUnitRatio;
			
			//if some watcher function was executed sucessful, so e.g. margin and widths were changed,
			//reset line drawing and calculate position and lines again
			//e.g. to stop text floating around an image
			if (this.executeWatchFunctions(line[0][1]) && lines.length > 0) {
				var localFragments = [];
				var localStyles = [];
				//create fragement array of 
				lines.forEach(function(localLine) {
					var i = 0;
					var l = localLine.length;
					while (i !== l) {
						if (localLine[i][0]) {
							localFragments.push(localLine[i][0]+' '); 
							localStyles.push(localLine[i][1]);
						}
						++i;
					}
				});
				//split lines again due to possible coordinate changes
				lines = this.splitFragmentsIntoLines(PurgeWhiteSpace(localFragments), localStyles);
				//reposition the current cursor
				out("ET", "Q");				
				out("q", "BT", this.pdf.internal.getCoordinateString(this.x), this.pdf.internal.getVerticalCoordinateString(this.y), "Td");
			}  			
			
		}
		if (cb && typeof cb === "function") {
			cb.call(this, this.x - 9, this.y - fontSize / 2);
		}
		out("ET", "Q");
		return this.y += paragraphspacing_after;
	};
	Renderer.prototype.setBlockBoundary = function (cb) {
		return this.renderParagraph(cb);
	};
	Renderer.prototype.setBlockStyle = function (css) {
		return this.paragraph.blockstyle = css;
	};
	Renderer.prototype.addText = function (text, css) {
		this.paragraph.text.push(text);
		return this.paragraph.style.push(css);
	};
	FontNameDB = {
		helvetica         : "helvetica",
		"sans-serif"      : "helvetica",
		"times new roman" : "times",
		serif             : "times",
		times             : "times",
		monospace         : "courier",
		courier           : "courier"
	};
	FontWeightMap = {
		100 : "normal",
		200 : "normal",
		300 : "normal",
		400 : "normal",
		500 : "bold",
		600 : "bold",
		700 : "bold",
		800 : "bold",
		900 : "bold",
		normal  : "normal",
		bold    : "bold",
		bolder  : "bold",
		lighter : "normal"
	};
	FontStyleMap = {
		normal  : "normal",
		italic  : "italic",
		oblique : "italic"
	};
	TextAlignMap = {
		left    : "left",
		right   : "right",
		center  : "center",
		justify : "justify"
	};
	FloatMap = {
		none : 'none',
		right: 'right',
		left: 'left'
	};
	ClearMap = {
	  none : 'none',
	  both : 'both'
	}; 	
	UnitedNumberMap = {
		normal : 1
	};
	/**
	 * Converts HTML-formatted text into formatted PDF text.
	 *
	 * Notes:
	 * 2012-07-18
	 * Plugin relies on having browser, DOM around. The HTML is pushed into dom and traversed.
	 * Plugin relies on jQuery for CSS extraction.
	 * Targeting HTML output from Markdown templating, which is a very simple
	 * markup - div, span, em, strong, p. No br-based paragraph separation supported explicitly (but still may work.)
	 * Images, tables are NOT supported.
	 *
	 * @public
	 * @function
	 * @param HTML {String or DOM Element} HTML-formatted text, or pointer to DOM element that is to be rendered into PDF.
	 * @param x {Number} starting X coordinate in jsPDF instance's declared units.
	 * @param y {Number} starting Y coordinate in jsPDF instance's declared units.
	 * @param settings {Object} Additional / optional variables controlling parsing, rendering.
	 * @returns {Object} jsPDF instance
	 */
	jsPDFAPI.fromHTML = function (HTML, x, y, settings, callback, margins) {
		"use strict";

		this.margins_doc = margins || {
			top : 0,
			bottom : 0
		};
		if (!settings)
			settings = {};
		if (!settings.elementHandlers)
			settings.elementHandlers = {};

		return process(this, HTML, isNaN(x) ? 4 : x, isNaN(y) ? 4 : y, settings, callback);
	};
})(jsPDF.API);

/** @preserve 
jsPDF standard_fonts_metrics plugin
Copyright (c) 2012 Willow Systems Corporation, willow-systems.com
MIT license.
*/
/**
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ====================================================================
 */

;(function(API) {
'use strict'

/*
# reference (Python) versions of 'compress' and 'uncompress'
# only 'uncompress' function is featured lower as JavaScript
# if you want to unit test "roundtrip", just transcribe the reference
# 'compress' function from Python into JavaScript

def compress(data):

	keys =   '0123456789abcdef'
	values = 'klmnopqrstuvwxyz'
	mapping = dict(zip(keys, values))
	vals = []
	for key in data.keys():
		value = data[key]
		try:
			keystring = hex(key)[2:]
			keystring = keystring[:-1] + mapping[keystring[-1:]]
		except:
			keystring = key.join(["'","'"])
			#print('Keystring is %s' % keystring)

		try:
			if value < 0:
				valuestring = hex(value)[3:]
				numberprefix = '-'
			else:
				valuestring = hex(value)[2:]
				numberprefix = ''
			valuestring = numberprefix + valuestring[:-1] + mapping[valuestring[-1:]]
		except:
			if type(value) == dict:
				valuestring = compress(value)
			else:
				raise Exception("Don't know what to do with value type %s" % type(value))

		vals.append(keystring+valuestring)
	
	return '{' + ''.join(vals) + '}'

def uncompress(data):

	decoded = '0123456789abcdef'
	encoded = 'klmnopqrstuvwxyz'
	mapping = dict(zip(encoded, decoded))

	sign = +1
	stringmode = False
	stringparts = []

	output = {}

	activeobject = output
	parentchain = []

	keyparts = ''
	valueparts = ''

	key = None

	ending = set(encoded)

	i = 1
	l = len(data) - 1 # stripping starting, ending {}
	while i != l: # stripping {}
		# -, {, }, ' are special.

		ch = data[i]
		i += 1

		if ch == "'":
			if stringmode:
				# end of string mode
				stringmode = False
				key = ''.join(stringparts)
			else:
				# start of string mode
				stringmode = True
				stringparts = []
		elif stringmode == True:
			#print("Adding %s to stringpart" % ch)
			stringparts.append(ch)

		elif ch == '{':
			# start of object
			parentchain.append( [activeobject, key] )
			activeobject = {}
			key = None
			#DEBUG = True
		elif ch == '}':
			# end of object
			parent, key = parentchain.pop()
			parent[key] = activeobject
			key = None
			activeobject = parent
			#DEBUG = False

		elif ch == '-':
			sign = -1
		else:
			# must be number
			if key == None:
				#debug("In Key. It is '%s', ch is '%s'" % (keyparts, ch))
				if ch in ending:
					#debug("End of key")
					keyparts += mapping[ch]
					key = int(keyparts, 16) * sign
					sign = +1
					keyparts = ''
				else:
					keyparts += ch
			else:
				#debug("In value. It is '%s', ch is '%s'" % (valueparts, ch))
				if ch in ending:
					#debug("End of value")
					valueparts += mapping[ch]
					activeobject[key] = int(valueparts, 16) * sign
					sign = +1
					key = None
					valueparts = ''
				else:
					valueparts += ch

			#debug(activeobject)

	return output

*/

/**
Uncompresses data compressed into custom, base16-like format. 
@public
@function
@param
@returns {Type}
*/
var uncompress = function(data){

	var decoded = '0123456789abcdef'
	, encoded = 'klmnopqrstuvwxyz'
	, mapping = {}

	for (var i = 0; i < encoded.length; i++){
		mapping[encoded[i]] = decoded[i]
	}

	var undef
	, output = {}
	, sign = 1
	, stringparts // undef. will be [] in string mode
	
	, activeobject = output
	, parentchain = []
	, parent_key_pair
	, keyparts = ''
	, valueparts = ''
	, key // undef. will be Truthy when Key is resolved.
	, datalen = data.length - 1 // stripping ending }
	, ch

	i = 1 // stripping starting {
	
	while (i != datalen){
		// - { } ' are special.

		ch = data[i]
		i += 1

		if (ch == "'"){
			if (stringparts){
				// end of string mode
				key = stringparts.join('')
				stringparts = undef				
			} else {
				// start of string mode
				stringparts = []				
			}
		} else if (stringparts){
			stringparts.push(ch)
		} else if (ch == '{'){
			// start of object
			parentchain.push( [activeobject, key] )
			activeobject = {}
			key = undef
		} else if (ch == '}'){
			// end of object
			parent_key_pair = parentchain.pop()
			parent_key_pair[0][parent_key_pair[1]] = activeobject
			key = undef
			activeobject = parent_key_pair[0]
		} else if (ch == '-'){
			sign = -1
		} else {
			// must be number
			if (key === undef) {
				if (mapping.hasOwnProperty(ch)){
					keyparts += mapping[ch]
					key = parseInt(keyparts, 16) * sign
					sign = +1
					keyparts = ''
				} else {
					keyparts += ch
				}
			} else {
				if (mapping.hasOwnProperty(ch)){
					valueparts += mapping[ch]
					activeobject[key] = parseInt(valueparts, 16) * sign
					sign = +1
					key = undef
					valueparts = ''
				} else {
					valueparts += ch					
				}
			}
		}
	} // end while

	return output
}

// encoding = 'Unicode' 
// NOT UTF8, NOT UTF16BE/LE, NOT UCS2BE/LE. NO clever BOM behavior
// Actual 16bit char codes used.
// no multi-byte logic here

// Unicode characters to WinAnsiEncoding:
// {402: 131, 8211: 150, 8212: 151, 8216: 145, 8217: 146, 8218: 130, 8220: 147, 8221: 148, 8222: 132, 8224: 134, 8225: 135, 8226: 149, 8230: 133, 8364: 128, 8240:137, 8249: 139, 8250: 155, 710: 136, 8482: 153, 338: 140, 339: 156, 732: 152, 352: 138, 353: 154, 376: 159, 381: 142, 382: 158}
// as you can see, all Unicode chars are outside of 0-255 range. No char code conflicts.
// this means that you can give Win cp1252 encoded strings to jsPDF for rendering directly
// as well as give strings with some (supported by these fonts) Unicode characters and 
// these will be mapped to win cp1252 
// for example, you can send char code (cp1252) 0x80 or (unicode) 0x20AC, getting "Euro" glyph displayed in both cases.

var encodingBlock = {
	'codePages': ['WinAnsiEncoding']
	, 'WinAnsiEncoding': uncompress("{19m8n201n9q201o9r201s9l201t9m201u8m201w9n201x9o201y8o202k8q202l8r202m9p202q8p20aw8k203k8t203t8v203u9v2cq8s212m9t15m8w15n9w2dw9s16k8u16l9u17s9z17x8y17y9y}")
}
, encodings = {'Unicode':{
	'Courier': encodingBlock
	, 'Courier-Bold': encodingBlock
	, 'Courier-BoldOblique': encodingBlock
	, 'Courier-Oblique': encodingBlock
	, 'Helvetica': encodingBlock
	, 'Helvetica-Bold': encodingBlock
	, 'Helvetica-BoldOblique': encodingBlock
	, 'Helvetica-Oblique': encodingBlock
	, 'Times-Roman': encodingBlock
	, 'Times-Bold': encodingBlock
	, 'Times-BoldItalic': encodingBlock
	, 'Times-Italic': encodingBlock
//	, 'Symbol'
//	, 'ZapfDingbats'
}}
/** 
Resources:
Font metrics data is reprocessed derivative of contents of
"Font Metrics for PDF Core 14 Fonts" package, which exhibits the following copyright and license:

Copyright (c) 1989, 1990, 1991, 1992, 1993, 1997 Adobe Systems Incorporated. All Rights Reserved.

This file and the 14 PostScript(R) AFM files it accompanies may be used,
copied, and distributed for any purpose and without charge, with or without
modification, provided that all copyright notices are retained; that the AFM
files are not distributed without this file; that all modifications to this
file or any of the AFM files are prominently noted in the modified file(s);
and that this paragraph is not modified. Adobe Systems has no responsibility
or obligation to support the use of the AFM files.

*/
, fontMetrics = {'Unicode':{
	// all sizing numbers are n/fontMetricsFractionOf = one font size unit
	// this means that if fontMetricsFractionOf = 1000, and letter A's width is 476, it's
	// width is 476/1000 or 47.6% of its height (regardless of font size)
	// At this time this value applies to "widths" and "kerning" numbers.

	// char code 0 represents "default" (average) width - use it for chars missing in this table.
	// key 'fof' represents the "fontMetricsFractionOf" value

	'Courier-Oblique': uncompress("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}")
	, 'Times-BoldItalic': uncompress("{'widths'{k3o2q4ycx2r201n3m201o6o201s2l201t2l201u2l201w3m201x3m201y3m2k1t2l2r202m2n2n3m2o3m2p5n202q6o2r1w2s2l2t2l2u3m2v3t2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w3t3x3t3y3t3z3m4k5n4l4m4m4m4n4m4o4s4p4m4q4m4r4s4s4y4t2r4u3m4v4m4w3x4x5t4y4s4z4s5k3x5l4s5m4m5n3r5o3x5p4s5q4m5r5t5s4m5t3x5u3x5v2l5w1w5x2l5y3t5z3m6k2l6l3m6m3m6n2w6o3m6p2w6q2l6r3m6s3r6t1w6u1w6v3m6w1w6x4y6y3r6z3m7k3m7l3m7m2r7n2r7o1w7p3r7q2w7r4m7s3m7t2w7u2r7v2n7w1q7x2n7y3t202l3mcl4mal2ram3man3mao3map3mar3mas2lat4uau1uav3maw3way4uaz2lbk2sbl3t'fof'6obo2lbp3tbq3mbr1tbs2lbu1ybv3mbz3mck4m202k3mcm4mcn4mco4mcp4mcq5ycr4mcs4mct4mcu4mcv4mcw2r2m3rcy2rcz2rdl4sdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek3mel3mem3men3meo3mep3meq4ser2wes2wet2weu2wev2wew1wex1wey1wez1wfl3rfm3mfn3mfo3mfp3mfq3mfr3tfs3mft3rfu3rfv3rfw3rfz2w203k6o212m6o2dw2l2cq2l3t3m3u2l17s3x19m3m}'kerning'{cl{4qu5kt5qt5rs17ss5ts}201s{201ss}201t{cks4lscmscnscoscpscls2wu2yu201ts}201x{2wu2yu}2k{201ts}2w{4qx5kx5ou5qx5rs17su5tu}2x{17su5tu5ou}2y{4qx5kx5ou5qx5rs17ss5ts}'fof'-6ofn{17sw5tw5ou5qw5rs}7t{cksclscmscnscoscps4ls}3u{17su5tu5os5qs}3v{17su5tu5os5qs}7p{17su5tu}ck{4qu5kt5qt5rs17ss5ts}4l{4qu5kt5qt5rs17ss5ts}cm{4qu5kt5qt5rs17ss5ts}cn{4qu5kt5qt5rs17ss5ts}co{4qu5kt5qt5rs17ss5ts}cp{4qu5kt5qt5rs17ss5ts}6l{4qu5ou5qw5rt17su5tu}5q{ckuclucmucnucoucpu4lu}5r{ckuclucmucnucoucpu4lu}7q{cksclscmscnscoscps4ls}6p{4qu5ou5qw5rt17sw5tw}ek{4qu5ou5qw5rt17su5tu}el{4qu5ou5qw5rt17su5tu}em{4qu5ou5qw5rt17su5tu}en{4qu5ou5qw5rt17su5tu}eo{4qu5ou5qw5rt17su5tu}ep{4qu5ou5qw5rt17su5tu}es{17ss5ts5qs4qu}et{4qu5ou5qw5rt17sw5tw}eu{4qu5ou5qw5rt17ss5ts}ev{17ss5ts5qs4qu}6z{17sw5tw5ou5qw5rs}fm{17sw5tw5ou5qw5rs}7n{201ts}fo{17sw5tw5ou5qw5rs}fp{17sw5tw5ou5qw5rs}fq{17sw5tw5ou5qw5rs}7r{cksclscmscnscoscps4ls}fs{17sw5tw5ou5qw5rs}ft{17su5tu}fu{17su5tu}fv{17su5tu}fw{17su5tu}fz{cksclscmscnscoscps4ls}}}")
	, 'Helvetica-Bold': uncompress("{'widths'{k3s2q4scx1w201n3r201o6o201s1w201t1w201u1w201w3m201x3m201y3m2k1w2l2l202m2n2n3r2o3r2p5t202q6o2r1s2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v2l3w3u3x3u3y3u3z3x4k6l4l4s4m4s4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3r4v4s4w3x4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v2l5w1w5x2l5y3u5z3r6k2l6l3r6m3x6n3r6o3x6p3r6q2l6r3x6s3x6t1w6u1w6v3r6w1w6x5t6y3x6z3x7k3x7l3x7m2r7n3r7o2l7p3x7q3r7r4y7s3r7t3r7u3m7v2r7w1w7x2r7y3u202l3rcl4sal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3xbq3rbr1wbs2lbu2obv3rbz3xck4s202k3rcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw1w2m2zcy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3res3ret3reu3rev3rew1wex1wey1wez1wfl3xfm3xfn3xfo3xfp3xfq3xfr3ufs3xft3xfu3xfv3xfw3xfz3r203k6o212m6o2dw2l2cq2l3t3r3u2l17s4m19m3r}'kerning'{cl{4qs5ku5ot5qs17sv5tv}201t{2ww4wy2yw}201w{2ks}201x{2ww4wy2yw}2k{201ts201xs}2w{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}2x{5ow5qs}2y{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}'fof'-6o7p{17su5tu5ot}ck{4qs5ku5ot5qs17sv5tv}4l{4qs5ku5ot5qs17sv5tv}cm{4qs5ku5ot5qs17sv5tv}cn{4qs5ku5ot5qs17sv5tv}co{4qs5ku5ot5qs17sv5tv}cp{4qs5ku5ot5qs17sv5tv}6l{17st5tt5os}17s{2kwclvcmvcnvcovcpv4lv4wwckv}5o{2kucltcmtcntcotcpt4lt4wtckt}5q{2ksclscmscnscoscps4ls4wvcks}5r{2ks4ws}5t{2kwclvcmvcnvcovcpv4lv4wwckv}eo{17st5tt5os}fu{17su5tu5ot}6p{17ss5ts}ek{17st5tt5os}el{17st5tt5os}em{17st5tt5os}en{17st5tt5os}6o{201ts}ep{17st5tt5os}es{17ss5ts}et{17ss5ts}eu{17ss5ts}ev{17ss5ts}6z{17su5tu5os5qt}fm{17su5tu5os5qt}fn{17su5tu5os5qt}fo{17su5tu5os5qt}fp{17su5tu5os5qt}fq{17su5tu5os5qt}fs{17su5tu5os5qt}ft{17su5tu5ot}7m{5os}fv{17su5tu5ot}fw{17su5tu5ot}}}")
	, 'Courier': uncompress("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}")
	, 'Courier-BoldOblique': uncompress("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}")
	, 'Times-Bold': uncompress("{'widths'{k3q2q5ncx2r201n3m201o6o201s2l201t2l201u2l201w3m201x3m201y3m2k1t2l2l202m2n2n3m2o3m2p6o202q6o2r1w2s2l2t2l2u3m2v3t2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w3t3x3t3y3t3z3m4k5x4l4s4m4m4n4s4o4s4p4m4q3x4r4y4s4y4t2r4u3m4v4y4w4m4x5y4y4s4z4y5k3x5l4y5m4s5n3r5o4m5p4s5q4s5r6o5s4s5t4s5u4m5v2l5w1w5x2l5y3u5z3m6k2l6l3m6m3r6n2w6o3r6p2w6q2l6r3m6s3r6t1w6u2l6v3r6w1w6x5n6y3r6z3m7k3r7l3r7m2w7n2r7o2l7p3r7q3m7r4s7s3m7t3m7u2w7v2r7w1q7x2r7y3o202l3mcl4sal2lam3man3mao3map3mar3mas2lat4uau1yav3maw3tay4uaz2lbk2sbl3t'fof'6obo2lbp3rbr1tbs2lbu2lbv3mbz3mck4s202k3mcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw2r2m3rcy2rcz2rdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3rek3mel3mem3men3meo3mep3meq4ser2wes2wet2weu2wev2wew1wex1wey1wez1wfl3rfm3mfn3mfo3mfp3mfq3mfr3tfs3mft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3m3u2l17s4s19m3m}'kerning'{cl{4qt5ks5ot5qy5rw17sv5tv}201t{cks4lscmscnscoscpscls4wv}2k{201ts}2w{4qu5ku7mu5os5qx5ru17su5tu}2x{17su5tu5ou5qs}2y{4qv5kv7mu5ot5qz5ru17su5tu}'fof'-6o7t{cksclscmscnscoscps4ls}3u{17su5tu5os5qu}3v{17su5tu5os5qu}fu{17su5tu5ou5qu}7p{17su5tu5ou5qu}ck{4qt5ks5ot5qy5rw17sv5tv}4l{4qt5ks5ot5qy5rw17sv5tv}cm{4qt5ks5ot5qy5rw17sv5tv}cn{4qt5ks5ot5qy5rw17sv5tv}co{4qt5ks5ot5qy5rw17sv5tv}cp{4qt5ks5ot5qy5rw17sv5tv}6l{17st5tt5ou5qu}17s{ckuclucmucnucoucpu4lu4wu}5o{ckuclucmucnucoucpu4lu4wu}5q{ckzclzcmzcnzcozcpz4lz4wu}5r{ckxclxcmxcnxcoxcpx4lx4wu}5t{ckuclucmucnucoucpu4lu4wu}7q{ckuclucmucnucoucpu4lu}6p{17sw5tw5ou5qu}ek{17st5tt5qu}el{17st5tt5ou5qu}em{17st5tt5qu}en{17st5tt5qu}eo{17st5tt5qu}ep{17st5tt5ou5qu}es{17ss5ts5qu}et{17sw5tw5ou5qu}eu{17sw5tw5ou5qu}ev{17ss5ts5qu}6z{17sw5tw5ou5qu5rs}fm{17sw5tw5ou5qu5rs}fn{17sw5tw5ou5qu5rs}fo{17sw5tw5ou5qu5rs}fp{17sw5tw5ou5qu5rs}fq{17sw5tw5ou5qu5rs}7r{cktcltcmtcntcotcpt4lt5os}fs{17sw5tw5ou5qu5rs}ft{17su5tu5ou5qu}7m{5os}fv{17su5tu5ou5qu}fw{17su5tu5ou5qu}fz{cksclscmscnscoscps4ls}}}")
	//, 'Symbol': uncompress("{'widths'{k3uaw4r19m3m2k1t2l2l202m2y2n3m2p5n202q6o3k3m2s2l2t2l2v3r2w1t3m3m2y1t2z1wbk2sbl3r'fof'6o3n3m3o3m3p3m3q3m3r3m3s3m3t3m3u1w3v1w3w3r3x3r3y3r3z2wbp3t3l3m5v2l5x2l5z3m2q4yfr3r7v3k7w1o7x3k}'kerning'{'fof'-6o}}")
	, 'Helvetica': uncompress("{'widths'{k3p2q4mcx1w201n3r201o6o201s1q201t1q201u1q201w2l201x2l201y2l2k1w2l1w202m2n2n3r2o3r2p5t202q6o2r1n2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v1w3w3u3x3u3y3u3z3r4k6p4l4m4m4m4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3m4v4m4w3r4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v1w5w1w5x1w5y2z5z3r6k2l6l3r6m3r6n3m6o3r6p3r6q1w6r3r6s3r6t1q6u1q6v3m6w1q6x5n6y3r6z3r7k3r7l3r7m2l7n3m7o1w7p3r7q3m7r4s7s3m7t3m7u3m7v2l7w1u7x2l7y3u202l3rcl4mal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3rbr1wbs2lbu2obv3rbz3xck4m202k3rcm4mcn4mco4mcp4mcq6ocr4scs4mct4mcu4mcv4mcw1w2m2ncy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3mes3ret3reu3rev3rew1wex1wey1wez1wfl3rfm3rfn3rfo3rfp3rfq3rfr3ufs3xft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3r3u1w17s4m19m3r}'kerning'{5q{4wv}cl{4qs5kw5ow5qs17sv5tv}201t{2wu4w1k2yu}201x{2wu4wy2yu}17s{2ktclucmucnu4otcpu4lu4wycoucku}2w{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}2x{17sy5ty5oy5qs}2y{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}'fof'-6o7p{17sv5tv5ow}ck{4qs5kw5ow5qs17sv5tv}4l{4qs5kw5ow5qs17sv5tv}cm{4qs5kw5ow5qs17sv5tv}cn{4qs5kw5ow5qs17sv5tv}co{4qs5kw5ow5qs17sv5tv}cp{4qs5kw5ow5qs17sv5tv}6l{17sy5ty5ow}do{17st5tt}4z{17st5tt}7s{fst}dm{17st5tt}dn{17st5tt}5o{ckwclwcmwcnwcowcpw4lw4wv}dp{17st5tt}dq{17st5tt}7t{5ow}ds{17st5tt}5t{2ktclucmucnu4otcpu4lu4wycoucku}fu{17sv5tv5ow}6p{17sy5ty5ow5qs}ek{17sy5ty5ow}el{17sy5ty5ow}em{17sy5ty5ow}en{5ty}eo{17sy5ty5ow}ep{17sy5ty5ow}es{17sy5ty5qs}et{17sy5ty5ow5qs}eu{17sy5ty5ow5qs}ev{17sy5ty5ow5qs}6z{17sy5ty5ow5qs}fm{17sy5ty5ow5qs}fn{17sy5ty5ow5qs}fo{17sy5ty5ow5qs}fp{17sy5ty5qs}fq{17sy5ty5ow5qs}7r{5ow}fs{17sy5ty5ow5qs}ft{17sv5tv5ow}7m{5ow}fv{17sv5tv5ow}fw{17sv5tv5ow}}}")
	, 'Helvetica-BoldOblique': uncompress("{'widths'{k3s2q4scx1w201n3r201o6o201s1w201t1w201u1w201w3m201x3m201y3m2k1w2l2l202m2n2n3r2o3r2p5t202q6o2r1s2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v2l3w3u3x3u3y3u3z3x4k6l4l4s4m4s4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3r4v4s4w3x4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v2l5w1w5x2l5y3u5z3r6k2l6l3r6m3x6n3r6o3x6p3r6q2l6r3x6s3x6t1w6u1w6v3r6w1w6x5t6y3x6z3x7k3x7l3x7m2r7n3r7o2l7p3x7q3r7r4y7s3r7t3r7u3m7v2r7w1w7x2r7y3u202l3rcl4sal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3xbq3rbr1wbs2lbu2obv3rbz3xck4s202k3rcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw1w2m2zcy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3res3ret3reu3rev3rew1wex1wey1wez1wfl3xfm3xfn3xfo3xfp3xfq3xfr3ufs3xft3xfu3xfv3xfw3xfz3r203k6o212m6o2dw2l2cq2l3t3r3u2l17s4m19m3r}'kerning'{cl{4qs5ku5ot5qs17sv5tv}201t{2ww4wy2yw}201w{2ks}201x{2ww4wy2yw}2k{201ts201xs}2w{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}2x{5ow5qs}2y{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}'fof'-6o7p{17su5tu5ot}ck{4qs5ku5ot5qs17sv5tv}4l{4qs5ku5ot5qs17sv5tv}cm{4qs5ku5ot5qs17sv5tv}cn{4qs5ku5ot5qs17sv5tv}co{4qs5ku5ot5qs17sv5tv}cp{4qs5ku5ot5qs17sv5tv}6l{17st5tt5os}17s{2kwclvcmvcnvcovcpv4lv4wwckv}5o{2kucltcmtcntcotcpt4lt4wtckt}5q{2ksclscmscnscoscps4ls4wvcks}5r{2ks4ws}5t{2kwclvcmvcnvcovcpv4lv4wwckv}eo{17st5tt5os}fu{17su5tu5ot}6p{17ss5ts}ek{17st5tt5os}el{17st5tt5os}em{17st5tt5os}en{17st5tt5os}6o{201ts}ep{17st5tt5os}es{17ss5ts}et{17ss5ts}eu{17ss5ts}ev{17ss5ts}6z{17su5tu5os5qt}fm{17su5tu5os5qt}fn{17su5tu5os5qt}fo{17su5tu5os5qt}fp{17su5tu5os5qt}fq{17su5tu5os5qt}fs{17su5tu5os5qt}ft{17su5tu5ot}7m{5os}fv{17su5tu5ot}fw{17su5tu5ot}}}")
	//, 'ZapfDingbats': uncompress("{'widths'{k4u2k1w'fof'6o}'kerning'{'fof'-6o}}")
	, 'Courier-Bold': uncompress("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}")
	, 'Times-Italic': uncompress("{'widths'{k3n2q4ycx2l201n3m201o5t201s2l201t2l201u2l201w3r201x3r201y3r2k1t2l2l202m2n2n3m2o3m2p5n202q5t2r1p2s2l2t2l2u3m2v4n2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w4n3x4n3y4n3z3m4k5w4l3x4m3x4n4m4o4s4p3x4q3x4r4s4s4s4t2l4u2w4v4m4w3r4x5n4y4m4z4s5k3x5l4s5m3x5n3m5o3r5p4s5q3x5r5n5s3x5t3r5u3r5v2r5w1w5x2r5y2u5z3m6k2l6l3m6m3m6n2w6o3m6p2w6q1w6r3m6s3m6t1w6u1w6v2w6w1w6x4s6y3m6z3m7k3m7l3m7m2r7n2r7o1w7p3m7q2w7r4m7s2w7t2w7u2r7v2s7w1v7x2s7y3q202l3mcl3xal2ram3man3mao3map3mar3mas2lat4wau1vav3maw4nay4waz2lbk2sbl4n'fof'6obo2lbp3mbq3obr1tbs2lbu1zbv3mbz3mck3x202k3mcm3xcn3xco3xcp3xcq5tcr4mcs3xct3xcu3xcv3xcw2l2m2ucy2lcz2ldl4mdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek3mel3mem3men3meo3mep3meq4mer2wes2wet2weu2wev2wew1wex1wey1wez1wfl3mfm3mfn3mfo3mfp3mfq3mfr4nfs3mft3mfu3mfv3mfw3mfz2w203k6o212m6m2dw2l2cq2l3t3m3u2l17s3r19m3m}'kerning'{cl{5kt4qw}201s{201sw}201t{201tw2wy2yy6q-t}201x{2wy2yy}2k{201tw}2w{7qs4qy7rs5ky7mw5os5qx5ru17su5tu}2x{17ss5ts5os}2y{7qs4qy7rs5ky7mw5os5qx5ru17su5tu}'fof'-6o6t{17ss5ts5qs}7t{5os}3v{5qs}7p{17su5tu5qs}ck{5kt4qw}4l{5kt4qw}cm{5kt4qw}cn{5kt4qw}co{5kt4qw}cp{5kt4qw}6l{4qs5ks5ou5qw5ru17su5tu}17s{2ks}5q{ckvclvcmvcnvcovcpv4lv}5r{ckuclucmucnucoucpu4lu}5t{2ks}6p{4qs5ks5ou5qw5ru17su5tu}ek{4qs5ks5ou5qw5ru17su5tu}el{4qs5ks5ou5qw5ru17su5tu}em{4qs5ks5ou5qw5ru17su5tu}en{4qs5ks5ou5qw5ru17su5tu}eo{4qs5ks5ou5qw5ru17su5tu}ep{4qs5ks5ou5qw5ru17su5tu}es{5ks5qs4qs}et{4qs5ks5ou5qw5ru17su5tu}eu{4qs5ks5qw5ru17su5tu}ev{5ks5qs4qs}ex{17ss5ts5qs}6z{4qv5ks5ou5qw5ru17su5tu}fm{4qv5ks5ou5qw5ru17su5tu}fn{4qv5ks5ou5qw5ru17su5tu}fo{4qv5ks5ou5qw5ru17su5tu}fp{4qv5ks5ou5qw5ru17su5tu}fq{4qv5ks5ou5qw5ru17su5tu}7r{5os}fs{4qv5ks5ou5qw5ru17su5tu}ft{17su5tu5qs}fu{17su5tu5qs}fv{17su5tu5qs}fw{17su5tu5qs}}}")
	, 'Times-Roman': uncompress("{'widths'{k3n2q4ycx2l201n3m201o6o201s2l201t2l201u2l201w2w201x2w201y2w2k1t2l2l202m2n2n3m2o3m2p5n202q6o2r1m2s2l2t2l2u3m2v3s2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v1w3w3s3x3s3y3s3z2w4k5w4l4s4m4m4n4m4o4s4p3x4q3r4r4s4s4s4t2l4u2r4v4s4w3x4x5t4y4s4z4s5k3r5l4s5m4m5n3r5o3x5p4s5q4s5r5y5s4s5t4s5u3x5v2l5w1w5x2l5y2z5z3m6k2l6l2w6m3m6n2w6o3m6p2w6q2l6r3m6s3m6t1w6u1w6v3m6w1w6x4y6y3m6z3m7k3m7l3m7m2l7n2r7o1w7p3m7q3m7r4s7s3m7t3m7u2w7v3k7w1o7x3k7y3q202l3mcl4sal2lam3man3mao3map3mar3mas2lat4wau1vav3maw3say4waz2lbk2sbl3s'fof'6obo2lbp3mbq2xbr1tbs2lbu1zbv3mbz2wck4s202k3mcm4scn4sco4scp4scq5tcr4mcs3xct3xcu3xcv3xcw2l2m2tcy2lcz2ldl4sdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek2wel2wem2wen2weo2wep2weq4mer2wes2wet2weu2wev2wew1wex1wey1wez1wfl3mfm3mfn3mfo3mfp3mfq3mfr3sfs3mft3mfu3mfv3mfw3mfz3m203k6o212m6m2dw2l2cq2l3t3m3u1w17s4s19m3m}'kerning'{cl{4qs5ku17sw5ou5qy5rw201ss5tw201ws}201s{201ss}201t{ckw4lwcmwcnwcowcpwclw4wu201ts}2k{201ts}2w{4qs5kw5os5qx5ru17sx5tx}2x{17sw5tw5ou5qu}2y{4qs5kw5os5qx5ru17sx5tx}'fof'-6o7t{ckuclucmucnucoucpu4lu5os5rs}3u{17su5tu5qs}3v{17su5tu5qs}7p{17sw5tw5qs}ck{4qs5ku17sw5ou5qy5rw201ss5tw201ws}4l{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cm{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cn{4qs5ku17sw5ou5qy5rw201ss5tw201ws}co{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cp{4qs5ku17sw5ou5qy5rw201ss5tw201ws}6l{17su5tu5os5qw5rs}17s{2ktclvcmvcnvcovcpv4lv4wuckv}5o{ckwclwcmwcnwcowcpw4lw4wu}5q{ckyclycmycnycoycpy4ly4wu5ms}5r{cktcltcmtcntcotcpt4lt4ws}5t{2ktclvcmvcnvcovcpv4lv4wuckv}7q{cksclscmscnscoscps4ls}6p{17su5tu5qw5rs}ek{5qs5rs}el{17su5tu5os5qw5rs}em{17su5tu5os5qs5rs}en{17su5qs5rs}eo{5qs5rs}ep{17su5tu5os5qw5rs}es{5qs}et{17su5tu5qw5rs}eu{17su5tu5qs5rs}ev{5qs}6z{17sv5tv5os5qx5rs}fm{5os5qt5rs}fn{17sv5tv5os5qx5rs}fo{17sv5tv5os5qx5rs}fp{5os5qt5rs}fq{5os5qt5rs}7r{ckuclucmucnucoucpu4lu5os}fs{17sv5tv5os5qx5rs}ft{17ss5ts5qs}fu{17sw5tw5qs}fv{17sw5tw5qs}fw{17ss5ts5qs}fz{ckuclucmucnucoucpu4lu5os5rs}}}")
	, 'Helvetica-Oblique': uncompress("{'widths'{k3p2q4mcx1w201n3r201o6o201s1q201t1q201u1q201w2l201x2l201y2l2k1w2l1w202m2n2n3r2o3r2p5t202q6o2r1n2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v1w3w3u3x3u3y3u3z3r4k6p4l4m4m4m4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3m4v4m4w3r4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v1w5w1w5x1w5y2z5z3r6k2l6l3r6m3r6n3m6o3r6p3r6q1w6r3r6s3r6t1q6u1q6v3m6w1q6x5n6y3r6z3r7k3r7l3r7m2l7n3m7o1w7p3r7q3m7r4s7s3m7t3m7u3m7v2l7w1u7x2l7y3u202l3rcl4mal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3rbr1wbs2lbu2obv3rbz3xck4m202k3rcm4mcn4mco4mcp4mcq6ocr4scs4mct4mcu4mcv4mcw1w2m2ncy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3mes3ret3reu3rev3rew1wex1wey1wez1wfl3rfm3rfn3rfo3rfp3rfq3rfr3ufs3xft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3r3u1w17s4m19m3r}'kerning'{5q{4wv}cl{4qs5kw5ow5qs17sv5tv}201t{2wu4w1k2yu}201x{2wu4wy2yu}17s{2ktclucmucnu4otcpu4lu4wycoucku}2w{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}2x{17sy5ty5oy5qs}2y{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}'fof'-6o7p{17sv5tv5ow}ck{4qs5kw5ow5qs17sv5tv}4l{4qs5kw5ow5qs17sv5tv}cm{4qs5kw5ow5qs17sv5tv}cn{4qs5kw5ow5qs17sv5tv}co{4qs5kw5ow5qs17sv5tv}cp{4qs5kw5ow5qs17sv5tv}6l{17sy5ty5ow}do{17st5tt}4z{17st5tt}7s{fst}dm{17st5tt}dn{17st5tt}5o{ckwclwcmwcnwcowcpw4lw4wv}dp{17st5tt}dq{17st5tt}7t{5ow}ds{17st5tt}5t{2ktclucmucnu4otcpu4lu4wycoucku}fu{17sv5tv5ow}6p{17sy5ty5ow5qs}ek{17sy5ty5ow}el{17sy5ty5ow}em{17sy5ty5ow}en{5ty}eo{17sy5ty5ow}ep{17sy5ty5ow}es{17sy5ty5qs}et{17sy5ty5ow5qs}eu{17sy5ty5ow5qs}ev{17sy5ty5ow5qs}6z{17sy5ty5ow5qs}fm{17sy5ty5ow5qs}fn{17sy5ty5ow5qs}fo{17sy5ty5ow5qs}fp{17sy5ty5qs}fq{17sy5ty5ow5qs}7r{5ow}fs{17sy5ty5ow5qs}ft{17sv5tv5ow}7m{5ow}fv{17sv5tv5ow}fw{17sv5tv5ow}}}")
}};

/*
This event handler is fired when a new jsPDF object is initialized
This event handler appends metrics data to standard fonts within
that jsPDF instance. The metrics are mapped over Unicode character
codes, NOT CIDs or other codes matching the StandardEncoding table of the
standard PDF fonts.
Future:
Also included is the encoding maping table, converting Unicode (UCS-2, UTF-16)
char codes to StandardEncoding character codes. The encoding table is to be used
somewhere around "pdfEscape" call.
*/

API.events.push([ 
	'addFonts'
	,function(fontManagementObjects) {
		// fontManagementObjects is {
		//	'fonts':font_ID-keyed hash of font objects
		//	, 'dictionary': lookup object, linking ["FontFamily"]['Style'] to font ID
		//}
		var font
		, fontID
		, metrics
		, unicode_section
		, encoding = 'Unicode'
		, encodingBlock

		for (fontID in fontManagementObjects.fonts){
			if (fontManagementObjects.fonts.hasOwnProperty(fontID)) {
				font = fontManagementObjects.fonts[fontID]

				// // we only ship 'Unicode' mappings and metrics. No need for loop.
				// // still, leaving this for the future.

				// for (encoding in fontMetrics){
				// 	if (fontMetrics.hasOwnProperty(encoding)) {

						metrics = fontMetrics[encoding][font.PostScriptName]
						if (metrics) {
							if (font.metadata[encoding]) {
								unicode_section = font.metadata[encoding]
							} else {
								unicode_section = font.metadata[encoding] = {}
							}

							unicode_section.widths = metrics.widths
							unicode_section.kerning = metrics.kerning
						}
				// 	}
				// }
				// for (encoding in encodings){
				// 	if (encodings.hasOwnProperty(encoding)) {
						encodingBlock = encodings[encoding][font.PostScriptName]
						if (encodingBlock) {
							if (font.metadata[encoding]) {
								unicode_section = font.metadata[encoding]
							} else {
								unicode_section = font.metadata[encoding] = {}
							}

							unicode_section.encoding = encodingBlock
							if (encodingBlock.codePages && encodingBlock.codePages.length) {
								font.encoding = encodingBlock.codePages[0]
							}
						}
				// 	}
				// }
			}
		}
	}
]) // end of adding event handler

})(jsPDF.API);

/** @preserve
 * jsPDF split_text_to_size plugin - MIT license.
 * Copyright (c) 2012 Willow Systems Corporation, willow-systems.com
 *               2014 Diego Casorran, https://github.com/diegocr
 */
/**
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ====================================================================
 */

;(function(API) {
'use strict'

/**
Returns an array of length matching length of the 'word' string, with each
cell ocupied by the width of the char in that position.

@function
@param word {String}
@param widths {Object}
@param kerning {Object}
@returns {Array}
*/
var getCharWidthsArray = API.getCharWidthsArray = function(text, options){

	if (!options) {
		options = {}
	}

	var widths = options.widths ? options.widths : this.internal.getFont().metadata.Unicode.widths
	, widthsFractionOf = widths.fof ? widths.fof : 1
	, kerning = options.kerning ? options.kerning : this.internal.getFont().metadata.Unicode.kerning
	, kerningFractionOf = kerning.fof ? kerning.fof : 1

	// console.log("widths, kergnings", widths, kerning)

	var i, l
	, char_code
	, prior_char_code = 0 // for kerning
	, default_char_width = widths[0] || widthsFractionOf
	, output = []

	for (i = 0, l = text.length; i < l; i++) {
		char_code = text.charCodeAt(i)
		output.push(
			( widths[char_code] || default_char_width ) / widthsFractionOf +
			( kerning[char_code] && kerning[char_code][prior_char_code] || 0 ) / kerningFractionOf
		)
		prior_char_code = char_code
	}

	return output
}
var getArraySum = function(array){
	var i = array.length
	, output = 0
	while(i){
		;i--;
		output += array[i]
	}
	return output
}
/**
Returns a widths of string in a given font, if the font size is set as 1 point.

In other words, this is "proportional" value. For 1 unit of font size, the length
of the string will be that much.

Multiply by font size to get actual width in *points*
Then divide by 72 to get inches or divide by (72/25.6) to get 'mm' etc.

@public
@function
@param
@returns {Type}
*/
var getStringUnitWidth = API.getStringUnitWidth = function(text, options) {
	return getArraySum(getCharWidthsArray.call(this, text, options))
}

/**
returns array of lines
*/
var splitLongWord = function(word, widths_array, firstLineMaxLen, maxLen){
	var answer = []

	// 1st, chop off the piece that can fit on the hanging line.
	var i = 0
	, l = word.length
	, workingLen = 0
	while (i !== l && workingLen + widths_array[i] < firstLineMaxLen){
		workingLen += widths_array[i]
		;i++;
	}
	// this is first line.
	answer.push(word.slice(0, i))

	// 2nd. Split the rest into maxLen pieces.
	var startOfLine = i
	workingLen = 0
	while (i !== l){
		if (workingLen + widths_array[i] > maxLen) {
			answer.push(word.slice(startOfLine, i))
			workingLen = 0
			startOfLine = i
		}
		workingLen += widths_array[i]
		;i++;
	}
	if (startOfLine !== i) {
		answer.push(word.slice(startOfLine, i))
	}

	return answer
}

// Note, all sizing inputs for this function must be in "font measurement units"
// By default, for PDF, it's "point".
var splitParagraphIntoLines = function(text, maxlen, options){
	// at this time works only on Western scripts, ones with space char
	// separating the words. Feel free to expand.

	if (!options) {
		options = {}
	}

	var line = []
	, lines = [line]
	, line_length = options.textIndent || 0
	, separator_length = 0
	, current_word_length = 0
	, word
	, widths_array
	, words = text.split(' ')
	, spaceCharWidth = getCharWidthsArray(' ', options)[0]
	, i, l, tmp, lineIndent

	if(options.lineIndent === -1) {
		lineIndent = words[0].length +2;
	} else {
		lineIndent = options.lineIndent || 0;
	}
	if(lineIndent) {
		var pad = Array(lineIndent).join(" "), wrds = [];
		words.map(function(wrd) {
			wrd = wrd.split(/\s*\n/);
			if(wrd.length > 1) {
				wrds = wrds.concat(wrd.map(function(wrd, idx) {
					return (idx && wrd.length ? "\n":"") + wrd;
				}));
			} else {
				wrds.push(wrd[0]);
			}
		});
		words = wrds;
		lineIndent = getStringUnitWidth(pad, options);
	}

	for (i = 0, l = words.length; i < l; i++) {
		var force = 0;

		word = words[i]
		if(lineIndent && word[0] == "\n") {
			word = word.substr(1);
			force = 1;
		}
		widths_array = getCharWidthsArray(word, options)
		current_word_length = getArraySum(widths_array)

		if (line_length + separator_length + current_word_length > maxlen || force) {
			if (current_word_length > maxlen) {
				// this happens when you have space-less long URLs for example.
				// we just chop these to size. We do NOT insert hiphens
				tmp = splitLongWord(word, widths_array, maxlen - (line_length + separator_length), maxlen)
				// first line we add to existing line object
				line.push(tmp.shift()) // it's ok to have extra space indicator there
				// last line we make into new line object
				line = [tmp.pop()]
				// lines in the middle we apped to lines object as whole lines
				while(tmp.length){
					lines.push([tmp.shift()]) // single fragment occupies whole line
				}
				current_word_length = getArraySum( widths_array.slice(word.length - line[0].length) )
			} else {
				// just put it on a new line
				line = [word]
			}

			// now we attach new line to lines
			lines.push(line)
			line_length = current_word_length + lineIndent
			separator_length = spaceCharWidth

		} else {
			line.push(word)

			line_length += separator_length + current_word_length
			separator_length = spaceCharWidth
		}
	}

	if(lineIndent) {
		var postProcess = function(ln, idx) {
			return (idx ? pad : '') + ln.join(" ");
		};
	} else {
		var postProcess = function(ln) { return ln.join(" ")};
	}

	return lines.map(postProcess);
}

/**
Splits a given string into an array of strings. Uses 'size' value
(in measurement units declared as default for the jsPDF instance)
and the font's "widths" and "Kerning" tables, where availabe, to
determine display length of a given string for a given font.

We use character's 100% of unit size (height) as width when Width
table or other default width is not available.

@public
@function
@param text {String} Unencoded, regular JavaScript (Unicode, UTF-16 / UCS-2) string.
@param size {Number} Nominal number, measured in units default to this instance of jsPDF.
@param options {Object} Optional flags needed for chopper to do the right thing.
@returns {Array} with strings chopped to size.
*/
API.splitTextToSize = function(text, maxlen, options) {
	'use strict'

	if (!options) {
		options = {}
	}

	var fsize = options.fontSize || this.internal.getFontSize()
	, newOptions = (function(options){
		var widths = {0:1}
		, kerning = {}

		if (!options.widths || !options.kerning) {
			var f = this.internal.getFont(options.fontName, options.fontStyle)
			, encoding = 'Unicode'
			// NOT UTF8, NOT UTF16BE/LE, NOT UCS2BE/LE
			// Actual JavaScript-native String's 16bit char codes used.
			// no multi-byte logic here

			if (f.metadata[encoding]) {
				return {
					widths: f.metadata[encoding].widths || widths
					, kerning: f.metadata[encoding].kerning || kerning
				}
			}
		} else {
			return 	{
				widths: options.widths
				, kerning: options.kerning
			}
		}

		// then use default values
		return 	{
			widths: widths
			, kerning: kerning
		}
	}).call(this, options)

	// first we split on end-of-line chars
	var paragraphs
	if(Array.isArray(text)) {
		paragraphs = text;
	} else {
		paragraphs = text.split(/\r?\n/);
	}

	// now we convert size (max length of line) into "font size units"
	// at present time, the "font size unit" is always 'point'
	// 'proportional' means, "in proportion to font size"
	var fontUnit_maxLen = 1.0 * this.internal.scaleFactor * maxlen / fsize
	// at this time, fsize is always in "points" regardless of the default measurement unit of the doc.
	// this may change in the future?
	// until then, proportional_maxlen is likely to be in 'points'

	// If first line is to be indented (shorter or longer) than maxLen
	// we indicate that by using CSS-style "text-indent" option.
	// here it's in font units too (which is likely 'points')
	// it can be negative (which makes the first line longer than maxLen)
	newOptions.textIndent = options.textIndent ?
		options.textIndent * 1.0 * this.internal.scaleFactor / fsize :
		0
	newOptions.lineIndent = options.lineIndent;

	var i, l
	, output = []
	for (i = 0, l = paragraphs.length; i < l; i++) {
		output = output.concat(
			splitParagraphIntoLines(
				paragraphs[i]
				, fontUnit_maxLen
				, newOptions
			)
		)
	}

	return output
}

})(jsPDF.API);

module.exports = jsPDF;
