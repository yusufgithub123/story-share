import { toggleBookmark } from '../utils/idb-helper.js';

class StoryItem extends HTMLElement {
  constructor(story) {
    super();
    this._story = story;
  }

  render() {
    const storyElement = document.createElement('article');
    storyElement.classList.add('story-item');
    storyElement.innerHTML = `
      <img class="story-item__thumbnail" 
           src="${this._story.photoUrl}" 
           alt="Gambar cerita dari ${this._story.name}"
           loading="lazy">
      <div class="story-item__content">
        <h3 class="story-item__title">
          <a href="#/detail/${this._story.id}">${this._story.name}</a>
        </h3>
        <p class="story-item__description">${this._story.description}</p>
        <p class="story-item__date">${new Date(this._story.createdAt).toLocaleDateString()}</p>
        ${this._story.lat && this._story.lon ? `
          <p class="story-item__location">
            <i class="fa fa-map-marker" aria-hidden="true"></i> 
            Lat: ${this._story.lat.toFixed(4)}, Lon: ${this._story.lon.toFixed(4)}
          </p>
        ` : ''}
        <button class="bookmark-btn" title="Bookmark Cerita" aria-label="Bookmark story with ID ${this._story.id}">
          <i class="fas fa-bookmark"></i>
        </button>
      </div>
    `;

    // Tambahkan event listener untuk tombol bookmark
    storyElement.querySelector('.bookmark-btn').addEventListener('click', async () => {
      try {
        const bookmarked = await toggleBookmark(this._story);
        alert(bookmarked ? '✅ Ditambahkan ke bookmark!' : '❌ Dihapus dari bookmark!');
      } catch (error) {
        console.error('Gagal mengelola bookmark:', error);
        alert('Terjadi kesalahan saat memproses bookmark!');
      }
    });

    return storyElement;
  }

  connectedCallback() {
    this.appendChild(this.render());
  }
}

customElements.define('story-item', StoryItem);
export default StoryItem;
