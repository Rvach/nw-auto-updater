nw-auto-updater (NWAU)
======================

This is [nw](https://github.com/rogerwang/node-webkit)-auto-updater, inspired by [electron-autoUpdater API](http://electron.atom.io/docs/v0.33.0/api/auto-updater/)

```
npm install nw-auto-updater
```

it gives high level API to :

1. Check if an update is available or not
2. Download an update
3. Install an update
4. Restart your node-webkit app

## API

### configure

Configure NWAU. 

**Params**

* **options** `Object`
	* **encoding** `String` the remote manifest file encoding. Default to 'utf-8'
	* **nw-gui** `nw-gui` the nw-gui instance, like `var gui = require('nw.gui')`
	* **remoteManifest** `String` the remote manifest file url, like `http://www.exemple.com?version={{version}}`. NWAU will replace `{{version}}` with the package.json version
	* **tmpManifest** `String` the path where manifest will be stored, like `path.resolve('./tmp/update_manifest.json')`. `tmp` directory must exists
	* **tmpArchive** `String` the path where zip archive will be stored, like `path.resolve('./tmp/update_archive.zip')`. `tmp` directory must exists
	* **update-not-available** `Function` callback called if updates are not available (server unreachable or client up to date)
	* **update-available** `Function` callback called if updates are available (server return a status 200 code)
	* **update-downloaded** `Function` callback called when zip archive is downloaded 
	* **update-downloading** `Function` callback called when download is progressing
	* **error** `Function` callback called if ay errors are encountered

### launch

Launch auto update. Must be called after `updater.configure()`

### Update JSON Format

When an update is available, NWAU expects the following schema in response to the update request provided:

```json
{
  "url": "http://mycompany.com/myapp/releases/myrelease",
  "name": "My Release Name",
  "notes": "Theses are some release notes innit",
  "pub_date": "2013-09-18T12:29:53+01:00"
}
```

The only required key is "url" the others are optional. NWAU only supports installing ZIP updates for now, and your server must return an `'application/json'` response. Your zip archive must replace the package.json with a correct app version, or updates will be downloaded in an infinite loop.

### Exemple 

```javascript
var updater = require('nw-auto-updater');
var path = require('path');

updater.configure({
	'remoteManifest' : 'http://yourserver.com/?version={{version}}',
	'tmpManifest'    : path.resolve('tmp/update_manifest.json'),
	'tmpArchive'     : path.resolve('tmp/update_archive.zip'),
	'extractPath'    : path.resolve('.'),
	'nwGui'          : require('nw.gui'),


	'update-available' : function() {
		console.log('available');
	},
	'update-not-available' : function() {
		console.log('not available');
	},
	'update-downloading' : function(state) {
		console.log('downloading, ' + state.percent + " %");
	},
	'update-downloaded' : function() {
		console.log('zip downloaded');
	},
	'update-installed' : function() {
		console.log('archive installed');
	},
	'error' : function(e) {
		console.error(e);
	}
});

updater.launch();
```

## TODO

Refactor callbacks to events

Replace unzip with adm-zip.
