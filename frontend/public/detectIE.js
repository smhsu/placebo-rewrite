/**
 * Gets whether the current browser is Internet Explorer.  Thanks to StackOverflow for this code!
 * http://stackoverflow.com/questions/19999388/jquery-check-if-user-is-using-ie
 *
 * @return whether the current browser is Internet Explorer
 */
function detectIsInternetExplorer() {
    var userAgent = window.navigator.userAgent;
    var msie = userAgent.indexOf("MSIE ");
    var trident = userAgent.indexOf("Trident/");
    if (msie > 0) {
        // IE 10 or older => return version number
        // return parseInt(userAgent.substring(msie + 5, userAgent.indexOf('.', msie)), 10);
        return true;
    }
    if (trident > 0) {
        // IE 11 (or newer) => return version number
        // var rv = userAgent.indexOf('rv:');
        // return parseInt(userAgent.substring(rv + 3, userAgent.indexOf('.', rv)), 10);
        return true;
    }
    // Other browser
    return false;
}

if (detectIsInternetExplorer()) {
    // Remove the "none" display, making the warning visible.
    document.getElementById("ie-warning").style.display = "";
}
