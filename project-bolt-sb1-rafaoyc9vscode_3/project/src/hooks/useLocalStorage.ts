import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // 获取存储的值
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 设置值的函数
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// 数据序列化辅助函数 - 修复文件URL保存问题
export const serializeVideoFile = (video: any) => ({
  ...video,
  dateAdded: video.dateAdded.toISOString(),
  firstPlayDate: video.firstPlayDate?.toISOString(),
  nextReviewDate: video.nextReviewDate?.toISOString(),
  // 不保存 File 对象，但保留文件信息用于重建
  fileName: video.file?.name,
  fileType: video.file?.type,
  fileSize: video.file?.size,
  file: null,
  // fileUrl 将通过 IndexedDB 单独保存
});

export const deserializeVideoFile = (video: any) => ({
  ...video,
  dateAdded: new Date(video.dateAdded),
  firstPlayDate: video.firstPlayDate ? new Date(video.firstPlayDate) : undefined,
  nextReviewDate: video.nextReviewDate ? new Date(video.nextReviewDate) : undefined,
});

export const serializeCollection = (collection: any) => ({
  ...collection,
  dateCreated: collection.dateCreated.toISOString(),
});

export const deserializeCollection = (collection: any) => ({
  ...collection,
  dateCreated: new Date(collection.dateCreated),
});

export const serializePlaylist = (playlist: any) => ({
  ...playlist,
  date: playlist.date.toISOString(),
});

export const deserializePlaylist = (playlist: any) => ({
  ...playlist,
  date: new Date(playlist.date),
});

// IndexedDB 文件存储管理
class FileStorageManager {
  private dbName = 'VideoLearningApp';
  private version = 2;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'id' });
        }
      };
    });
  }

  async saveFile(id: string, file: File): Promise<string> {
    console.log('FileStorage: saveFile 开始', { id, fileName: file.name, fileSize: file.size, fileType: file.type });
    
    if (!this.db) {
      console.log('FileStorage: 数据库未初始化，正在初始化...');
      await this.init();
    }
    
    return new Promise((resolve, reject) => {
      console.log('FileStorage: 开始读取文件为 ArrayBuffer');
      // 将文件转换为 ArrayBuffer 存储
      const reader = new FileReader();
      reader.onload = () => {
        console.log('FileStorage: 文件读取完成，开始保存到 IndexedDB');
        try {
          // Move transaction creation inside the callback to ensure it's active
          const transaction = this.db!.transaction(['files'], 'readwrite');
          const store = transaction.objectStore('files');
          
          const fileData = {
            id,
            name: file.name,
            type: file.type,
            size: file.size,
            data: reader.result as ArrayBuffer,
            timestamp: Date.now()
          };
          
          console.log('FileStorage: 准备保存到 IndexedDB', { id, name: file.name, size: file.size });
          const request = store.put(fileData);
          request.onsuccess = () => {
            console.log('FileStorage: 文件保存到 IndexedDB 成功');
            // 创建临时 URL
            const blob = new Blob([reader.result as ArrayBuffer], { type: file.type });
            const url = URL.createObjectURL(blob);
            console.log('FileStorage: 创建临时 URL 成功', url);
            resolve(url);
          };
          request.onerror = () => {
            console.error('FileStorage: 保存到 IndexedDB 失败', request.error);
            reject(request.error);
          };
        } catch (error) {
          console.error('FileStorage: 创建事务失败', error);
          reject(error);
        }
      };
      reader.onerror = () => {
        console.error('FileStorage: 读取文件失败', reader.error);
        reject(reader.error);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  async getFile(id: string): Promise<string | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const request = store.get(id);
      
      request.onsuccess = () => {
        if (request.result) {
          const blob = new Blob([request.result.data], { type: request.result.type });
          const url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFile(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const fileStorage = new FileStorageManager();