import StoryApi from '../data/api-source';

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker tidak didukung di browser ini');
  }

  try {
    // Pastikan registrasi SW dengan path yang benar
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker berhasil diregistrasi:', registration);
    return registration;
  } catch (error) {
    console.error('Registrasi Service Worker gagal:', error);
    throw error;
  }
};

const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    throw new Error('Notifikasi tidak didukung di browser ini');
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

const getPushSubscription = async (registration) => {
  try {
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
      
      console.log('Berhasil membuat subscription baru');
    }
    
    return subscription;
  } catch (error) {
    console.error('Gagal mendapatkan push subscription:', error);
    throw error;
  }
};

const subscribeUserToPush = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('Pengguna belum login');
      return { success: false, error: 'Pengguna belum login' };
    }
    
    const registration = await navigator.serviceWorker.ready;
    const subscription = await getPushSubscription(registration);
    
    if (!subscription) {
      return { success: false, error: 'Gagal membuat subscription' };
    }
    
    // Ekstrak key dalam format yang benar untuk API
    const subscriptionJSON = subscription.toJSON();
    
    const response = await StoryApi.subscribeNotification(token, {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode.apply(null, 
          new Uint8Array(subscriptionJSON.keys.p256dh))),
        auth: btoa(String.fromCharCode.apply(null, 
          new Uint8Array(subscriptionJSON.keys.auth))),
      },
    });
    
    if (response.error) {
      console.error('API menolak subscription:', response.message);
      return { success: false, error: response.message };
    }
    
    return { success: true, subscription };
  } catch (error) {
    console.error('Error saat subscribe push notification:', error);
    return { success: false, error: error.message };
  }
};

const unsubscribeFromPush = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return { success: false, error: 'Pengguna belum login' };
    }
    
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      return { success: true, message: 'Tidak ada subscription aktif' };
    }
    
    // Unsubscribe dari push service
    const unsubscribed = await subscription.unsubscribe();
    
    if (unsubscribed) {
      // Beritahu server untuk menghapus subscription
      await StoryApi.unsubscribeNotification(token, subscription.endpoint);
      return { success: true };
    } else {
      return { success: false, error: 'Gagal unsubscribe dari push service' };
    }
  } catch (error) {
    console.error('Error saat unsubscribe:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk mengirim notifikasi test lokal
const sendTestNotification = async () => {
  const title = 'Notifikasi Test';
  const options = {
    body: 'Ini adalah test notifikasi dari StoryShare',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      dateOfArrival: Date.now(),
    },
  };

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, options);
    return true;
  }
  
  return false;
};

export {
  registerServiceWorker,
  requestNotificationPermission,
  subscribeUserToPush,
  unsubscribeFromPush,
  sendTestNotification,
};