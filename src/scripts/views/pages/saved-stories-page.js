import StoryItem from '../../components/story-item';
import { getStories, deleteStory } from '../../utils/idb-helper';

class SavedStoriesPage {
  constructor() {
    this._stories = [];
  }

  async render() {
    return `
      <section class="content">
        <h2 class="content__heading">Cerita Tersimpan</h2>
        <div id="stories" class="stories">
          <div class="stories__placeholder">Loading...</div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this._storiesContainer = document.querySelector('#stories');
    
    await this._loadSavedStories();
  }

  async _loadSavedStories() {
    try {
      this.showLoading();
      
      const stories = await getStories();
      
      if (stories && stories.length > 0) {
        this.showStories(stories);
      } else {
        this._storiesContainer.innerHTML = '<div class="story-item__not-found">Tidak ada cerita tersimpan</div>';
      }
    } catch (error) {
      this.showError('Error saat memuat cerita tersimpan');
      console.error(error);
    }
  }

  showStories(stories) {
    this._stories = stories;
    this._storiesContainer.innerHTML = '';
    
    if (stories.length > 0) {
      stories.forEach((story) => {
        const storyElement = new StoryItem(story);
        const storyItemEl = storyElement.render();
        
        // Add delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('story-item__delete-btn');
        deleteBtn.innerHTML = '<i class="fa fa-trash"></i> Hapus dari penyimpanan';
        deleteBtn.addEventListener('click', async (event) => {
          event.preventDefault();
          await this._deleteStory(story.id);
        });
        
        storyItemEl.querySelector('.story-item__content').appendChild(deleteBtn);
        this._storiesContainer.appendChild(storyItemEl);
      });
    } else {
      this._storiesContainer.innerHTML = '<div class="story-item__not-found">Tidak ada cerita tersimpan</div>';
    }
  }
  
  async _deleteStory(id) {
    const confirmDelete = confirm('Apakah Anda yakin ingin menghapus cerita ini dari penyimpanan?');
    
    if (confirmDelete) {
      try {
        await deleteStory(id);
        await this._loadSavedStories();
        alert('Cerita berhasil dihapus dari penyimpanan');
      } catch (error) {
        alert('Gagal menghapus cerita dari penyimpanan');
        console.error('Error deleting story:', error);
      }
    }
  }

  showLoading() {
    this._storiesContainer.innerHTML = '<div class="stories__placeholder">Loading...</div>';
  }

  showError(message) {
    this._storiesContainer.innerHTML = `<div class="stories__placeholder error">${message}</div>`;
  }
}

export default SavedStoriesPage;