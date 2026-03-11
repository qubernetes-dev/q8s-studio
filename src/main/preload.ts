// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron';
import { Q8SProject } from '../renderer/components/ConfigurationView';

/**
 * API exposed to the renderer process
 * @see https://www.electronjs.org/docs/latest/api/context-bridge
 * @see https://www.electronjs.org/docs/latest/api/ipc-renderer
 * @see https://www.electronjs.org/docs/latest/api/ipc-main
 */
export const electronAPI = {
  runQ8S: (args: string[]) => ipcRenderer.invoke('runQ8S', args),
  writeFile: (fileName: string, content: object, oldFileName?: string) =>
    ipcRenderer.invoke('writeFile', fileName, content, oldFileName),
  saveQ8SProjectFile: (
    workspacePath: string,
    fileName: string,
    content: Q8SProject,
  ) => ipcRenderer.invoke('saveQ8SProjectFile', workspacePath, fileName, content),
  renameFile: (fileToRename: string, newFileName?: string) =>
    ipcRenderer.invoke('renameFile', fileToRename, newFileName),
  deleteFile: (fileName: string) => ipcRenderer.invoke('deleteFile', fileName),
  loadFiles: (): Promise<Q8SProject[]> => {
    return ipcRenderer.invoke('loadFiles');
  },
  /**
   * Open a file or directory
   * @param isDirectory if the file is a directory
   * @returns the path of the file or directory
   */
  openFile: (isDirectory: boolean) =>
    ipcRenderer.invoke('openFile', isDirectory),
  getPort: () => ipcRenderer.invoke('getPort').then((port) => port as number),
  /**
   * Runs docker with the given configurations
   * @param the configurations for the docker command
   * @returns the output of the command
   */
  runDockerCommand: (configurations: Q8SProject | null, port: string) => {
    return ipcRenderer.invoke('runDockerCommand', configurations, port);
  },
  runQ8SCtl: (configurations: Q8SProject) => {
    return ipcRenderer.invoke('runQ8SCtl', configurations)
  },
  /**
   * Runs the given command in main process as a child process
   * @param configurations the command to run
   * @returns the output of the command
   */
  runCommand: (command: string) => {
    return ipcRenderer.invoke('runCommand', command);
  },
  /**
   * Kill the child process of the environment (docker container) and return the exit message.
   * @param containerName string
   * @returns Message for killing the process
   */
  killProcess: (containerName: string) => {
    return ipcRenderer.invoke('killProcess', containerName);
  },
  checkDocker: () => ipcRenderer.invoke('checkDocker'),
  checkQ8SCtl: () => ipcRenderer.invoke('checkQ8SCtl'),
  /**
   * Sends boolean value to renderer process to check if a docker image exists
   * @param callback
   */
  imageExists: (callback: (value: boolean) => void) => {
    ipcRenderer.on('image-exists', (event, value) => callback(value));
  },
  /**
   * Get the lab url from the main process
   * @param callback the callback to call with the url
   * @returns nothing
   */
  labUrl: (callback: (url: string) => void) => {
    ipcRenderer.on('lab-url', (event, url) => callback(url));
  },
  /**
   * Listen to an event from the main process
   * @param channel the channel to listen to
   * @param callback the callback to call when the event is triggered
   * @returns a function to remove the listener
   */
  on(
    channel: string,
    callback: {
      (event: IpcRendererEvent, data: string | number): void;
    },
  ) {
    const subscription = (_event: any, args: any) => callback(_event, args);
    ipcRenderer.on(channel, subscription);
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
  toggle: () => {
    ipcRenderer.invoke('dark-mode:toggle');
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

electronAPI.on('error', (event, error) => {
  window.console.error(error);
});
electronAPI.on('errorCode', (event, errorCode) => {
  window.console.error('Error code:', errorCode);
});

export type ElectronAPI = typeof electronAPI;
