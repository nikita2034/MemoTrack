import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const DB_NAME = "notesDB";
const DB_VERSION = 1;

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject("Error opening database");
    };

    request.onsuccess = () => {
      const db = request.result as IDBDatabase;
      if (db) {
        resolve(db);
      } else {
        reject("Database not found");
      }
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBRequest<IDBDatabase>)
        .result as IDBDatabase;
      const objectStore = db.createObjectStore("notes", {
        keyPath: "id",
        autoIncrement: true,
      });
      objectStore.createIndex("title", "title", { unique: false });
      objectStore.createIndex("description", "description", { unique: false });
      objectStore.createIndex("tags", "tags", {
        unique: false,
        multiEntry: true,
      });
    };
  });
};

export const fetchNotes = createAsyncThunk<
  Note[],
  void,
  { rejectValue: string }
>("notes/fetchNotes", async (_, { rejectWithValue }) => {
  try {
    const db = await openDB();
    const transaction = db.transaction(["notes"], "readonly");
    const objectStore = transaction.objectStore("notes");
    const request = objectStore.getAll();

    return new Promise<Note[]>((resolve, reject) => {
      request.onsuccess = () => {
        const notes = request.result as Note[];
        resolve(notes);
      };
      request.onerror = () => {
        reject(rejectWithValue("Error fetching notes"));
      };
    });
  } catch (error) {
    return rejectWithValue("Error fetching notes");
  }
});

export const addNote = createAsyncThunk("notes/addNote", async (note: Note) => {
  try {
    const db = await openDB();
    const transaction = db.transaction(["notes"], "readwrite");
    const objectStore = transaction.objectStore("notes");
    const request = objectStore.add(note);

    return new Promise<Note>((resolve, reject) => {
      request.onsuccess = () => {
        resolve(note);
      };
      request.onerror = () => {
        reject("Error adding note");
      };
    });
  } catch (error) {
    throw new Error("Error adding note");
  }
});

export const deleteNote = createAsyncThunk(
  "notes/deleteNote",
  async (id: number, { rejectWithValue }) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(["notes"], "readwrite");
      const objectStore = transaction.objectStore("notes");
      const request = objectStore.delete(id);

      return new Promise<number>((resolve, reject) => {
        request.onsuccess = () => {
          resolve(id);
        };
        request.onerror = () => {
          reject("Error deleting note");
        };
      });
    } catch (error) {
      return rejectWithValue("Error deleting note");
    }
  }
);

// export const searchNotesByTitle = createAsyncThunk<Note[], string>(
//   "notes/searchNotesByTitle",
//   async (searchTerm: string) => {
//     try {
//       const db = await openDB();
//       const transaction = db.transaction(["notes"], "readonly");
//       const objectStore = transaction.objectStore("notes");
//       const index = objectStore.index("title");

//       const range = IDBKeyRange.bound(
//         searchTerm.toLowerCase(),
//         searchTerm.toLowerCase() + "\uffff"
//       );
//       const request = index.openCursor(range);

//       const foundNotes: Note[] = [];

//       request.onsuccess = (event) => {
//         const cursor = (event.target as IDBRequest).result;
//         if (cursor) {
//           foundNotes.push(cursor.value);
//           cursor.continue();
//         }
//       };

//       return new Promise<Note[]>((resolve, reject) => {
//         transaction.oncomplete = () => {
//           resolve(foundNotes);
//         };
//         transaction.onerror = () => {
//           reject("Error searching notes");
//         };
//       });
//     } catch (error) {
//       throw new Error("Error searching notes");
//     }
//   }
// );
export const searchNotesByTitle = createAsyncThunk<Note[], string>(
  "notes/searchNotesByTitle",
  async (searchTerm: string) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(["notes"], "readonly");
      const objectStore = transaction.objectStore("notes");
      const index = objectStore.index("title");

      const lowerCaseSearchTerm = searchTerm.toLowerCase(); // Преобразование к нижнему регистру

      const request = index.openCursor();

      const foundNotes: Note[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const noteTitle = cursor.value.title.toLowerCase(); // Преобразование заголовка к нижнему регистру
          if (noteTitle.includes(lowerCaseSearchTerm)) {
            foundNotes.push(cursor.value);
          }
          cursor.continue();
        }
      };

      return new Promise<Note[]>((resolve, reject) => {
        transaction.oncomplete = () => {
          resolve(foundNotes);
        };
        transaction.onerror = () => {
          reject("Error searching notes");
        };
      });
    } catch (error) {
      throw new Error("Error searching notes");
    }
  }
);


