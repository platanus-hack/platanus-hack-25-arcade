import { defineConfig } from 'vite';
import { execSync } from 'child_process';
import { checkRestrictions } from './check-restrictions.lib.js';

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
