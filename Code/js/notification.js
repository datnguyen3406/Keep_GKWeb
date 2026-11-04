export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    throw new Error("Trình duyệt không hỗ trợ thông báo.");
  }
  return Notification.requestPermission();
}

export async function showReminder(note) {
  if (Notification.permission !== "granted") {
    return;
  }

  const registration = await navigator.serviceWorker?.ready;
  const options = { body: note.content || "Đến giờ xem lại ghi chú của bạn." };
  if (registration) {
    await registration.showNotification(note.title, options);
    return;
  }
  new Notification(note.title, options);
}

export function scheduleReminder(note) {
  if (!note.reminderAt) {
    return;
  }

  const reminderTime = new Date(note.reminderAt).getTime();
  const delay = reminderTime - Date.now();
  if (!Number.isFinite(reminderTime) || delay <= 0) {
    return;
  }

  const maxDelay = 2_147_000_000;
  window.setTimeout(() => {
    if (delay > maxDelay) {
      scheduleReminder(note);
      return;
    }
    showReminder(note).catch((error) => {
      console.error("Không thể hiển thị thông báo nhắc nhở.", error);
    });
  }, Math.min(delay, maxDelay));
}
