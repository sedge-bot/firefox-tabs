# firefox-tabs [![Build Status](https://travis-ci.org/justfielding/firefox-tabs.svg?branch=master)](https://travis-ci.org/justfielding/firefox-tabs)[![Coverage Status](https://coveralls.io/repos/github/justfielding/firefox-tabs/badge.svg?branch=master)](https://coveralls.io/github/justfielding/firefox-tabs?branch=master)
> Get Firefox tab information from sessionstore's recovery.js file.


## Install

```
$ npm install --save firefox-tabs
```


## Usage

```js

const firefoxTabs = require('firefox-tabs');

console.log(firefoxTabs.sync());
/*
{
  deviceName: 'sage',
  modified: 2016-09-26T18:49:13.682Z,
  tabCount: 2,
  tabs: [
    {
      title: 'imbue.studio',
      url: 'https://imbue.studio'
    },
    {
      title: 'Google',
      url:  'https://www.google.com'
    }
  ]
}
*/
```


## API
Tabs are fetched from firefox's `sessionstore-backup` folder for the current profile.

### firefoxTabs([options])

Returns a promise for an array of `devices`.

### firefoxTabs.sync([options])

Returns an array of `devices`.

### Options

#### profile

Type: `string`, `number`, or `object`

Pass a string/number directly, or pass an options object with `profile`.
Selects a Firefox profile by `Name`, `ProfileN` section, or numeric index from `profiles.ini`.
If omitted, firefox-tabs uses the profile marked `Default=1` and falls back to `Profile0`.

## Related

- [firefox-tabs-cli](https://github.com/justfielding/firefox-tabs-cli) - Get Firefox tab information from sessionstore's recovery.js file via command line

## License

BSD 3-Clause © [Fielding Johnston](http://justfielding.com)
