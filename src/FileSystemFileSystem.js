import FileSystemDirectory from './FileSystemDirectory';

export default class FileSystemFileSystem {
  constructor(fsFileSystem) {
    this._fsFileSystem = fsFileSystem;
  }

  get root() {
    return new FileSystemDirectory(this._fsFileSystem.root);
  }

  get name() {
    return this._fsFileSystem.name;
  }
}
