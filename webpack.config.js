const path = require('path');

module.exports = {
	entry: './lib/index',
	output: {
		filename: 'mirage.js',
		path: path.resolve(__dirname, 'dist'),
		library: 'mirage',
		libraryTarget: 'umd',
        sourceMapFilename: 'mirage.map'
	},
	module: {
		rules: [
			{test: /\.js$/, loader: 'babel-loader', include: './lib'},
		]
	},
	devtool: 'cheap-module-source-map'
}