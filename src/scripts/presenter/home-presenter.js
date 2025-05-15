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

      if (isOnline()) {
        const token = localStorage.getItem('token');

        if (!token) {
          window.location.hash = '#/login';
          return;
        }

        const response = await StoryApi.getAllStories(token, 1, 15, 1);

        if (!response.error) {
          // Hapus data lama
          const oldStories = await getStories();
          if (oldStories && oldStories.length > 0) {
            await Promise.all(oldStories.map(story => deleteStory(story.id)));
          }

          // Simpan data baru
          const stories = response.listStory;
          await Promise.all(stories.map(story => saveStory(story)));

          this._view.showStories(stories);
        } else {
          // Jika error dari API, coba tampilkan dari IndexedDB
          const stories = await getStories();
          if (stories && stories.length > 0) {
            this._view.showStories(stories);
            this._view.showOfflineNotification(true);
          } else {
            this._view.showError(response.message);
          }
        }
      } else {
        // Mode offline
        const stories = await getStories();

        if (stories && stories.length > 0) {
          this._view.showStories(stories);
          this._view.showOfflineNotification(true);
        } else {
          this._view.showError('Tidak ada cerita tersimpan. Harap sambungkan ke internet.');
          this._view.showOfflineNotification(true);
        }
      }
    } catch (error) {
      console.error(error);
      this._view.showError('Error saat memuat cerita');

      // Coba ambil dari IndexedDB jika gagal
      try {
        const stories = await getStories();
        if (stories && stories.length > 0) {
          this._view.showStories(stories);
          this._view.showOfflineNotification(true);
        }
      } catch (dbError) {
        console.error('Error accessing IndexedDB:', dbError);
      }
    }
  }
}

export default HomePresenter;
