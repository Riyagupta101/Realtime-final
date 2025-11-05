const publicVapidKey = window.VAPID_PUBLIC_KEY || "BO8YA040sAV0J4OlG20fNbB8YTu2tWMe5Z6QACIHJdD6AB_b_TJ73pLH3p4XPPnE-Ldo7cWme1qSgxgHwU61TrM";

// Register SW & subscribe
async function registerPush() {
  console.log("📲 Registering Service Worker...");
  const reg = await navigator.serviceWorker.register('/sw.js');

  console.log("🧩 Subscribing to Push...");
  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
  });

  console.log("✅ Push subscribed:", subscription);

  await fetch('/save-subscription', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: { 'Content-Type': 'application/json' }
  });
  console.log("✅ Subscription sent to server");
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i)
    outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

registerPush().catch(console.error);
