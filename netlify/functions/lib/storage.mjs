import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Determine if Netlify Blobs context is active
let netlifyBlobsModule = null;
try {
  if (process.env.NETLIFY_BLOBS_CONTEXT || (process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN)) {
    netlifyBlobsModule = await import('@netlify/blobs');
  }
} catch (err) {
  // Fallback to local storage
}

const LOCAL_DATA_DIR = path.resolve(process.cwd(), '.blobs-data');

// Local filesystem fallback store
class LocalStore {
  constructor(name) {
    this.name = name;
    this.dir = path.join(LOCAL_DATA_DIR, name);
  }

  async _ensureDir() {
    try {
      await fs.mkdir(this.dir, { recursive: true });
    } catch (e) {}
  }

  _safeFileName(key) {
    // Replace characters unsafe for Windows / Unix filenames
    return encodeURIComponent(key) + '.json';
  }

  _keyFromFileName(fileName) {
    if (!fileName.endsWith('.json')) return null;
    return decodeURIComponent(fileName.slice(0, -5));
  }

  async get(key, options = {}) {
    await this._ensureDir();
    const filePath = path.join(this.dir, this._safeFileName(key));
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      if (!data || !data.trim()) return null;
      if (options.type === 'json' || !options.type) {
        return JSON.parse(data);
      }
      return data;
    } catch (err) {
      if (err.code === 'ENOENT') return null;
      if (err instanceof SyntaxError) {
        // Retry once after 30ms if read during momentary disk write
        await new Promise((r) => setTimeout(r, 30));
        try {
          const retryData = await fs.readFile(filePath, 'utf-8');
          if (retryData && retryData.trim()) return JSON.parse(retryData);
        } catch (e) {}
      }
      throw err;
    }
  }

  async setJSON(key, data) {
    await this._ensureDir();
    const filePath = path.join(this.dir, this._safeFileName(key));
    const content = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, content, 'utf-8');
  }

  async delete(key) {
    await this._ensureDir();
    const filePath = path.join(this.dir, this._safeFileName(key));
    try {
      await fs.unlink(filePath);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }

  async list(options = {}) {
    await this._ensureDir();
    try {
      const files = await fs.readdir(this.dir);
      let keys = files
        .map((f) => this._keyFromFileName(f))
        .filter(Boolean);

      if (options.prefix) {
        keys = keys.filter((k) => k.startsWith(options.prefix));
      }

      return {
        blobs: keys.map((k) => ({ key: k }))
      };
    } catch (err) {
      return { blobs: [] };
    }
  }
}

// Wrapper to provide consistent interface for both Netlify Blobs and LocalStore
class UnifiedStore {
  constructor(name) {
    this.name = name;
    if (netlifyBlobsModule && netlifyBlobsModule.getStore) {
      this.isNetlify = true;
      this.store = netlifyBlobsModule.getStore(name, { consistency: 'strong' });
    } else {
      this.isNetlify = false;
      this.store = new LocalStore(name);
    }
  }

  async get(key) {
    try {
      if (this.isNetlify) {
        return await this.store.get(key, { type: 'json' });
      }
      return await this.store.get(key, { type: 'json' });
    } catch (err) {
      console.error(`Error getting key ${key} from store ${this.name}:`, err);
      return null;
    }
  }

  async set(key, data) {
    try {
      if (this.isNetlify) {
        await this.store.setJSON(key, data);
      } else {
        await this.store.setJSON(key, data);
      }
    } catch (err) {
      console.error(`Error setting key ${key} in store ${this.name}:`, err);
      throw err;
    }
  }

  async delete(key) {
    try {
      await this.store.delete(key);
    } catch (err) {
      console.error(`Error deleting key ${key} in store ${this.name}:`, err);
      throw err;
    }
  }

  async list(options = {}) {
    try {
      const res = await this.store.list(options);
      return res?.blobs || [];
    } catch (err) {
      console.error(`Error listing keys in store ${this.name}:`, err);
      return [];
    }
  }
}

// Export singleton stores
export const linksStore = new UnifiedStore('links');
export const settingsStore = new UnifiedStore('settings');
export const analyticsStore = new UnifiedStore('analytics');
export const sessionsStore = new UnifiedStore('sessions');
