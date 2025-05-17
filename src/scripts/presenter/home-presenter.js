import StoryApi from '../data/api-source';
import { isOnline } from '../utils/network-helper';
import { getStories, saveStory, deleteStory } from '../utils/idb-helper';

class HomePresenter {
  constructor(view) {
    this._view = view;
  }

  async getStories() {
    try {
      this._view.showLoading();

      let stories = [];

      if (isOnline()) {
        const token = localStorage.getItem('token');

        if (!token) {
          window.location.hash = '#/login';
          return;
        }

        // Ambil data dari API
        const response = await StoryApi.getAllStories(token, 1, 15, 1);

        if (response && !response.error) {
          stories = response.listStory;

          // Sync: hapus data lama dari IndexedDB
          const oldStories = await getStories();
          if (oldStories.length > 0) {
            await Promise.all(oldStories.map((story) => deleteStory(story.id)));
          }

          // Simpan data baru ke IndexedDB
          await Promise.all(stories.map((story) => saveStory(story)));

          this._view.showStories(stories);
          this._view.showOfflineNotification(false);
        } else {
          throw new Error(response.message);
        }
      } else {
        // Mode offline: ambil dari IndexedDB
        stories = await getStories();

        if (stories.length > 0) {
          this._view.showStories(stories);
          this._view.showOfflineNotification(true);
        } else {
          throw new Error('Tidak ada cerita tersimpan. Harap sambungkan ke internet.');
        }
      }
    } catch (error) {
      console.error('Gagal memuat cerita:', error.message);
      this._view.showError('Gagal memuat cerita. Periksa koneksi atau coba lagi.');

      // Coba ambil dari IndexedDB sebagai fallback
      try {
        const stories = await getStories();
        if (stories.length > 0) {
          this._view.showStories(stories);
          this._view.showOfflineNotification(true);
        }
      } catch (dbError) {
        console.error('Gagal mengakses IndexedDB:', dbError.message);
      }
    }
  }
}

export default HomePresenter;
