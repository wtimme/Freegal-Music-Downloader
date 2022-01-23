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

const getAuthenticationToken = (username, password, libraryId) => {
  return new Promise((resolve, reject) => {
    axios.post(`/login`, {
      identifier1: username,
      identifier2: password,
      libraryId: libraryId
    })
    .then(function (response) {
      resolve(response.data.data.authenticationToken);
    })
    .catch(reject);
  });
};

const getNumberOfAvailableDownloads = (authenticationToken) => {
  return new Promise((resolve, reject) => {
    axios.get('/user/details', {
      headers: { 'authenticationToken': authenticationToken  }
    })
    .then(function (response) {
      resolve(response.data.data.items.availabledownload);
    })
    .catch(function (error) {
      console.log(error);
    });
  });
};

const downloadSongs = () => {
  return new Promise((resolve, reject) => {
    getAuthenticationToken(username, password, libraryId)
    .then(getNumberOfAvailableDownloads)
    .then(numberOfAvailableDownloads => {
      if (numberOfAvailableDownloads == 0) {
        reject("Maximum number of downloads reached.");
        return;
      }


    })
  });
};

downloadSongs()
.then(result => { console.log(result); })
.catch(err => console.error(err));