export const updateNote = createAsyncThunk<Note, Note>(
  "notes/updateNote",
  async (updatedNote: Note) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(["notes"], "readwrite");
      const objectStore = transaction.objectStore("notes");
      const request = objectStore.put(updatedNote);

      return new Promise<Note>((resolve, reject) => {
        request.onsuccess = () => {
          resolve(updatedNote);
        };
        request.onerror = () => {
          reject("Error updating note");
        };
      });
    } catch (error) {
      throw new Error("Error updating note");
    }
  }
);

export const searchNotesByTags = createAsyncThunk<Note[], string[]>(
  "notes/searchNotesByTags",
  async (tags: string[]) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(["notes"], "readonly");
      const objectStore = transaction.objectStore("notes");
      const index = objectStore.index("tags");

      const foundNotes: Note[] = [];

      for (const tag of tags) {
        const request = index.openCursor(tag);

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            foundNotes.push(cursor.value);
            cursor.continue();
          }
        };
      }

      return new Promise<Note[]>((resolve, reject) => {
        transaction.oncomplete = () => {
          resolve(foundNotes);
        };
        transaction.onerror = () => {
          reject("Error searching notes");
        };
      });
    } catch (error) {
      throw new Error("Error searching notes");
    }
  }
);

interface Note {
  id: number;
  title: string;
  description: string;
  tags: string[];
  date: string;
}

interface NotesState {
  notes: Note[];
  tags: string[];
  selectedTags: string[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: NotesState = {
  notes: [],
  tags: [] as string[],
  selectedTags: [] as string[],
  status: "idle",
  error: null,
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchNotes.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(fetchNotes.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.notes = action.payload;
      const allTags = action.payload.reduce((tags: string[], note) => {
        note.tags.forEach((tag) => {
          if (!tags.includes(tag)) {
            tags.push(tag);
          }
        });
        return tags;
      }, []);

      state.tags = allTags;
    });
    builder.addCase(fetchNotes.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload as string;
    });

    builder.addCase(addNote.fulfilled, (state, action) => {
      state.notes.push(action.payload);
      const newTags = action.payload.tags.filter(
        (tag) => !state.tags.includes(tag)
      );
      state.tags = [...state.tags, ...newTags];
    });
    builder.addCase(deleteNote.fulfilled, (state, action) => {
      const deletedNoteId = action.payload;
      state.notes = state.notes.filter((note) => note.id !== deletedNoteId);
      state.tags = state.notes.reduce((tags: string[], note) => {
        note.tags.forEach((tag) => {
          if (!tags.includes(tag)) {
            tags.push(tag);
          }
        });
        return tags;
      }, []);
    });

    builder.addCase(deleteNote.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(searchNotesByTitle.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.notes = action.payload;
    });
    builder.addCase(searchNotesByTitle.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload as string;
    });
    builder.addCase(updateNote.fulfilled, (state, action) => {
      const updatedNote = action.payload;
      const index = state.notes.findIndex((note) => note.id === updatedNote.id);

      if (index !== -1) {
        state.notes[index] = updatedNote;
      }
      const allTags = state.notes.reduce((tags: string[], note) => {
        note.tags.forEach((tag) => {
          if (!tags.includes(tag)) {
            tags.push(tag);
          }
        });
        return tags;
      }, []);

      state.tags = allTags;
    });
    builder.addCase(searchNotesByTags.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.notes = action.payload;
    });
    builder.addCase(searchNotesByTags.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.error.message || "Error searching notes";
    });
  },
});

export default notesSlice.reducer;
