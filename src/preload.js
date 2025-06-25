const { contextBridge, ipcRenderer } = require('electron');

// We'll let the main process handle reading the .env file
// and just expose a method to get the API key
contextBridge.exposeInMainWorld('electronAPI', {
  getApiKey: () => ipcRenderer.invoke('get-api-key')
});
