// Parse Query Parameters function to get query parameters from URL, client-side
//
// Created by Dr Jacek Kopecky, adapted from Stack Overflow
//
// Used with permission 22/01/2016

var parseQueryParams;

(function () {
    var q = undefined;
    // query parsing functions, adapted from stackoverflow
    parseQueryParams = function () {
        if (q != undefined) {
            return q;
        }

        q = location.search.substring(1).replace(/\+/g, ' ');

        /* parse the query */
        var x = q.replace(/;/g, '&').split('&'), i, name, t;
        /* q changes from string version of query to object */
        for (q = {}, i = 0; i < x.length; i++) {
            t = x[i].split('=', 2);
            name = decodeURIComponent(t[0]);
            if (!q[name])
                q[name] = [];
            if (t.length > 1) {
                q[name][q[name].length] = decodeURIComponent(t[1]);
            }
                /* next two lines are nonstandard */
            else
                q[name][q[name].length] = true;
        }
        return q;
    }
})();
