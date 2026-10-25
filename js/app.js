import { addNote, deleteNote, getNotes, updateNote } from "./db.js";
import { createCameraController } from "./camera.js";
import { requestNotificationPermission, scheduleReminder } from "./notification.js";

const statusElement = document.querySelector("#app-status");
const notesList = document.querySelector("#notes-list");
const emptyState = document.querySelector("#empty-state");
const noteForm = document.querySelector("#note-form");
const editorBackdrop = document.querySelector("#editor-backdrop");
const titleInput = document.querySelector("#note-title");
const contentInput = document.querySelector("#note-content");
const reminderInput = document.querySelector("#note-reminder");
const cameraPreview = document.querySelector("#camera-preview");
const photoPreview = document.querySelector("#photo-preview");
const captureButton = document.querySelector("#capture-photo");
const clearPhotoButton = document.querySelector("#clear-photo");
const camera = createCameraController(cameraPreview);
let pendingImage = null;
let editingNoteId = null;
let activeView = "notes";
let installPrompt = null;

function setStatus(message) {
  statusElement.textContent = message;
}

function toLocalDateTime(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function closeEditor() {
  camera.stop();
  editorBackdrop.hidden = true;
  document.body.classList.remove("editor-open");
  noteForm.reset();
  photoPreview.removeAttribute("src");
  photoPreview.hidden = true;
  cameraPreview.hidden = true;
  captureButton.disabled = true;
  clearPhotoButton.hidden = true;
  pendingImage = null;
  editingNoteId = null;
}

function openEditor(note = null) {
  editingNoteId = note?.id || null;
  pendingImage = note?.image || null;
  titleInput.value = note?.title || "";
  contentInput.value = note?.content || "";
  reminderInput.value = toLocalDateTime(note?.reminderAt);
  if (pendingImage) {
    photoPreview.src = pendingImage;
    photoPreview.hidden = false;
    clearPhotoButton.hidden = false;
  } else {
    photoPreview.removeAttribute("src");
    photoPreview.hidden = true;
    clearPhotoButton.hidden = true;
  }
  editorBackdrop.hidden = false;
  document.body.classList.add("editor-open");
  window.requestAnimationFrame(() => titleInput.focus());
}

function renderNotes() {
  const searchTerm = document.querySelector("#note-search").value.trim().toLocaleLowerCase("vi");
  const allNotes = getNotes();
  const visibleNotes = allNotes.filter((note) => {
    const matchesView = activeView !== "reminders" || Boolean(note.reminderAt);
    const searchableText = `${note.title} ${note.content}`.toLocaleLowerCase("vi");
    return matchesView && searchableText.includes(searchTerm);
  });

  notesList.replaceChildren();
  for (const note of visibleNotes) {
    const card = document.createElement("article");
    card.className = "note-card";

    const openButton = document.createElement("button");
    openButton.className = "note-open";
    openButton.type = "button";
    openButton.dataset.editNote = note.id;

    const title = document.createElement("span");
    title.className = "note-title";
    title.textContent = note.title || "Ghi chú";

    const content = document.createElement("span");
    content.className = "note-content";
    content.textContent = note.content;
    openButton.append(title, content);

    if (note.image) {
      const image = document.createElement("img");
      image.className = "note-image";
      image.src = note.image;
      image.alt = `Ảnh đính kèm cho ghi chú ${note.title}`;
      openButton.append(image);
    }

    if (note.reminderAt) {
      const reminder = document.createElement("span");
      reminder.className = "note-reminder";
      reminder.textContent = new Date(note.reminderAt).toLocaleString("vi-VN");
      openButton.append(reminder);
    }

    const removeButton = document.createElement("button");
    removeButton.className = "note-delete";
    removeButton.type = "button";
    removeButton.dataset.deleteNote = note.id;
    removeButton.setAttribute("aria-label", `Xóa ghi chú ${note.title || ""}`);
    removeButton.title = "Xóa ghi chú";
    removeButton.textContent = "×";

    card.append(openButton, removeButton);
    notesList.append(card);
  }

  emptyState.hidden = visibleNotes.length > 0;
  document.querySelector("#notes-heading").textContent =
    activeView === "reminders" ? "LỜI NHẮC" : "GHI CHÚ";
}

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  if (!title && !content && !pendingImage) {
    closeEditor();
    return;
  }

  try {
    const wasEditing = Boolean(editingNoteId);
    const noteData = {
      title: title || "Ghi chú",
      content,
      reminderAt: reminderInput.value ? new Date(reminderInput.value).toISOString() : null,
      image: pendingImage,
    };
    const note = editingNoteId
      ? updateNote(editingNoteId, noteData)
      : addNote(noteData);
    scheduleReminder(note);
    closeEditor();
    renderNotes();
    setStatus(wasEditing ? "Đã cập nhật ghi chú." : "Đã lưu ghi chú.");
  } catch (error) {
    setStatus(`Không thể lưu ghi chú: ${error.message}`);
  }
});

