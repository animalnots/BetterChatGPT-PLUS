import type { Handler } from 'vite-plugin-mix';
import { readFileSync, writeFileSync } from "fs";

export const handler: Handler = (req, res, next) => {
  // Endpoint to sync messages between devices
  if (req.path === '/sync') {
    // POST method to upload data
    if (req.method === 'POST') {
      // Get data
      let data = "";

      req.on('data', chunk => {
        // Add data chunk
        data += chunk;
      }).on('end', () => {
        // Write to file
        writeFileSync("data.json", data, {flag: "w"});

        // Done
        return res.end('ok');
      });
    }
    
    // GET method to fetch data
    else if (req.method === 'GET') {
      // Read file
      let data = readFileSync('data.json', 'utf-8');

      // Set header
      res.setHeader('content-type', 'application/json');

      // Send
      return res.end(data);
    }
    
    // Other methods are not allowed
    else {
      return res.end('Method not allowed');
    }
  }
  next()
}