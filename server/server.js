const http = require('http');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');

// Server configuration
const port = 3000; // Port to listen on (can be pinned to 3000)

// File path for storing user data
const userFile = 'users.txt';

// Create the HTTP server
const server = http.createServer((req, res) => {
  // Parse the request URL and query string
  const parsedUrl = url.parse(req.url, true); 
  const path = parsedUrl.pathname;
  const params = parsedUrl.query;

  // Handle different request paths
  if (path === '/') {
    // Handle root path ("/")
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, welcome to our site!');
  } else if (path === '/users') {
    // Handle users path ("/users")
    fs.readFile(userFile, 'utf8', (err, data) => {
      if (err) {
        // Redirect to create page if no user data or error
        console.error('Error reading user data:', err);
        res.writeHead(302, { 'Location': '/create' });
        res.end();
      } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        // Display message if no users
        res.end(data || 'No users found yet.'); 
      }
    });
  } else if (path === '/create') {
    // Handle create path ("/create")
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <form method="POST" action="/add">
        <label for="userName">Username:</label>
        <input type="text" name="userName" id="userName" required>
        <input type="submit" value="Submit">
      </form>
    `);
  } else if (path === '/add' && req.method === 'POST') {
    // Handle add path ("/add") for POST requests
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const userName = querystring.parse(body).userName;
      fs.appendFile(userFile, userName + '\n', (err) => {
        if (err) {
          console.error('Error adding user:', err);
          // Internal Server Error
          res.writeHead(500, { 'Content-Type': 'text/plain' }); 
          res.end('Error adding user.');
        } else {
          res.writeHead(302, { 'Location': '/users' });
          res.end();
        }
      });
    });
  } else {
    // Handle not found ("404")
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page not found');
  }
});

// Start the server
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
