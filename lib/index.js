"use strict";

const readFile = require("read-file-cache")
    , tljs = require("template-literal")
    , typpy = require("typpy")

class BloggifyRenderer {
    static init (config) {
        Bloggify.renderer.registerRenderer("tljs", BloggifyRenderer.render);
    }
    static factory (cb) {
        return function (ctx) {
            return cb((path, data, cb) =>
                BloggifyRenderer.render(ctx, path, data, cb)
            , ctx)
        }
    }
    static render (ctx, data, tmpl, cb) {
        const maybeCached = BloggifyRenderer.cache[tmpl.path]
        if (maybeCached) {
            data.statusCode = data.statusCode || data.error && data.error.statusCode || 200;

            const html = maybeCached(data)
            ctx.res.status(data.statusCode).end(html);
            return cb && cb(null, html);
        }

        readFile(tmpl.path, (err, raw) => {
            if (err) {
                return cb && cb(err);
            }

            const templFn = BloggifyRenderer.cache[tmpl.path] = tljs(raw)
            data.statusCode = data.statusCode || data.error && data.error.statusCode || 200;

            const html = templFn(data)
            ctx.res.status(data.statusCode).end(html);
            cb && cb(null, html);
        });
    }
}

BloggifyRenderer.cache = {}

module.exports = BloggifyRenderer
