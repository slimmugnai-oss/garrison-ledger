/**
 * PCS COPILOT PWA - SERVICE WORKER REGISTRATION
 *
 * Enables offline capability, background sync, and push notifications
 */

import { logger } from "@/lib/logger";

interface ClaimData {
  claimId: string;
  memberName: string;
  rank: string;
  branch: string;
  pcsType: string;
  originBase: string;
  destinationBase: string;
  ordersDate: string;
  [key: string]: unknown;
}

interface ServiceWorkerMessage {
  type: string;
  claimId?: string;
  [key: string]: unknown;
}

export async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    logger.info("[PWA] Service Worker not supported");
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    logger.info("[PWA] Service Worker registered successfully:", registration.scope);

    // Check for updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          // New service worker available
          logger.info("[PWA] New version available");
          showUpdateNotification();
        }
      });
    });

    // Handle controller change
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      logger.info("[PWA] Service Worker controller changed");
      window.location.reload();
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener("message", (event) => {
      handleServiceWorkerMessage(event.data);
    });

    return registration;
  } catch (error) {
    logger.error("[PWA] Service Worker registration failed:", error);
    return false;
  }
}

export async function unregisterServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const unregistered = await registration.unregister();
    logger.info("[PWA] Service Worker unregistered:", unregistered);
    return unregistered;
  } catch (error) {
    logger.error("[PWA] Service Worker unregistration failed:", error);
    return false;
  }
}

export async function checkServiceWorkerStatus() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return { supported: false, registered: false, active: false };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();

    return {
      supported: true,
      registered: !!registration,
      active: !!registration?.active,
      installing: !!registration?.installing,
      waiting: !!registration?.waiting,
    };
  } catch (error) {
    logger.error("[PWA] Failed to check service worker status:", error);
    return { supported: true, registered: false, active: false, error: true };
  }
}

export async function syncClaimData(claimData: ClaimData) {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    logger.info("[PWA] Service Worker not available for sync");
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Store claim data for background sync
    await storePendingClaim(claimData);

    // Register background sync
    if ("sync" in registration) {
      await (registration as any).sync.register("sync-pcs-claim");
      logger.info("[PWA] Background sync registered");
      return true;
    } else {
      logger.info("[PWA] Background sync not supported, attempting immediate sync");
      // Fallback: try to sync immediately
      return await syncClaimImmediately(claimData);
    }
  } catch (error) {
    logger.error("[PWA] Failed to register background sync:", error);
    return false;
  }
}

async function syncClaimImmediately(claimData: ClaimData) {
  try {
    const response = await fetch("/api/pcs/claim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(claimData),
    });

    return response.ok;
  } catch (error) {
    logger.error("[PWA] Immediate sync failed:", error);
    return false;
  }
}

async function storePendingClaim(claimData: ClaimData) {
  // Store in IndexedDB for background sync
  if (!("indexedDB" in window)) {
    logger.info("[PWA] IndexedDB not supported");
    return;
  }

  try {
    const db = await openClaimsDB();
    const transaction = db.transaction(["pendingClaims"], "readwrite");
    const store = transaction.objectStore("pendingClaims");

    await store.add({
      id: crypto.randomUUID(),
      data: claimData,
      timestamp: Date.now(),
      method: "POST",
    });

    logger.info("[PWA] Claim stored for sync");
  } catch (error) {
    logger.error("[PWA] Failed to store pending claim:", error);
  }
}

async function openClaimsDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("PCSCopilotDB", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains("pendingClaims")) {
        db.createObjectStore("pendingClaims", { keyPath: "id" });
      }
    };
  });
}

function handleServiceWorkerMessage(data: ServiceWorkerMessage) {
  logger.info("[PWA] Message from service worker:", data);

  switch (data.type) {
    case "sync-success":
      if (data.claimId) {
        showSyncSuccessNotification(data.claimId);
      }
      break;
    case "sync-failed":
      if (data.claimId) {
        showSyncFailedNotification(data.claimId);
      }
      break;
    default:
      logger.info("[PWA] Unknown message type:", data.type);
  }
}

function showUpdateNotification() {
  // Show a toast or banner that a new version is available
  if (typeof window !== "undefined") {
    const event = new CustomEvent("pwa-update-available");
    window.dispatchEvent(event);
  }
}

function showSyncSuccessNotification(claimId: string) {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("pwa-sync-success", { detail: { claimId } });
    window.dispatchEvent(event);
  }
}

function showSyncFailedNotification(claimId: string) {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("pwa-sync-failed", { detail: { claimId } });
    window.dispatchEvent(event);
  }
}

export async function requestPushNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    logger.info("[PWA] Push notifications not supported");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    logger.info("[PWA] Notification permission:", permission);

    if (permission === "granted") {
      await subscribeToPushNotifications();
      return true;
    }

    return false;
  } catch (error) {
    logger.error("[PWA] Failed to request notification permission:", error);
    return false;
  }
}

async function subscribeToPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""),
    });

    logger.info("[PWA] Push subscription:", subscription);

    // Send subscription to server
    await fetch("/api/pcs/push-subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });

    return subscription;
  } catch (error) {
    logger.error("[PWA] Push subscription failed:", error);
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export async function checkOnlineStatus() {
  if (typeof window === "undefined") {
    return true;
  }

  return navigator.onLine;
}

export function listenToOnlineStatus(callback: (isOnline: boolean) => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}
