import { api } from './api';

const VAPID_PUBLIC_KEY = 'BKMuF6xR1xk_T0vURnH0aFYXrLgGWsWM3mnFaMkKY9rJZY6Aqj_LN5mdvFRq2JQejbTOKz4LCEkXTPk-WORCPhI';

export async function subscribeToPush(): Promise<void> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (existing) {
      await sendSubscriptionToServer(existing);
      return;
    }

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    await sendSubscriptionToServer(subscription);
  } catch {}
}

async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  try {
    const sub = subscription.toJSON();
    await api.post('/push-subscriptions', {
      endpoint: sub.endpoint,
      keys: sub.keys,
      userAgent: navigator.userAgent,
    }, { skipAuth: true });
  } catch {}
}

export async function unsubscribeFromPush(): Promise<void> {
  try {
    if (!('serviceWorker' in navigator)) return;
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      const encoded = btoa(endpoint);
      await fetch(`http://localhost:4001/api/v1/push-subscriptions/${encoded}`, { method: 'DELETE' });
    }
  } catch {}
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
