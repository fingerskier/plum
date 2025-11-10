import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('plum', {
  version: '0.1.0',
});
