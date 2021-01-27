var express = require('express');
var Cache = require('node-cache')
var Feed = require('rss-to-json');
const { response } = require('express');
var port = process.env.PORT || 5500
var app = express();
var cache = new Cache();
app.get("/", (request, response) => {
    response.writeHead(200, {
        "content-type": "text/plain",
        'cache-control': 'no-cache',
        'access-control-allow-origin': '*',
        'connection': 'keep-alive'
    });
    response.write(`
    Convert rss to json.
    do this url + /link_to_rss
    must be URL encoded or things will explode.
    `);
    response.end()
});
app.get("/:rssurl", (request, response) => {
    var rssurl = decodeURIComponent(request.params.rssurl);
    if (rssurl.startsWith("https://") || rssurl.startsWith("http://")) {
        response.writeHead(200, {
            "content-type": "application/json",
            'cache-control': 'no-cache',
            'access-control-allow-origin': '*',
            'connection': 'keep-alive'
        });
        var cachedrss = cache.get(rssurl);
        if (cachedrss == undefined) {
            Feed.load(rssurl)
                .then(feed => {
                    console.log("not in cache! getting e")
                    response.write(JSON.stringify(feed));
                    response.end();
                    cache.set(rssurl, feed, 900)
                })
                .catch(e => {
                    response.write(JSON.stringify(e));
                    response.end();
                    console.log("err");
                });
        }
        else{
            console.log("getting from cache");
            response.write(JSON.stringify(cachedrss));
            response.end();
            Feed.load(rssurl)
                .then(feed => {
                    console.log("re- caching")
                    cache.set(rssurl, feed, 900)
                })
                .catch(e => {
                    console.log("error caching");
                });
        }

    }
    else {
        console.log("idiot alert")
        response.writeHead(200, {
            "content-type": "text/plain",
            'cache-control': 'no-cache',
            'access-control-allow-origin': '*',
            'connection': 'keep-alive'
        });
        response.write(`
        Ideot. you messus up the rwqest!!
        `);
        response.end();
    }
});
app.listen(port);