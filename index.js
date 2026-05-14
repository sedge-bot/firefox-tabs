'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const ini = require('ini');
const osHomedir = require('os-homedir');
const pify = require('pify');

const fsP = pify(fs);

function normalizeOptions(options) {
  if (typeof options === 'string' || typeof options === 'number') {
    return {profile: options};
  }

  return options || {};
}

function getFirefoxPath(options) {
  options = normalizeOptions(options);

  if (options.firefoxPath) {
    return options.firefoxPath;
  }

  if (process.platform === 'win32') {
    return process.env.APPDATA + '/Mozilla/Firefox/';
  }

  return process.platform === 'darwin' ? osHomedir() + '/Library/Application Support/Firefox/' : osHomedir() + '/.mozilla/firefox/';
}

function getProfiles(conf) {
  const profiles = [];

  Object.keys(conf).forEach(key => {
    if (/^Profile\d+$/.test(key)) {
      profiles.push({key, profile: conf[key]});
    }
  });

  profiles.sort((a, b) => Number(a.key.replace('Profile', '')) - Number(b.key.replace('Profile', '')));

  return profiles;
}

function selectProfile(profiles, profileName) {
  let selected;

  if (profileName !== undefined) {
    profiles.some(item => {
      const index = Number(item.key.replace('Profile', ''));
      if (item.profile.Name === profileName || item.key === profileName || index === profileName || String(index) === profileName) {
        selected = item.profile;
        return true;
      }

      return false;
    });

    if (!selected) {
      throw new Error('Firefox profile not found: ' + profileName);
    }

    return selected;
  }

  profiles.some(item => {
    if (item.profile.Default === '1' || item.profile.Default === 1) {
      selected = item.profile;
      return true;
    }

    return false;
  });

  return selected || (profiles[0] && profiles[0].profile);
}

function profilePath(options) {
  options = normalizeOptions(options);
  const ffConfDir = getFirefoxPath(options);
  let profile;

  try {
    const conf = ini.parse(fs.readFileSync(path.join(ffConfDir, 'profiles.ini'), 'utf-8'));
    profile = selectProfile(getProfiles(conf), options.profile);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('Unable to read Firefox\'s profiles.ini configuration.');
    } else {
      throw err;
    }
  }

  if (!profile) {
    return ffConfDir;
  }

  if (profile.IsRelative === '0' || profile.IsRelative === 0) {
    return profile.Path;
  }

  return path.join(ffConfDir, profile.Path);
}

function recoveryFile(options) {
  return path.join(profilePath(options), 'sessionstore-backups/recovery.js');
}

const parse = buf => {
  const session = JSON.parse(buf);
  const tabs = [];

  session.windows.forEach(window => {
    window.tabs.forEach(tab => {
      const tabObject = tab.entries.pop();
      tabs.push({title: tabObject.title, url: tabObject.url});
    });
  });

  return {
    deviceName: os.hostname(),
    modified: new Date(session.session.lastUpdate),
    tabCount: tabs.length,
    tabs
  };
};

const emptySession = () => ({
  deviceName: os.hostname(),
  modified: new Date(),
  tabCount: 0,
  tabs: []
});

module.exports = options => fsP.readFile(recoveryFile(options), 'utf8')
  .then(parse)
  .catch(err => {
    if (err.code === 'ENOENT') {
      console.log('Unable to parse recovery.js. Returning empty session data object.');
      return emptySession();
    }
    throw err;
  });

module.exports.sync = options => {
  try {
    return parse(fs.readFileSync(recoveryFile(options), 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('Unable to parse recovery.js. Returning empty session data object.');
      return emptySession();
    }
    throw err;
  }
};

module.exports.profilePath = profilePath;
