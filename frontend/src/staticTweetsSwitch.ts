import querystring from "querystring";

const QUERY_KEY = "use_static_tweets";

export function getIsUsingStaticTweets(queryParams: querystring.ParsedUrlQuery) {
    return queryParams[QUERY_KEY] === "true";
}

export function getUrlWithStaticTweets() {
    const queryParams = querystring.parse(window.location.search.substring(1));
    queryParams[QUERY_KEY] = "true";
    return window.location.href.split("?")[0] + "?" + querystring.stringify(queryParams);
}

export function getUrlWithoutStaticTweets() {
    const queryParams = querystring.parse(window.location.search.substring(1));
    delete queryParams[QUERY_KEY];
    return window.location.href.split("?")[0] + "?" + querystring.stringify(queryParams);
}
