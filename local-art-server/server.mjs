/**
 * Minimal local art server for optional TetraMaster integration.
 * Implements POST /card and returns a placeholder PNG dataUrl.
 * Used when VITE_ART_PROVIDER=local (e.g. in Docker "local mode").
 */
import http from 'node:http'

const PORT = Number(process.env.PORT) || 8081

// Minimal 1x1 transparent PNG as dataUrl (placeholder for any card)
const PLACEHOLDER_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

const parseBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString('utf8')
        resolve(body ? JSON.parse(body) : {})
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
    sendJson(res, 200, { ok: true, service: 'local-art' })
    return
  }

  if (req.method === 'POST' && req.url === '/card') {
    try {
      const body = await parseBody(req)
      const { id, name, seed } = body
      // Accept any payload; return placeholder. Replace with real image generation if needed.
      const dataUrl = PLACEHOLDER_DATA_URL
      sendJson(res, 200, { dataUrl })
    } catch (err) {
      sendJson(res, 400, { error: err.message || 'Bad request' })
    }
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Local art server listening on http://0.0.0.0:${PORT}`)
})
