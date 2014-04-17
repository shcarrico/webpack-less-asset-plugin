module.exports = function(source) {
	this.cacheable && this.cacheable();
	this[__dirname] && this[__dirname]();
	return "// removed by less loader";
};