import { 
  registerServiceWorker, 
  requestNotificationPermission, 
  subscribeUserToPush, 
  unsubscribeFromPush,
  sendTestNotification 
} from '../../utils/notification-helper';

class NotificationPage {
  constructor() {
    this._isSubscribed = false;
  }

  async render() {
    return `
      <section class="content">
        <h2 class="content__heading">Notifikasi</h2>
        <div class="notification-container">
          <div class="notification-info">
            <p>Aktifkan notifikasi untuk mendapatkan info cerita baru secara langsung!</p>
            <p>Dengan mengaktifkan notifikasi, kamu akan menerima pemberitahuan ketika ada cerita baru.</p>
          </div>
          
          <div id="loading" class="loading-indicator">
            <div class="spinner"></div>
            <p>Memeriksa status notifikasi...</p>
          </div>
          
          <div id="notificationControls" class="notification-controls" style="display: none;">
            <div class="form-group">
              <button id="notificationToggleBtn" class="button button-primary">
                <i class="fas fa-bell"></i>
                <span>Memuat...</span>
              </button>
            </div>
            
            <div id="notificationStatus" class="notification-status"></div>
            
            <div class="form-group" style="margin-top: 16px;">
              <button id="testNotificationBtn" class="button button-secondary" style="display: none;">
                <i class="fas fa-paper-plane"></i>
                Kirim Notifikasi Test
              </button>
            </div>
          </div>
          
          <div id="browserSupport" class="browser-support" style="display: none;">
            <div class="browser-support-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Browser Tidak Mendukung</h3>
            <p>Maaf, browser kamu tidak mendukung fitur notifikasi Push.</p>
            <p>Coba gunakan browser terbaru seperti Chrome, Firefox, atau Edge.</p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const loadingElement = document.getElementById('loading');
    const notificationControls = document.getElementById('notificationControls');
    const browserSupport = document.getElementById('browserSupport');
    const notificationToggleBtn = document.getElementById('notificationToggleBtn');
    const testNotificationBtn = document.getElementById('testNotificationBtn');
    const notificationStatus = document.getElementById('notificationStatus');
    
    // Fungsi untuk menampilkan pesan status
    const showStatus = (message, isError = false) => {
      notificationStatus.textContent = message;
      notificationStatus.className = 'notification-status';
      if (isError) {
        notificationStatus.classList.add('error');
      } else {
        notificationStatus.classList.add('success');
      }
    };
    
    // Periksa dukungan browser untuk notifikasi dan service worker
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      loadingElement.style.display = 'none';
      browserSupport.style.display = 'block';
      return;
    }
    
    try {
      // Periksa apakah service worker sudah terdaftar
      const registration = await navigator.serviceWorker.ready;
      
      // Periksa status langganan
      const subscription = await registration.pushManager.getSubscription();
      this._isSubscribed = !!subscription;
      
      // Update UI berdasarkan status
      this._updateButtonState();
      
      // Tambahkan event listeners
      notificationToggleBtn.addEventListener('click', async () => {
        notificationToggleBtn.disabled = true;
        loadingElement.style.display = 'block';
        notificationControls.style.display = 'none';
        
        try {
          if (this._isSubscribed) {
            // Unsubscribe
            const result = await unsubscribeFromPush();
            
            if (result.success) {
              this._isSubscribed = false;
              showStatus('Notifikasi berhasil dinonaktifkan');
            } else {
              showStatus(`Gagal menonaktifkan notifikasi: ${result.error}`, true);
            }
          } else {
            // Request permission dulu
            const permissionGranted = await requestNotificationPermission();
            
            if (!permissionGranted) {
              showStatus('Izin notifikasi ditolak oleh pengguna', true);
              loadingElement.style.display = 'none';
              notificationControls.style.display = 'block';
              notificationToggleBtn.disabled = false;
              return;
            }
            
            // Subscribe
            const result = await subscribeUserToPush();
            
            if (result.success) {
              this._isSubscribed = true;
              showStatus('Notifikasi berhasil diaktifkan');
              testNotificationBtn.style.display = 'block';
            } else {
              showStatus(`Gagal mengaktifkan notifikasi: ${result.error}`, true);
            }
          }
        } catch (error) {
          console.error('Error:', error);
          showStatus(`Terjadi kesalahan: ${error.message}`, true);
        } finally {
          this._updateButtonState();
          loadingElement.style.display = 'none';
          notificationControls.style.display = 'block';
          notificationToggleBtn.disabled = false;
        }
      });
      
      // Test notification button
      if (this._isSubscribed) {
        testNotificationBtn.style.display = 'block';
      }
      
      testNotificationBtn.addEventListener('click', async () => {
        testNotificationBtn.disabled = true;
        
        try {
          const sent = await sendTestNotification();
          if (sent) {
            showStatus('Notifikasi test berhasil dikirim!');
          } else {
            showStatus('Gagal mengirim notifikasi test', true);
          }
        } catch (error) {
          console.error('Error sending test notification:', error);
          showStatus(`Error: ${error.message}`, true);
        } finally {
          testNotificationBtn.disabled = false;
        }
      });
      
      // Tampilkan kontrol notifikasi
      loadingElement.style.display = 'none';
      notificationControls.style.display = 'block';
    } catch (error) {
      console.error('Error initializing notification page:', error);
      loadingElement.style.display = 'none';
      showStatus(`Terjadi kesalahan: ${error.message}`, true);
      notificationControls.style.display = 'block';
    }
  }
  
  _updateButtonState() {
    const notificationToggleBtn = document.getElementById('notificationToggleBtn');
    const buttonText = notificationToggleBtn.querySelector('span');
    const notificationStatus = document.getElementById('notificationStatus');
    
    if (this._isSubscribed) {
      buttonText.textContent = 'Nonaktifkan Notifikasi';
      notificationToggleBtn.classList.remove('button-primary');
      notificationToggleBtn.classList.add('button-danger');
      notificationStatus.textContent = 'Notifikasi aktif';
      notificationStatus.classList.remove('error');
      notificationStatus.classList.add('success');
    } else {
      buttonText.textContent = 'Aktifkan Notifikasi';
      notificationToggleBtn.classList.remove('button-danger');
      notificationToggleBtn.classList.add('button-primary');
      notificationStatus.textContent = 'Notifikasi tidak aktif';
      notificationStatus.classList.remove('success');
      notificationStatus.classList.remove('error');
    }
  }
}

export default NotificationPage;