import { createServer, IncomingMessage, ServerResponse } from 'http';
import { readFileSync, watch } from 'fs';
import { execSync } from 'child_process';
import { checkRestrictions, CheckResults } from './check-restrictions.js';

const PORT = 3000;
let cachedChecks: CheckResults | null = null;

// Store SSE clients for broadcasting reload events
const sseClients: Set<ServerResponse> = new Set();

// Get Git repository information
function getGitInfo() {
  try {
    const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf-8' }).trim();
    const username = execSync('git config user.name', { encoding: 'utf-8' }).trim();
    const email = execSync('git config user.email', { encoding: 'utf-8' }).trim();
    
    // Parse GitHub repo from remote URL
    let repoUrl = remoteUrl;
    if (remoteUrl.includes('github.com')) {
      // Handle both SSH and HTTPS URLs
      const match = remoteUrl.match(/github\.com[:/](.+?)(?:\.git)?$/);
      if (match) {
        repoUrl = `https://github.com/${match[1]}`;
      }
    }
    
    return {
      username,
      email,
      remoteUrl: repoUrl,
      isGitRepo: true
    };
  } catch (error) {
    return {
      username: null,
      email: null,
      remoteUrl: null,
      isGitRepo: false,
      error: 'Not a git repository or git not configured'
    };
  }
}

// Run checks initially
async function updateChecks() {
  try {
    cachedChecks = await checkRestrictions('./game.js');
    console.log(`\n🔄 Checks updated at ${new Date().toLocaleTimeString()}`);
    console.log(`   Size: ${cachedChecks.sizeKB.toFixed(2)} KB`);
    console.log(`   Status: ${cachedChecks.passed ? '✅ Passing' : '❌ Failing'}`);

    // Notify all connected clients to reload
    broadcastReload();
  } catch (error) {
    console.error('Error running checks:', error);
  }
}

// Broadcast reload event to all SSE clients
function broadcastReload() {
  sseClients.forEach((client) => {
    try {
      client.write('data: reload\n\n');
    } catch (error) {
      sseClients.delete(client);
    }
  });
}

// Watch game.js for changes
console.log('👀 Watching game.js for changes...');
watch('./game.js', (eventType) => {
  if (eventType === 'change') {
    updateChecks();
  }
});

// Initial check
updateChecks();

const server = createServer(async (req, res) => {
  const url = req.url || '/';

  // CORS headers for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // Serve index.html
    if (url === '/' || url === '/index.html') {
      const html = readFileSync('./index.html', 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
      return;
    }

    // Serve game.js
    if (url === '/game.js') {
      const gameJs = readFileSync('./game.js', 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(gameJs);
      return;
    }

    // Serve metadata.json
    if (url === '/metadata.json') {
      const metadata = readFileSync('./metadata.json', 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(metadata);
      return;
    }

    // API endpoint for restriction checks
    if (url === '/api/checks') {
      if (!cachedChecks) {
        cachedChecks = await checkRestrictions('./game.js');
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(cachedChecks));
      return;
    }

    // API endpoint for Git information
    if (url === '/api/git-info') {
      const gitInfo = getGitInfo();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(gitInfo));
      return;
    }

    // SSE endpoint for live reload
    if (url === '/sse') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });

      // Send initial connection message
      res.write('data: connected\n\n');

      // Add client to the set
      sseClients.add(res);

      // Remove client when connection closes
      req.on('close', () => {
        sseClients.delete(res);
      });

      return;
    }

    // 404 for everything else
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');

  } catch (error) {
    console.error('Error handling request:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log('\n🎮 Platanus Hack 25: Arcade Challenge Dev Server');
  console.log('================================================');
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📝 Edit game.js to see live updates`);
  console.log(`🔍 Restrictions are checked automatically\n`);
  console.log('Press Ctrl+C to stop\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down dev server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
