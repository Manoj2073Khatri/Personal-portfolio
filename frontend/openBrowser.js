const { spawn } = require('child_process');
const os = require('os');

const platform = os.platform();

if (platform === 'darwin') {
  spawn('open', ['http://localhost:3000']);
} else if (platform === 'win32') {
  spawn('cmd.exe', ['/c', 'start', 'http://localhost:3000']);
} else {
  spawn('xdg-open', ['http://localhost:3000']);
}