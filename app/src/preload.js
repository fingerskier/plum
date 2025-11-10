import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('desktop', {
  async openTextFile() {
    return ipcRenderer.invoke('computer-control:open-text-file');
  },
  async getDisplayInfo() {
    return ipcRenderer.invoke('computer-control:get-display-info');
  },
});
