const DATABASE_NAME = 'storyshare-db';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'stories';
const BOOKMARK_STORE_NAME = 'bookmarks';

let db = null;

const openDB = () => {
  return new Promise((resolve, reject) => {
    if (db !== null) {
      return resolve(db);
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      if (!database.objectStoreNames.contains(OBJECT_STORE_NAME)) {
        database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains(BOOKMARK_STORE_NAME)) {
        database.createObjectStore(BOOKMARK_STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };
  });
};

const getStories = async () => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(OBJECT_STORE_NAME, 'readonly');
    const store = transaction.objectStore(OBJECT_STORE_NAME);
    const request = store.getAll();

    request.onerror = (event) => {
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
};

const saveStory = async (story) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(OBJECT_STORE_NAME);
    const request = store.put(story);

    request.onerror = (event) => {
      reject(event.target.error);
    };

    request.onsuccess = () => {
      resolve(story);
    };
  });
};

const getStory = async (id) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(OBJECT_STORE_NAME, 'readonly');
    const store = transaction.objectStore(OBJECT_STORE_NAME);
    const request = store.get(id);

    request.onerror = (event) => {
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
};

const deleteStory = async (id) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(OBJECT_STORE_NAME);
    const request = store.delete(id);

    request.onerror = (event) => {
      reject(event.target.error);
    };

    request.onsuccess = () => {
      resolve(true);
    };
  });
};

// === Bookmark Features ===

const toggleBookmark = async (story) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(BOOKMARK_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(BOOKMARK_STORE_NAME);
    const getRequest = store.get(story.id);

    getRequest.onsuccess = () => {
      const existing = getRequest.result;
      if (existing) {
        const deleteRequest = store.delete(story.id);
        deleteRequest.onsuccess = () => resolve(false); // unbookmarked
        deleteRequest.onerror = (event) => reject(event.target.error);
      } else {
        const putRequest = store.put(story);
        putRequest.onsuccess = () => resolve(true); // bookmarked
        putRequest.onerror = (event) => reject(event.target.error);
      }
    };

    getRequest.onerror = (event) => reject(event.target.error);
  });
};

const getBookmarks = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BOOKMARK_STORE_NAME, 'readonly');
    const store = tx.objectStore(BOOKMARK_STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

export {
  openDB,
  getStories,
  saveStory,
  getStory,
  deleteStory,
  toggleBookmark,
  getBookmarks,
};
