const PROXY_CONFIG = {
  "/api/**": {
    "target": "http://localhost:8080/vdk/api",
    "logLevel": "debug",
    "bypass": function (req, res, proxyOptions) {
      req.headers["X-Custom-Header"] = "yes";      
      console.log(req.path);
      if (req.path.indexOf('/assets') > -1) {
        return req.url;
      }
      if (req.path.indexOf('/search') > -1) {
        return "/mock/search.json";
      } else if (req.path.indexOf('/users/login') > -1) {
        if (req.method === 'POST') {
          req.method = 'GET';
        }
        return "/mock/user.json";
      } else if (req.path.indexOf('/users/views') > -1) {
        return "/mock/views.json";
      } else if (req.path.indexOf('/demands/all') > -1) {
        return "/mock/demands.json";
      } else if (req.path.indexOf('/offers/all') > -1) {
        return "/mock/offers.json";
      } else if (req.path.indexOf('/offers/byid') > -1) {
        return "/mock/offer.json";
      }
    },
    "pathRewrite": {
      "^/api":""
    },
    "changeOrigin": false,
    "secure": false
  }
};
module.exports = PROXY_CONFIG;
