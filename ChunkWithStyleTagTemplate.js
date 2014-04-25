var ConcatSource = require("webpack/node_modules/webpack-core/lib/ConcatSource");

function ChunkWithStyleTagTemplate(chunkTemplate) {
	this.chunkTemplate = chunkTemplate;
}
module.exports = ChunkWithStyleTagTemplate;

ChunkWithStyleTagTemplate.prototype.updateHash = function(hash) {
	hash.update("ChunkWithStyleTagTemplate");
	hash.update("2");
};

ChunkWithStyleTagTemplate.prototype.render = function(chunkA, chunkB) {
	var chunk = typeof chunkA === "string" ? chunkB : chunkA;
	var source = new ConcatSource();
	if (chunk._chunkStyles) {
		var fnText = insertCss.toString();
		source.add("(("+fnText+")("+JSON.stringify(chunk._chunkStyles)+"));\n");
		source.add("function ___go_js_go_go_go___() {\n");
	}
	source.add(this.chunkTemplate.render.apply(this.chunkTemplate, arguments));
	if (chunk._chunkStyles) {
		source.add("\n}");
	}
	source.rendered = true;
	return source;
};

function insertCss(css) {
	var link = document.createElement("link");
	link.setAttribute("rel", "stylesheet");
	link.setAttribute("type", "text/css");
	link.setAttribute("href", "data:text/css;base64,"+btoa(css));
	link.addEventListener("load", ___go_js_go_go_go___);
	document.getElementsByTagName("head")[0].appendChild(link);
}
