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

// Tambahkan error handling yang lebih baik
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      
      console.log('Service Worker registered with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error; // Re-throw error untuk ditangkap di NotificationPage
    }
  }
  throw new Error('Service Worker not supported');
};

const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

const subscribeUserToPush = async (registration) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('User not logged in');
      return false;
    }
    
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }
    
    const response = await StoryApi.subscribeNotification(token, {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode.apply(null, 
          new Uint8Array(subscription.getKey('p256dh')))),
        auth: btoa(String.fromCharCode.apply(null, 
          new Uint8Array(subscription.getKey('auth')))),
      },
    });
    
    return !response.error;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return false;
  }
};

const unsubscribeFromPush = async (registration) => {
  try {
    const token = localStorage.getItem('token');
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      
      if (token) {
        await StoryApi.unsubscribeNotification(token, subscription.endpoint);
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
};

export {
  registerServiceWorker,
  requestNotificationPermission,
  subscribeUserToPush,
  unsubscribeFromPush,
};