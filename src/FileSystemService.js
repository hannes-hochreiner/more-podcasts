// https://www.html5rocks.com/en/tutorials/file/filesystem/
// https://developer.mozilla.org/en-US/docs/Web/API/LocalFileSystem
// new FileSystemService(navigator.webkitPersistentStorage, window.webkitRequestFileSystem.bind(window, window.PERSISTENT));
import FileSystemFileSystem from './FileSystemFileSystem';

export default class FileSystemService {
  constructor(storageInfo, requestFileSystem) {
    this._storageInfo = storageInfo;
    this._requestFileSystem = requestFileSystem;

    // this.queryUsageAndQuota().then(res => {
    //   console.log(`${res.usage / (1024 * 1024)} of ${res.quota / (1024 * 1024)}`);
    // }).catch(err => {
    //   console.log(`error: ${err}`);
    // });
    // this.getFileSystem().then(res => {
    //   return res.root.readDirectory();
    // }).then(res => {
    //   console.log(res);
    //   if (res.length) {
    //     res[0].remove();
    //   }
    // });
    // this.getFileSystem().then(res => {
    //   return res.root.readDirectory().then(dirEntries => {
    //     console.log(dirEntries);
    //     return res.root.createDirectory('1');
    //   });
    // }).then(res => {
    //   return res.createFile('1');
    // }).then(res => {
    //   console.log(res.URL);
    //   return res.write(new Blob(['this is a test'], {type: 'text/plain'})).then(() => {
    //     return res.remove();
    //   });
    // }).catch(err => {
    //   console.log(err);
    // });
  }

  getFile(root, path, data) {
    return new Promise((resolve, reject) => {
      root.getFile(path, {create: true}, res => {
        resolve(res);
      }, err => {
        reject(err);
      });
    });
  }

  getFileSystem() {
    return this.queryUsageAndQuota().then(resUQ => {
      return new Promise((resolve, reject) => {
        this._requestFileSystem(resUQ.quota, res => {
          resolve(new FileSystemFileSystem(res));
        }, err => {
          reject(err);
        });
      });
    });
  }

  requestQuota(requestedQuota) {
    return new Promise((resolve, reject) => {
      this._storageInfo.requestQuota(requestedQuota, quota => {
        resolve({quota: quota});
      }, err => {
        reject(err);
      });
    });
  }

  queryUsageAndQuota() {
    return new Promise((resolve, reject) => {
      this._storageInfo.queryUsageAndQuota((usage, quota) => {
        resolve({
          usage: usage,
          quota: quota
        });
      }, err => {
        reject(err);
      });
    });
  }
}
