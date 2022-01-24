# Freegal Music Downloader

Script for automatically downloading your music from Freegal.

## Running the script

First, install the dependencies:

    % npm install

To pass the credentials to the script, you can either prepend them to the script invocation, like so:

    % USERNAME="john.doe" \
      PASSWORD="top-secret" \
      LIBRARY_ID=1234 \
      LIBRARY_HOMEPAGE="https://your-library.freegalmusic.com" \
      npm start

Or, you can add them to an `.env` file, like so:

```
# .env
USERNAME="john.doe"
PASSWORD="top-secret"
LIBRARY_ID=1234
LIBRARY_HOMEPAGE="https://your-library.freegalmusic.com"
```

Make sure not to commit this file, though. You can now run the script using

    % npm start