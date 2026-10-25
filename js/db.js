const STORAGE_KEY = "pwa-note-app.notes.v1";

function readNotes() {
  const value = localStorage.getItem(STORAGE_KEY);
  if (value === null) {
    return [];
  }

  const notes = JSON.parse(value);
  if (!Array.isArray(notes)) {
    throw new Error("Dữ liệu ghi chú trong bộ nhớ không hợp lệ.");
  }
  return notes;
}

function writeNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function getNotes() {
  return readNotes().sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function addNote(note) {
  const notes = readNotes();
  const now = new Date().toISOString();
  const savedNote = {
    id: crypto.randomUUID(),
    title: note.title.trim(),
    content: note.content.trim(),
    reminderAt: note.reminderAt || null,
    image: note.image || null,
    createdAt: now,
    updatedAt: now,
  };

  writeNotes([...notes, savedNote]);
  return savedNote;
}

export function updateNote(id, changes) {
  const notes = readNotes();
  const noteIndex = notes.findIndex((note) => note.id === id);
  if (noteIndex === -1) {
    throw new Error("Không tìm thấy ghi chú cần cập nhật.");
  }

  const updatedNote = {
    ...notes[noteIndex],
    title: changes.title.trim(),
    content: changes.content.trim(),
    reminderAt: changes.reminderAt || null,
    image: changes.image || null,
    updatedAt: new Date().toISOString(),
  };
  notes[noteIndex] = updatedNote;
  writeNotes(notes);
  return updatedNote;
}

export function deleteNote(id) {
  const notes = readNotes();
  const remainingNotes = notes.filter((note) => note.id !== id);
  if (remainingNotes.length === notes.length) {
    return false;
  }
  writeNotes(remainingNotes);
  return true;
}
