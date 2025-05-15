import routes from '../routes/routes';
import { setupCustomTransition, setupAnimationAPI } from '../utils/transition-helper';

class App {
  constructor({ content }) {
    this._content = content;
    this._initialAppShell();
    
    setupCustomTransition();
    setupAnimationAPI();
  }

  _initialAppShell() {
    
  }

  async renderPage() {
    let url = window.location.hash.slice(1);
   
    if (url === '') {
      url = '/';
    }
    
    let page;
    
    if (url.startsWith('/detail/')) {
      page = routes['/detail/:id'];
    } else {
      page = routes[url] || routes['/'];
    }
    
    if (this._currentPage && this._currentPage.onLeave) {
      this._currentPage.onLeave();
    }
    
    this._currentPage = new page();
    this._content.innerHTML = await this._currentPage.render();
    
    await this._currentPage.afterRender();
    window.scrollTo(0, 0);
  }
}

export default App;