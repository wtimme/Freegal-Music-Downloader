require('dotenv').config();
let parse = require('node-html-parser').parse;

// Configuration
let baseURL = 'https://api.freegalmusic.com/v1';

// Pass credentials via environment variables
let username = process.env.USERNAME;
let password = process.env.PASSWORD;
let libraryId = process.env.LIBRARY_ID;
let libraryHomepage = process.env.LIBRARY_HOMEPAGE;

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

setupBearerToken()
.then(login)
.then(ensureThatDownloadsAreAvailable)
.then(getSongsFromWishlistNotAlreadyDownloaded)
.then(result => console.log(result))
.catch(err => console.error(err));