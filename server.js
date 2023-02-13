const http = require('http');
const path = require('path');
const fs = require('fs');
const querystring = require('querystring');
const nodemailer = require('nodemailer');
const zlib = require('zlib');

// Create a cache to store the file contents and metadata
const cache = new Map();

// Set default port number
const PORT = process.env.PORT || 5000;

// Create an HTTP server
const server = http.createServer((req, res) => {

    // Serve the index.html file
    if (req.url === '/') {
        // Check if the index.html file is in the cache
        if (cache.has('index.html')) {
            // If it is, send the cached response
            const cachedData = cache.get('index.html');
            res.writeHead(200, cachedData.headers);
            res.end(cachedData.data);
        } else {
            // If it's not, read the file from disk and store it in the cache
            fs.readFile(path.join(__dirname, 'views', 'index.html'), (err, data) => {
                if (err) throw err;

                // Check if client supports gzip or deflate compression
                const acceptEncoding = req.headers['accept-encoding'];
                if (!acceptEncoding || !acceptEncoding.match(/\b(gzip|deflate)\b/)) {

                    // If the client doesn't support compression, send a response without compression
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=31536000' });
                    res.end(data);
                    cache.set('index.html', { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=31536000' }, data: data });
                    return;
                }

                // If the client supports gzip compression
                if (acceptEncoding.match(/\bgzip\b/)) {

                    // Send the response using gzip compression
                    res.writeHead(200, { 'Content-Encoding': 'gzip', 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=31536000' });
                    zlib.gzip(data, (err, result) => {
                        if (err) throw err;
                        res.end(result);
                        cache.set('index.html', { headers: { 'Content-Encoding': 'gzip', 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=31536000' }, data: result });
                    });
                    return;
                }

                // If the client supports deflate compression
                if (acceptEncoding.match(/\bdeflate\b/)) {

                    // Send the response using deflate compression
                    res.writeHead(200, { 'Content-Encoding': 'deflate', 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=31536000' });
                    zlib.gzip(data, (err, result) => {
                        if (err) throw err;
                        res.end(result);
                        cache.set('index.html', { headers: { 'Content-Encoding': 'deflate', 'Content-Type': 'text/hmtl; charset=utf-8', 'Cache-Control': 'public, max-age=31536000' }, data: result });
                    });
                    return;
                }
            });
        }
    } else if (req.url === '/send-email' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const data = querystring.parse(body);
            // Create a transporter for sending emails
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'chandlerpaulk59@gmail.com',
                    pass: 'rnmf dhlw clkz cjxd'
                }
            });
            const mailOptions = {
                from: data.from + '<chandlerpaulk59@gmail.com>',
                to: 'chandlerpaulk59@gmail.com',
                subject: data.subject + ' - Portfolio Contact',
                text: data.message
            };
            // Send the email
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log(err);
                    res.writeHead(500, { 'Content-Type': 'text/html' })
                    res.end('An error occurred while trying to send the email.');
                } else {
                    console.log(`Email sent: ${info.response}`);
                    res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-store' })
                    res.end('Email sent successfully!');
                }
            });
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('404 Not Found');
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});