const http = require("http");
const path = require('path')
const fs = require("fs");
const url = require("url");
const querystring = require("querystring");
const nodemailer = require("nodemailer");

const PORT = process.env.PORT || 5000

let requestCount = 0;

// Email validation
const validateEmail = (email) =>  /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(email);

// create a server object
const server = http.createServer((req, res) => {
    requestCount++;
    // Serve the homepage to the client
    if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'views', 'index.html'), (err, data) => {
            if (err) throw err;
            res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end(data);
        });
    } else if (req.url.startsWith('/public/')) {
        fs.readFile(path.join(__dirname, req.url), (err, data) => {
            if (err) throw err;
            const ext = path.extname(req.url);
            let contentType = 'text/html';
            if (ext === '.css') contentType = 'text/css';
            if (ext === '.js') contentType = 'application/javascript';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
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
                subject: data.subject,
                text: data.message
            };
            // Send the email
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log(err);
                    res.end('An error occurred while trying to send the email.');
                } else {
                    console.log(`Email sent: ${info.response}`);
                    res.end('Email sent successfully!');
                }
            });
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('404 Not Found');
    }
});

// Log a report of the server connection
server.listen(PORT, (err) => {
    if (err) console.log('Error in server setup')
    console.log(`Server listening on Port: ${PORT}\nHTTP Request count: ${requestCount}`)
});