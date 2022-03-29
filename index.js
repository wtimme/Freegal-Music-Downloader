require('dotenv').config();
const parse = require('node-html-parser').parse;
const path = require('path');
const fs = require('fs');

// Configuration
let baseURL = 'https://api.freegalmusic.com/v1';
let outputDirectory = './out';

// Pass credentials via environment variables
let username = process.env.FREEGAL_USERNAME;
let password = process.env.FREEGAL_PASSWORD;
let libraryId = process.env.FREEGAL_LIBRARY_ID;
let libraryHomepage = process.env.FREEGAL_LIBRARY_HOMEPAGE;

const axios = require('axios').create({ baseURL: baseURL });

const setupBearerToken = () => {
  return new Promise((resolve, reject) => {
    console.log("Setting up the Bearer token");

    axios.get(libraryHomepage + '/home')
    .then(function(response) {
      let root = parse(response.data);
      let authTokenInputValue =  root.querySelector('#authToken').getAttribute('value');
      let authTokenJSON = JSON.parse(authTokenInputValue);
      let bearerToken = authTokenJSON.accessToken

      axios.defaults.headers.common['Authorization'] = 'Bearer ' + bearerToken;
      
      resolve(bearerToken);
    })
    .catch(reject);
  });
};

const login = () => {
  return new Promise((resolve, reject) => {
    console.log("Performing login");

    axios.post(`/login`, {
      identifier1: username,
      identifier2: password,
      libraryId: libraryId
    })
    .then(function (response) {
      if (response.data.success) {
        let authenticationToken = response.data.data.authenticationToken
        axios.defaults.headers.common['authenticationToken'] = authenticationToken;
        resolve(authenticationToken);
      } else {
        reject(response.data.responseMessage);
      }
    })
    .catch(reject);
  });
};

const getNumberOfAvailableDownloads = () => {
  return new Promise((resolve, reject) => {
    axios.get('/user/details')
    .then(function (response) {
      resolve(response.data.data.items.availabledownload);
    })
    .catch(reject);
  });
};

const ensureThatDownloadsAreAvailable = () => {
  return new Promise((resolve, reject) => {
    console.log("Making sure that downloads are available");
    
    getNumberOfAvailableDownloads()
    .then(numberOfAvailableDownloads => {
      if (numberOfAvailableDownloads == 0) {
        reject("Maximum number of downloads reached.");
        return;
      }
    
      resolve();
    }).catch(reject);
  });
};

const getDownloadedSongsIds = () => {
  return new Promise((resolve, reject) => {
    console.log("Retrieving the IDs of the songs that have already been downloaded");
    
    axios.get('/user/downloaded/songsIds')
    .then(function (response) {
      let songIds = response.data.data.songs.map(songObject => songObject.songId)

      resolve(songIds);
    })
    .catch(reject);
  });
};

const getWishlist = () => {
  return new Promise((resolve, reject) => {
    console.log("Retrieving the wishlist");
    
    axios.get('/user/wishlist')
    .then(function (response) {
      let songIds = response.data.data.songs.map(songObject => songObject.songId)

      resolve(songIds);
    })
    .catch(reject);
  });
};

const getSongsFromWishlistNotAlreadyDownloaded = () => {
  return new Promise((resolve, reject) => {
    console.log("Determining the songs that have not yet been downloaded");
    
    getWishlist()
    .then(songIds => {
      getDownloadedSongsIds()
      .then(downloadedSongsIds => {
        console.log('Wishlist:', songIds);
        console.log('Already downloaded:', downloadedSongsIds);

        let notAlreadyDownloaded = songIds.filter(id => !downloadedSongsIds.includes(id))

        resolve(notAlreadyDownloaded);
      })
      .catch(reject);
    })
    .catch(reject);
  });
};

const getSongsToDownload = () => {
  return new Promise((resolve, reject) => {
    console.log("Determining the songs to download");
    
    getSongsFromWishlistNotAlreadyDownloaded()
    .then(songIds => {
      getNumberOfAvailableDownloads()
      .then(numberOfAvailableDownloads => {
        let songsToDownload = songIds.slice(0, numberOfAvailableDownloads);
        resolve(songsToDownload);
      })
      .catch(reject);
    })
    .catch(reject);
  });
};

// - Adding the songs to the "library" so that they can be downloaded

const getDownloadURL = (songId) => {
  return new Promise((resolve, reject) => {
    console.log("Getting download URL for song", songId);

    axios.post(`/downloads/song`, {
      songId: songId,
      provider: 2
    })
    .then(function (response) {
      if (!response.data.success) {
        reject(response.data.responseMessage);
        return;
      }
      
      let url = decodeURIComponent(response.data.data.downloadUrl);
      console.log(url);

      resolve(url);
    })
    .catch(reject);
  });
};

const getDownloadURLs = (songIds) => {
  let promises = songIds.map(id => getDownloadURL(id));

  return Promise.all(promises);
};

// - Downloading the actual MP3 files

const downloadSongs = (urls) => {
  let promises = urls.map(url => downloadSongFromURL(url));

  return Promise.all(promises);
};

const downloadSongFromURL = (url) => {
  return new Promise((resolve, reject) => {
    console.log("Downloading", url);
    
    axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    })
    .then(function (response) {
      const filenameWithParameters = path.basename(url);
      const filename = filenameWithParameters.substring(0, filenameWithParameters.indexOf("?"));
      let outputPath = outputDirectory + '/' + filename;

      response.data.pipe(fs.createWriteStream(outputPath))

      resolve();
    })
    .catch(reject)
    resolve();
  });
};

setupBearerToken()
.then(login)
.then(ensureThatDownloadsAreAvailable)
.then(getSongsToDownload)
.then(getDownloadURLs)
.then(downloadSongs)
.then(result => console.log("Downloads finished."))
.catch(err => console.error(err));