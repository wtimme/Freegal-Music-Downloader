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

const login = (username, password, libraryId) => {
  return new Promise((resolve, reject) => {
    axios.post(`/login`, {
      identifier1: username,
      identifier2: password,
      libraryId: libraryId
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
  });
};

login(username, password, libraryId)
  .then(data => console.log(data))
  .catch(err => console.error(err));