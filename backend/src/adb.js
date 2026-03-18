const { execFile } = require('child_process');
const util = require('util');
const execFilePromise = util.promisify(execFile);

const getDevices = async () => {
  try {
    const { stdout } = await execFilePromise('adb', ['devices']);
    const lines = stdout.split('\n');
    const devices = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const [id, state] = line.split('\t');
        if (state === 'device') {
          devices.push({ id, state });
        }
      }
    }
    return devices;
  } catch (error) {
    console.error('Error getting devices:', error);
    return [];
  }
};

const getDeviceDetails = async (deviceId) => {
  try {
    const { stdout: model } = await execFilePromise('adb', ['-s', deviceId, 'shell', 'getprop', 'ro.product.model']);
    const { stdout: manufacturer } = await execFilePromise('adb', ['-s', deviceId, 'shell', 'getprop', 'ro.product.manufacturer']);
    return {
      model: model.trim(),
      manufacturer: manufacturer.trim()
    };
  } catch (error) {
    console.error(`Error getting details for device ${deviceId}:`, error);
    return null;
  }
};

const removeMDM = async (deviceId, packageNames) => {
  const results = [];
  for (const pkg of packageNames) {
    // Basic validation of package name to prevent injection even in array-based exec
    if (!/^[a-zA-Z0-9._]+$/.test(pkg)) {
        results.push({ package: pkg, status: 'failed', error: 'Invalid package name' });
        continue;
    }
    try {
      await execFilePromise('adb', ['-s', deviceId, 'shell', 'dpm', 'remove-active-admin', pkg]);
      await execFilePromise('adb', ['-s', deviceId, 'shell', 'pm', 'uninstall', '--user', '0', pkg]);
      results.push({ package: pkg, status: 'success' });
    } catch (error) {
      console.error(`Error removing ${pkg} on ${deviceId}:`, error.message);
      results.push({ package: pkg, status: 'failed', error: error.message });
    }
  }
  return results;
};

module.exports = {
  getDevices,
  getDeviceDetails,
  removeMDM
};
