import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Vite plugin to run Netlify Functions locally in development
function netlifyFunctionsPlugin() {
  return {
    name: 'netlify-functions-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        if (!url.pathname.startsWith('/api/')) {
          return next();
        }

        const functionName = url.pathname.replace(/^\/api\//, '').split('?')[0];
        const functionPath = path.resolve(__dirname, `netlify/functions/${functionName}.mjs`);

        try {
          // Read request body if present
          let body = null;
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            body = Buffer.concat(chunks).toString('utf-8');
          }

          // Build Web Request
          const requestHeaders = new Headers();
          for (const [k, v] of Object.entries(req.headers)) {
            if (Array.isArray(v)) {
              v.forEach((val) => requestHeaders.append(k, val));
            } else if (v) {
              requestHeaders.set(k, v);
            }
          }

          const webRequest = new Request(url.href, {
            method: req.method,
            headers: requestHeaders,
            body: body && ['POST', 'PUT', 'PATCH'].includes(req.method) ? body : undefined
          });

          // Import function handler dynamically using file:// URL for Windows compatibility
          const fileUrl = `${pathToFileURL(functionPath).href}?t=${Date.now()}`;
          const mod = await import(fileUrl);
          const handler = mod.default || mod.handler;

          if (typeof handler !== 'function') {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: `Handler for ${functionName} is not a function.` }));
          }

          const webResponse = await handler(webRequest);

          // Write headers
          const responseHeaders = {};
          if (webResponse.headers) {
            webResponse.headers.forEach((value, key) => {
              // Handle multiple set-cookie if needed
              if (key.toLowerCase() === 'set-cookie') {
                responseHeaders['set-cookie'] = value;
              } else {
                responseHeaders[key] = value;
              }
            });
          }

          res.writeHead(webResponse.status || 200, responseHeaders);
          const responseBody = await webResponse.text();
          res.end(responseBody);
        } catch (err) {
          console.error(`Error executing local function ${functionName}:`, err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message, stack: err.stack }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), netlifyFunctionsPlugin()],
  server: {
    port: 5173,
    host: true
  }
});