notesList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-note]");
  if (deleteButton) {
    try {
      if (deleteNote(deleteButton.dataset.deleteNote)) {
        renderNotes();
        setStatus("Đã xóa ghi chú.");
      }
    } catch (error) {
      setStatus(`Không thể xóa ghi chú: ${error.message}`);
    }
    return;
  }

  const editButton = event.target.closest("[data-edit-note]");
  if (!editButton) {
    return;
  }
  const note = getNotes().find((item) => item.id === editButton.dataset.editNote);
  if (note) {
    openEditor(note);
  }
});

document.querySelector("#quick-add").addEventListener("click", () => openEditor());
document.querySelector("#close-editor").addEventListener("click", closeEditor);
editorBackdrop.addEventListener("click", (event) => {
  if (event.target === editorBackdrop) {
    closeEditor();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !editorBackdrop.hidden) {
    closeEditor();
  }
});

document.querySelector("#start-camera").addEventListener("click", async () => {
  try {
    await camera.start();
    captureButton.disabled = false;
    setStatus("Camera đã sẵn sàng.");
  } catch (error) {
    setStatus(`Không thể mở camera: ${error.message}`);
  }
});

captureButton.addEventListener("click", () => {
  try {
    pendingImage = camera.capture();
    photoPreview.src = pendingImage;
    photoPreview.hidden = false;
    clearPhotoButton.hidden = false;
    camera.stop();
    captureButton.disabled = true;
    setStatus("Ảnh đã đính kèm. Lưu ghi chú để giữ ảnh.");
  } catch (error) {
    setStatus(`Không thể chụp ảnh: ${error.message}`);
  }
});

clearPhotoButton.addEventListener("click", () => {
  pendingImage = null;
  photoPreview.removeAttribute("src");
  photoPreview.hidden = true;
  clearPhotoButton.hidden = true;
});

document.querySelector("#enable-notifications").addEventListener("click", async () => {
  try {
    const permission = await requestNotificationPermission();
    setStatus(permission === "granted"
      ? "Đã bật thông báo cho các nhắc nhở."
      : "Quyền thông báo chưa được cấp.");
    if (permission === "granted") {
      getNotes().forEach(scheduleReminder);
    }
  } catch (error) {
    setStatus(`Không thể bật thông báo: ${error.message}`);
  }
});

document.querySelector("#note-search").addEventListener("input", renderNotes);

document.querySelector(".sidebar").addEventListener("click", (event) => {
  const viewButton = event.target.closest("[data-view]");
  if (!viewButton) {
    return;
  }
  activeView = viewButton.dataset.view;
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button === viewButton);
  });
  renderNotes();
});

document.querySelector("#menu-toggle").addEventListener("click", () => {
  document.body.classList.toggle("sidebar-collapsed");
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  document.querySelector("#install-app").hidden = false;
});

document.querySelector("#install-app").addEventListener("click", async () => {
  if (!installPrompt) {
    return;
  }
  await installPrompt.prompt();
  installPrompt = null;
  document.querySelector("#install-app").hidden = true;
});

window.addEventListener("pagehide", () => camera.stop());
renderNotes();
getNotes().forEach(scheduleReminder);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch((error) => {
    setStatus(`Không thể đăng ký Service Worker: ${error.message}`);
  });
}
