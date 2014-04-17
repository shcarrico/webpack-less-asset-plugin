var path = require('path');
var RawSource = require("webpack/lib/RawSource");
var less = require('less');

function LessPlugin(options) {
	this.options = options;
}

LessPlugin.prototype.apply = function (compiler) {
	var lessPlugin = this;

	compiler.plugin("compilation", function (compilation) {
		compilation.plugin("normal-module-loader", function (context, module) {
			context[__dirname] = function () {
				module.meta.slurpableLessFile = true;
			};
			return true;
		});
		compilation.plugin("optimize-chunk-assets", function (chunks, cb) {
			chunks.forEach(function (chunk) {
				var lessString = chunk.modules.reduce(function (acc, module) {
					if (module.meta && module.meta.slurpableLessFile) {
						var url = path.relative(lessPlugin.options.root, module.resource);
						return acc + "@import (less) \"" + url + "\";\n";
					} else {
						return acc;
					}
				}, "");

				less.render(lessString, lessPlugin.options , function (e, css) {
					if(e){
						cb(e);
					}else{
						compilation.assets[chunk.name + ".css"] = new RawSource(css);
						cb();
					}
				});

			});
		});
	});
};

module.exports = LessPlugin;