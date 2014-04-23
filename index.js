var path = require('path');
var RawSource = require("webpack/lib/RawSource");
var ChunkWithStyleTagTemplate = require("./ChunkWithStyleTagTemplate");
var less = require('less');
var async = require("async");

function LessPlugin(options) {
	options.less.syncImport = true;
	this.options = options;
}

module.exports = LessPlugin;

LessPlugin.prototype.apply = function (compiler) {
	var lessPlugin = this;

	compiler.plugin("compilation", function (compilation) {
		// XXX HACK - This monkey patch is temporary while
		// https://github.com/webpack/webpack/issues/243 is fixed.
		var oldFn = compilation.applyPluginsAsync;
		compilation.applyPluginsAsync = function() {
			this._currentPluginApply = this._currentPluginApply || 0;
			return oldFn.apply(this, arguments);
		};
		compilation.plugin("normal-module-loader", function (context, module) {
			context[__dirname] = function () {
				module.meta.slurpableLessFile = true;
			};
			return true;
		});
		compilation.plugin("optimize-tree", function (chunks, modules, cb) {
			async.each(chunks, function (chunk, cb) {
				var lessString = chunk.modules.reduce(function (acc, module) {
					if (module.meta && module.meta.slurpableLessFile) {
						var url = path.relative(lessPlugin.options.root, module.resource);
						return acc + "@import (less) \"" + url + "\";\n";
					} else {
						return acc;
					}
				}, "");
				less.render(lessString, lessPlugin.options.less, function (e, css) {
					if (e) {
						cb(e);
					} else {
						chunk._chunkStyles = css;
						cb();
					}
				});
			}, cb);
		});
		compilation.plugin("additional-chunk-assets", function(chunks) {
			chunks.forEach(function(chunk) {
				if (!lessPlugin.options.insertStyle) {
					var out = (lessPlugin.options.filename || "[name].css")
							.replace("[name]", chunk.name)
							.replace("[id]", chunk.id);
					compilation.assets[out] = new RawSource(chunk._chunkStyles);
					delete chunk._chunkStyles;
				}
			});
		});
	});
	compiler.plugin("after-plugins", function() {
		if (lessPlugin.options.insertStyle) {
			compiler.mainTemplate = new ChunkWithStyleTagTemplate(compiler.mainTemplate);
			compiler.chunkTemplate = new ChunkWithStyleTagTemplate(compiler.chunkTemplate);
		}
	});
};
