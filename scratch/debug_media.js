const { exec } = require('child_process');
const binaryPath = '/opt/homebrew/bin/nowplaying-cli';

exec(`"${binaryPath}" get-raw`, (err, stdout) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Output:', stdout);
  try {
    const obj = JSON.parse(stdout);
    console.log('PlaybackRate:', obj.kMRMediaRemoteNowPlayingInfoPlaybackRate);
  } catch (e) {
    console.log('Failed to parse as JSON');
    // Try regex
    const match = stdout.match(/kMRMediaRemoteNowPlayingInfoPlaybackRate\s*=\s*([^;]+);/);
    if (match) console.log('Regex PlaybackRate:', match[1]);
  }
});
