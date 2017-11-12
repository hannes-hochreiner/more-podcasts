export default class FileSystemFile {
  constructor(fsFileEntry) {
    this._fsFileEntry = fsFileEntry;
  }

  get name() {
    return this._fsFileEntry.name;
  }

  get fullPath() {
    return this._fsFileEntry.fullPath;
  }

  get isFile() {
    return this._fsFileEntry.isFile;
  }

  get isDirectory() {
    return this._fsFileEntry.isDirectory;
  }

  get URL() {
    return this._fsFileEntry.toURL();
  }

  remove() {
    return new Promise((resolve, reject) => {
      this._fsFileEntry.remove(() => {
        resolve();
      }, err => {
        reject(err);
      });
    });
  }

  write(data) {
    return new Promise((resolve, reject) => {
      this._fsFileEntry.createWriter(writer => {
        writer.onwriteend = () => {
          resolve();
        };

        writer.onerror = err => {
          reject(err);
        };

        writer.write(data);
      }, err => {
        reject(err);
      });
    });
  }
}
