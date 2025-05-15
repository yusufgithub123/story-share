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
      </div>
    `;
    
    return storyElement;
  }

  connectedCallback() {
    this.appendChild(this.render());
  }
}

customElements.define('story-item', StoryItem);
export default StoryItem;