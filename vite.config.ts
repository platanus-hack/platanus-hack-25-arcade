import { defineConfig } from 'vite';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { checkRestrictions } from './check-restrictions.lib.js';

const DEFAULT_COVER_SHA256 = 'b97a843d173c8fe4bfccbb7645d54d174a19f69dcd02b10af3111df07744a642';

// Check PNG dimensions by reading PNG header
function checkPNGDimensions(buffer: Buffer): { width: number; height: number; isPNG: boolean } {
  // Check PNG signature
  const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  if (!buffer.subarray(0, 8).equals(pngSignature)) {
    return { width: 0, height: 0, isPNG: false };
  }

  // Read IHDR chunk (width at bytes 16-19, height at bytes 20-23)
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);

  return { width, height, isPNG: true };
}

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

// Custom plugin to run restriction checks
function restrictionCheckerPlugin() {
  return {
    name: 'restriction-checker',
    async handleHotUpdate({ file, server }) {
      if (file.endsWith('game.js')) {
        console.log('\n🔄 Checks updated at', new Date().toLocaleTimeString());
        try {
          const results = await checkRestrictions('./game.js');
          console.log(`   Size: ${results.sizeKB.toFixed(2)} KB`);
          console.log(`   Status: ${results.passed ? '✅ Passing' : '❌ Failing'}`);

          if (!results.passed) {
            const failed = results.results.filter(r => !r.passed);
            failed.forEach(f => {
              console.log(`   ❌ ${f.name}: ${f.message}`);
            });
          }
        } catch (error) {
          console.error('Error running checks:', error);
        }
      }
    },
    configureServer(server) {
      server.middlewares.use('/api/checks', async (_req, res) => {
        try {
          const results = await checkRestrictions('./game.js');
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(results));
        } catch (error) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Failed to run checks' }));
        }
      });
      
      server.middlewares.use('/api/git-info', async (_req, res) => {
        try {
          const gitInfo = getGitInfo();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(gitInfo));
        } catch (error) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Failed to get git info' }));
        }
      });

      server.middlewares.use('/api/cover-check', async (_req, res) => {
        try {
          const coverPath = './cover.png';
          const coverBuffer = readFileSync(coverPath);
          const coverHash = createHash('sha256').update(coverBuffer).digest('hex');
          const isChanged = coverHash !== DEFAULT_COVER_SHA256;

          // Check PNG dimensions
          const { width, height, isPNG } = checkPNGDimensions(coverBuffer);
          const isValidSize = width === 800 && height === 600;

          let message = '';
          let isValid = false;

          if (!isPNG) {
            message = 'cover.png is not a valid PNG file';
          } else if (!isChanged) {
            message = 'Default cover detected';
          } else if (!isValidSize) {
            message = `Cover is ${width}x${height}, must be 800x600`;
          } else {
            message = 'Custom cover provided';
            isValid = true;
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            exists: true,
            isChanged: isChanged,
            isPNG: isPNG,
            width: width,
            height: height,
            isValidSize: isValidSize,
            isValid: isValid,
            message: message
          }));
        } catch (error) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            exists: false,
            isChanged: false,
            isPNG: false,
            width: 0,
            height: 0,
            isValidSize: false,
            isValid: false,
            message: 'cover.png not found'
          }));
        }
      });
    }
  };
}

export default defineConfig({
  root: '.',
  server: {
    port: 3000,
    open: false
  },
  plugins: [restrictionCheckerPlugin()],
  // Don't optimize dependencies since we're using Phaser from CDN
  optimizeDeps: {
    exclude: ['phaser']
  }
});
