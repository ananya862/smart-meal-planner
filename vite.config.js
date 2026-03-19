import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/*.png', 'icons/*.svg'],
        manifest: {
          name: 'Smart Meal Planner',
          short_name: 'MealPlanner',
          description: 'Plan meals, track nutrition, and generate grocery lists',
          theme_color: '#2D5016',
          background_color: '#FAFAF7',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } }
            },
          ]
        }
      }),
      // Local dev middleware that mimics api/claude.js
      {
        name: 'api-proxy',
        configureServer(server) {
          server.middlewares.use('/api/claude', async (req, res) => {
            if (req.method === 'OPTIONS') {
              res.writeHead(200); res.end(); return;
            }
            if (req.method !== 'POST') {
              res.writeHead(405); res.end(); return;
            }
            try {
              // Read request body
              let rawBody = '';
              await new Promise((resolve, reject) => {
                req.on('data', chunk => rawBody += chunk);
                req.on('end', resolve);
                req.on('error', reject);
              });
              let body = JSON.parse(rawBody);

              // Handle fetchUrl — fetch the page server-side
              if (body.fetchUrl) {
                const url = body.fetchUrl;
                delete body.fetchUrl;
                const pageRes = await fetch(url, {
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml',
                  },
                });
                if (!pageRes.ok) throw new Error(`Could not fetch page: ${pageRes.status}`);
                const html = await pageRes.text();
                const plain = html
                  .replace(/<script[\s\S]*?<\/script>/gi, '')
                  .replace(/<style[\s\S]*?<\/style>/gi, '')
                  .replace(/<[^>]+>/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim()
                  .slice(0, 8000);
                body.messages = [{ role: 'user', content: `Extract the recipe from this webpage. URL: ${url}\n\nPage content:\n${plain}` }];
              }

              // Call OpenRouter
              const messages = [];
              if (body.system) messages.push({ role: 'system', content: body.system });
              if (body.messages) messages.push(...body.messages);

              const apiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${env.GROQ_API_KEY}`,
                                  },
                body: JSON.stringify({
                  model: 'llama-3.3-70b-versatile',
                  messages,
                  max_tokens: 2000,
                  temperature: 0.7,
                }),
              });
              const orData = await apiRes.json();
              // Handle error from OpenRouter
              if (orData.error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: orData.error.message || JSON.stringify(orData.error) }));
                return;
              }
              const choice = orData.choices?.[0];
              const text = choice?.message?.content || choice?.text || '';
              if (!text) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Model returned empty response. Try again.' }));
                return;
              }
              const data = { content: [{ type: 'text', text }] };
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(data));
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        }
      }
    ],
  }
})
