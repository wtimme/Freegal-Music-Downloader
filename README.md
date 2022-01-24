# Freegal Music Downloader

Script for automatically downloading your music from Freegal.

## Running the script

First, install the dependencies:

    % npm install

To pass the credentials to the script, you can either prepend them to the script invocation, like so:

    % FREEGAL_USERNAME="john.doe" \
      FREEGAL_PASSWORD="top-secret" \
      FREEGAL_LIBRARY_ID=1234 \
      FREEGAL_LIBRARY_HOMEPAGE="https://your-library.freegalmusic.com" \
      npm start

Or, you can add them to an `.env` file, like so:

```
# .env
FREEGAL_USERNAME="john.doe"
FREEGAL_PASSWORD="top-secret"
FREEGAL_LIBRARY_ID=1234
FREEGAL_LIBRARY_HOMEPAGE="https://your-library.freegalmusic.com"
```

Make sure not to commit this file, though. You can now run the script using

    % npm start