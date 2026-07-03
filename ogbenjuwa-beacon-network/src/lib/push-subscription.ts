import { api } from './api';

const VAPID_PUBLIC_KEY = 'BKMuF6xR1xk_T0vURnH0aFYXrLgGWsWM3mnFaMkKY9rJZY6Aqj_LN5mdvFRq2JQejbTOKz4LCEkXTPk-WORCPhI';

export async function subscribeToPush(): Promise<void> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    // Get active registration
    const reg = await navigator.serviceWorker.ready;

    // Check existing subscription
    const existing = await reg.pushManager.getSubscription();
    if (existing) {
      // Already subscribed — ensure server has it
      await sendSubscriptionToServer(existing);
      return;
    }

    // Subscribe
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    await sendSubscriptionToServer(subscription);
  } catch {
    // Push subscription is best-effort — app works without it
  }
}

async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  try {
    const sub = subscription.toJSON();
    await api.post('/push-subscriptions', {
      endpoint: sub.endpoint,
      keys: sub.keys,
      userAgent: navigator.userAgent,
    }, { skipAuth: true });
  } catch {
    // Server may not support push subscriptions yet
  }
}

export async function unsubscribeFromPush(): Promise<void> {
  try {
    if (!('serviceWorker' in navigator)) return;
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      // Notify server
      const encoded = btoa(endpoint);
      const apiBase = import.meta.env.VITE_API_BASE || 'https://ogbenjuwa-api.onrender.com/api/v1';
      await fetch(`${apiBase}/push-subscriptions/${encoded}`, { method: 'DELETE' });
    }
  } catch {
    // Best-effort cleanup
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
