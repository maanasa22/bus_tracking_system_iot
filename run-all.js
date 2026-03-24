const { spawn } = require('child_process');

// Spawn the Native Next.js Turbopack compiler
const nextProcess = spawn('npm', ['run', 'dev'], { 
  stdio: 'inherit', 
  shell: true 
});

// Spawn the specific Socket.IO microservice runtime
const socketProcess = spawn('npm', ['run', 'socket'], { 
  stdio: 'inherit', 
  shell: true 
});

nextProcess.on('close', (code) => {
  console.log(`[Next.js] exited with code ${code}`);
  process.exit(code);
});

socketProcess.on('close', (code) => {
  console.log(`[Socket.IO] exited with code ${code}`);
  process.exit(code);
});

// Handle Ctrl+C gracefully for both processes
process.on('SIGINT', () => {
  console.log("\n[SYSTEM] Shutting down TracyG Enterprise servers...");
  nextProcess.kill('SIGINT');
  socketProcess.kill('SIGINT');
  setTimeout(() => process.exit(0), 1000);
});
