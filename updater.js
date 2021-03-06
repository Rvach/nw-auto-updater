var request  = require('request');
var progress = require('request-progress');
var unzip = require('unzip');
var fs = require('fs');

var configuration = {
	'encoding'       : 'utf-8',
	'extractPath'    : null,
	'nwGui'          : null,
	'remoteManifest' : null,
	'tmpManifest'    : null,
	'tmpArchive'     : null,

	'update-not-available' : function() {},
	'update-available'     : function() {},
	'update-downloaded'    : function() {},
	'update-downloading'   : function() {},
	'update-installed'     : function() {},
	'error'                : function() {}
};

var configure = function(options)
{
	for(var property in options)
		configuration[property] = options[property];

	configuration.remoteManifest = configuration.remoteManifest.replace(/{{version}}/, configuration['nwGui'].App.manifest.version);
};

var install = function()
{
	fs.createReadStream(configuration.tmpArchive)
		.pipe(unzip.Extract({ path: configuration.extractPath }))
		.on('finish', configuration['update-installed']);
};

var download = function()
{
	var manifest = fs.readFileSync(configuration.tmpManifest, configuration.encoding);
	try {
		manifest = JSON.parse(manifest);
	}
	catch(e) { configuration['update-not-available'](); return false; }

	var pkg = progress(request(manifest.url), function(err, res)
	{
		if(err || response.statusCode != 200)
			configuration.error(err);
	});

	pkg.pipe(fs.createWriteStream(configuration.tmpArchive));
	pkg.on('error', configuration.error);
	pkg.on('progress', function(state) {
		configuration['update-downloading'](state);
	});
	pkg.on('end', function() {
		install();
		configuration['update-downloaded']();
	});
};

var launch = function()
{
	var pkg = request(configuration.remoteManifest, function(err, response)
	{
		if(err)
			configuration.error(err);

		if(response.statusCode == 200 && response.headers['content-type'].indexOf("json") > -1)
			configuration['update-available']();

		else
		{
			pkg.abort();
			configuration['update-not-available']();
		}
	});

	pkg.pipe(fs.createWriteStream(configuration.tmpManifest));
	pkg.on('error', configuration.error);
	pkg.on('end', download);
};

exports.configuration = configuration;
exports.launch        = launch;
exports.configure     = configure;