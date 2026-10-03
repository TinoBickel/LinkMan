const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const HOST = '127.0.0.1';
const PORT = 8765;
const ROOT = __dirname;

function getWindowsSessionStartMs() {
  if (process.platform !== 'win32') return 0;
  const command = '$sessionId = (Get-Process -Id $PID).SessionId; ' +
    '$explorer = Get-Process explorer -ErrorAction SilentlyContinue | ' +
    'Where-Object { $_.SessionId -eq $sessionId } | ' +
    'Sort-Object StartTime | Select-Object -First 1; ' +
    "if ($explorer) { $explorer.StartTime.ToUniversalTime().ToString('o') }";

  try {
    const output = execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', command], {
      encoding: 'utf8',
      timeout: 5000,
      windowsHide: true
    }).trim();
    const parsed = Date.parse(output);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

const SESSION_START_MS = getWindowsSessionStartMs();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function sendJson(response, statusCode, value) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*'
  });
  response.end(JSON.stringify(value));
}

function readConfig() {
  const text = fs.readFileSync(path.join(ROOT, 'LinkData.json'), 'utf8');
  return { data: JSON.parse(text), revision: crypto.createHash('sha256').update(text).digest('hex'), text };
}

function saveConfigCopy(data, kind) {
  const directory = path.join(ROOT, 'LinkMan-Backups');
  fs.mkdirSync(directory, { recursive: true });
  const name = kind + '-' + new Date().toISOString().replace(/[:.]/g, '-') + '-' + crypto.randomUUID() + '.json';
  fs.writeFileSync(path.join(directory, name), JSON.stringify(data, null, 2), { flag: 'wx' });
  return 'LinkMan-Backups/' + name;
}

function handleConfig(request, response) {
  const origin = request.headers.origin;
  if (origin && origin !== 'null' && origin !== `http://${HOST}:${PORT}` && origin !== `http://localhost:${PORT}`) {
    sendJson(response, 403, { error: 'Origin not allowed' });
    return;
  }
  if (request.method === 'GET') {
    try {
      const { data, revision } = readConfig();
      sendJson(response, 200, { data, revision });
    } catch {
      sendJson(response, 500, { error: 'Configuration could not be read' });
    }
    return;
  }
  if (request.method !== 'POST' || !String(request.headers['content-type'] || '').startsWith('application/json')) {
    sendJson(response, 405, { error: 'JSON POST required' });
    return;
  }
  let body = '';
  let size = 0;
  request.setEncoding('utf8');
  request.on('data', chunk => {
    size += Buffer.byteLength(chunk, 'utf8');
    if (size <= 20 * 1024 * 1024) body += chunk;
  });
  request.on('end', () => {
    if (size > 20 * 1024 * 1024) {
      sendJson(response, 413, { error: 'Configuration too large' });
      return;
    }
    let value;
    try {
      value = JSON.parse(body);
      if (!value.data || !Array.isArray(value.data.links) || !Array.isArray(value.data.areas) || !Array.isArray(value.data.widgets) || typeof value.revision !== 'string') throw new Error();
    } catch {
      sendJson(response, 400, { error: 'Invalid configuration' });
      return;
    }
    try {
      const current = readConfig();
      if (value.revision !== current.revision) {
        if (JSON.stringify(value.data) === JSON.stringify(current.data)) {
          sendJson(response, 200, { revision: current.revision });
          return;
        }
        const conflictFile = saveConfigCopy(value.data, 'Konflikt');
        sendJson(response, 409, { error: 'Configuration changed', conflictFile });
        return;
      }
      const text = JSON.stringify(value.data, null, 2);
      if (text !== current.text) {
        saveConfigCopy(current.data, 'Sicherung');
        const temporaryPath = path.join(ROOT, '.LinkData-' + crypto.randomUUID() + '.tmp');
        fs.writeFileSync(temporaryPath, text, { flag: 'wx' });
        fs.renameSync(temporaryPath, path.join(ROOT, 'LinkData.json'));
      }
      sendJson(response, 200, { revision: crypto.createHash('sha256').update(text).digest('hex') });
    } catch {
      sendJson(response, 500, { error: 'Configuration could not be saved' });
    }
  });
}

function serveFile(response, requestPath) {
  const relativePath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
  const filePath = path.resolve(ROOT, relativePath);
  const rootPrefix = ROOT.endsWith(path.sep) ? ROOT : ROOT + path.sep;
  if (filePath !== ROOT && !filePath.startsWith(rootPrefix)) {
    sendJson(response, 403, { error: 'Forbidden' });
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendJson(response, error.code === 'ENOENT' ? 404 : 500, { error: 'File not available' });
      return;
    }
    response.writeHead(200, {
      'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    response.end(data);
  });
}

const server = http.createServer((request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Private-Network': 'true'
    });
    response.end();
    return;
  }

  let requestPath;
  try {
    requestPath = decodeURIComponent(new URL(request.url, `http://${HOST}:${PORT}`).pathname);
  } catch {
    sendJson(response, 400, { error: 'Invalid URL' });
    return;
  }

  if (requestPath === '/api/config') {
    handleConfig(request, response);
    return;
  }
  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  if (requestPath === '/api/system-info') {
    const uptimeSeconds = os.uptime();
    sendJson(response, 200, {
      bootTimeMs: Date.now() - uptimeSeconds * 1000,
      sessionStartMs: SESSION_START_MS,
      uptimeSeconds
    });
    return;
  }

  serveFile(response, requestPath);
});

if (require.main === module) server.listen(PORT, HOST, () => {
  console.log(`LinkMan läuft auf http://${HOST}:${PORT}`);
});
module.exports = { server };
