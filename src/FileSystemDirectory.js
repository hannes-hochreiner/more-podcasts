import FileSystemFile from './FileSystemFile';

export default class FileSystemDirectory {
  constructor(fsDirectoryEntry) {
    this._fsDirectoryEntry = fsDirectoryEntry;
  }

  get name() {
    return this._fsDirectoryEntry.name;
  }

  get fullPath() {
    return this._fsDirectoryEntry.fullPath;
  }

  get isFile() {
    return this._fsDirectoryEntry.isFile;
  }

  get isDirectory() {
    return this._fsDirectoryEntry.isDirectory;
  }

  remove() {
    return new Promise((resolve, reject) => {
      this._fsDirectoryEntry.remove(() => {
        resolve();
      }, err => {
        reject(err);
      });
    });
  }

  readDirectory(directory) {
    return new Promise((resolve, reject) => {
      let dirReader = this._fsDirectoryEntry.createReader();
      let entries = [];

      let getEntries = function() {
        dirReader.readEntries(function(results) {
          if (results.length) {
            entries = entries.concat(results);
            getEntries();
          } else {
            resolve(entries.map(entry => {
              if (entry.isDirectory) {
                return new FileSystemDirectory(entry);
              } else if (entry.isFile) {
                return new FileSystemFile(entry);
              } else {
                reject(new Error('unexpected directory entry'));
              }
            }));
          }
        }, function(error) {
          reject(error);
        });
      };

      getEntries();
    });
  }

  _getDirectory(name, options) {
    return new Promise((resolve, reject) => {
      this._fsDirectoryEntry.getDirectory(name, options, res => {
        resolve(new FileSystemDirectory(res));
      }, err => {
        reject(err);
      })
    });
  }

  getDirectory(name) {
    return this._getDirectory(name, {create: false});
  }

  createDirectory(name) {
    return this._getDirectory(name, {create: true});
  }

  _getFile(name, options) {
    return new Promise((resolve, reject) => {
      this._fsDirectoryEntry.getFile(name, options, res => {
        resolve(new FileSystemFile(res));
      }, err => {
        reject(err);
      });
    });
  }

  getFile(name) {
    return this._getFile(name, {create: false});
  }

  createFile(name) {
    return this._getFile(name, {create: true});
  }
}
