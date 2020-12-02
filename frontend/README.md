# Mechanism of Placebo Effect of Settings Study -- Frontend
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Use static tweets
Simply append `?use_static_tweets=true` as a query parameter to the URL.

## Debug rendering
We've included some helpful ways to control the frontend even if the backend isn't working, or if you want to test
frontend components independent of the backend.  This feature is only enabled with the environment variable
`REACT_APP_DEBUG_MODE=true` (it's set by default in development mode, but not in production).

## Other configuration
Other important, Qualtrics-related configuration can be found in the `.env` file.  Please note that changes to the
environment variables won't take effect until the app is restarted.
