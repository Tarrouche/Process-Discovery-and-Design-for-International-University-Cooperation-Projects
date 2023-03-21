const { createServer } = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const http = require('http');
const path = require('path');

process.env.NODE_EXTRA_CA_CERTS = path.join(__dirname, 'certs', 'ca-certificate.crt');

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// SSL-Information 
const options = {
  key: fs.readFileSync('/etc/ssl/private/server_private_key.key'),
  cert: fs.readFileSync('/etc/ssl/certs/snorlax.wtf_ssl_certificate.cer'),
  ca: fs.readFileSync('/etc/ssl/certs/snorlax_intermedite.cer')
};

// Redirect all http requests to https
const httpServer = http.createServer((req, res) => {
  res.writeHead(301, { "Location": "https://www.snorlax.wtf" + req.url });
  res.end();
});

// Starting the HTTP server
httpServer.listen(80, '93.90.203.127', () => {
  console.log("HTTP server listening on port 80");
});

// Starting the HTTPS server
app.prepare().then(() => {
  createServer(options, (req, res) => {
    // Redirecting naked domain request 
    if (req.headers.host === "snorlax.wtf") {
      res.writeHead(301, { "Location": "https://www.snorlax.wtf" + req.url });
      return res.end();
    }
    // Get request path
    const parsedUrl = parse(req.url, true);
    // Establishing communication between https server and Next.js
    // Can't use SSL in testing environement on top of Next.js directly, this must be changed in production
    handle(req, res, parsedUrl);
  }).listen(443, '93.90.203.127', (err) => {
    if (err) throw err;
    console.log("> Server started on https://www.snorlax.wtf");
  });
});
