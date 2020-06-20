# Mechanism of Placebo Effect of Settings Study -- Frontend
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Debug rendering
We've included some helpful ways to control the frontend even if the backend isn't working, or if you want to test
frontend components independent of the backend.  This feature is only enabled with the environment variable
`REACT_APP_USE_DEBUG_QUERY_PARAMS=true` (it's set by default in development mode, but not in production).  After that,
you can choose what debug flags you want to enable by adding
[query parameters](https://en.wikipedia.org/wiki/Query_string) to the URL in your web browser.

**Convenience URL that enables all flags:** http://localhost:3000/?use_static_tweets=true&show_setting_chooser=true

### Use static set of tweets: `use_static_tweets=true`
Skips the login flow and directly renders a predefined set of Tweets (the ones in `sampleTweets.json`).

### Show a setting chooser: `show_setting_chooser=true`
While the kind of setting is normally selected by the server, this flag allows you to manually select the kind of
setting that controls Tweet ordering/filtering.
