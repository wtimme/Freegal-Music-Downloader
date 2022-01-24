require('dotenv').config();

// Configuration
let baseURL = 'https://api.freegalmusic.com/v1';
let bearerToken = 'N2ZmNTNlZDRiN2FiNWRjN2EwOWY3MDkwYWVlZmE5YzkyZmRlNTA2OGRjYzIwMTlkMGUyMTFlZDE4YTg5ZDI3Ng';

// Pass credentials via environment variables
let username = process.env.USERNAME;
let password = process.env.PASSWORD;
let libraryId = process.env.LIBRARY_ID;

const axios = require('axios').create({
  baseURL: baseURL,
  headers: { 'Authorization': 'Bearer ' + bearerToken }
});

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

login()
.then(ensureThatDownloadsAreAvailable)
.then(getDownloadedSongsIds)
.catch(err => console.error(err));