/**
 * Offline & IndexedDB Storage Service for BE&MOON
 * Complies with persistence requirements:
 * - Uses IndexedDB with schema versioning
 * - Calls navigator.storage.persist() for durable client-side quota
 * - Caches feed items, masters, and schools for instant offline experience
 * - Queues offline interactions for background replay
 */

const DB_NAME = 'bemoon_offline_v1';
const DB_VERSION = 1;

export interface StorageStatus {
  persisted: boolean;
  indexedDbSupported: boolean;
  estimatedQuotaMb?: number;
  usageMb?: number;
}

class OfflineStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    this.initPersistence();
  }

  private async initPersistence(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persisted();
        if (!isPersisted) {
          return await navigator.storage.persist();
        }
        return true;
      }
    } catch {
      // Storage persist not supported or denied
    }
    return false;
  }

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB not supported in this environment'));
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('feed_cache')) {
          db.createObjectStore('feed_cache', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('schools_cache')) {
          db.createObjectStore('schools_cache', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('masters_cache')) {
          db.createObjectStore('masters_cache', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('created_at', 'created_at', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  async getStorageStatus(): Promise<StorageStatus> {
    let persisted = false;
    let estimatedQuotaMb: number | undefined;
    let usageMb: number | undefined;

    if (typeof window !== 'undefined' && navigator.storage) {
      try {
        if (navigator.storage.persisted) {
          persisted = await navigator.storage.persisted();
        }
        if (navigator.storage.estimate) {
          const est = await navigator.storage.estimate();
          if (est.quota) estimatedQuotaMb = Math.round(est.quota / (1024 * 1024));
          if (est.usage) usageMb = Math.round((est.usage / (1024 * 1024)) * 10) / 10;
        }
      } catch {
        // Ignored
      }
    }

    return {
      persisted,
      indexedDbSupported: typeof window !== 'undefined' && 'indexedDB' in window,
      estimatedQuotaMb,
      usageMb,
    };
  }

  // --- Feed Caching ---
  async cacheFeed(items: any[]): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('feed_cache', 'readwrite');
      const store = tx.objectStore('feed_cache');
      store.put({ key: 'latest_feed', items, cached_at: Date.now() });
    } catch {
      // Fallback
    }
  }

  async getCachedFeed(): Promise<any[] | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('feed_cache', 'readonly');
        const req = tx.objectStore('feed_cache').get('latest_feed');
        req.onsuccess = () => {
          if (req.result && Array.isArray(req.result.items)) {
            resolve(req.result.items);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  // --- Schools Caching ---
  async cacheSchools(schools: any[]): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('schools_cache', 'readwrite');
      const store = tx.objectStore('schools_cache');
      schools.forEach((s) => store.put(s));
    } catch {
      // Fallback
    }
  }

  async getCachedSchools(): Promise<any[] | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('schools_cache', 'readonly');
        const req = tx.objectStore('schools_cache').getAll();
        req.onsuccess = () => resolve(req.result && req.result.length ? req.result : null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  // --- Masters Caching ---
  async cacheMaster(master: any): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('masters_cache', 'readwrite');
      tx.objectStore('masters_cache').put(master);
    } catch {
      // Fallback
    }
  }

  async getCachedMaster(id: string): Promise<any | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('masters_cache', 'readonly');
        const req = tx.objectStore('masters_cache').get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  // --- Offline Action Queue ---
  async queueOfflineAction(action: {
    type: string;
    payload: any;
  }): Promise<string> {
    const id = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      const db = await this.getDB();
      const tx = db.transaction('sync_queue', 'readwrite');
      tx.objectStore('sync_queue').put({
        id,
        ...action,
        created_at: Date.now(),
        attempts: 0,
      });
    } catch {
      // Fallback
    }
    return id;
  }

  async getPendingActions(): Promise<any[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('sync_queue', 'readonly');
        const req = tx.objectStore('sync_queue').getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  async removePendingAction(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('sync_queue', 'readwrite');
      tx.objectStore('sync_queue').delete(id);
    } catch {
      // Fallback
    }
  }

  async clearAllData(): Promise<void> {
    try {
      const db = await this.getDB();
      const storeNames = ['feed_cache', 'schools_cache', 'masters_cache', 'sync_queue'];
      for (const name of storeNames) {
        if (db.objectStoreNames.contains(name)) {
          const tx = db.transaction(name, 'readwrite');
          tx.objectStore(name).clear();
        }
      }
    } catch {
      // Fallback
    }
  }
}

export const offlineStorage = new OfflineStorageService();
