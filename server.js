// Hostinger Node.js startup file
// In hPanel: set "Application startup file" to server.js
// Build first: npm run build
// Then Hostinger will run: node server.js

const http = require("http");
const { parse } = require("url");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http
    .createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    })
    .listen(port, () => {
      console.log(`> Server running on port ${port}`);
    });
});
