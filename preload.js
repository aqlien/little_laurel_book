const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronApi', {
	loadContacts: () => ipcRenderer.invoke('contacts:load'),
	saveContact: (contact) => ipcRenderer.invoke('contacts:save', contact),
	deleteContact: (id) => ipcRenderer.invoke('contacts:delete', id),
});
