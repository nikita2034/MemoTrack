import { configureStore } from "@reduxjs/toolkit";
import notesReducer from "./slices/NoteSlice";

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

const store = configureStore({
  reducer: {
    notes: notesReducer,
  },
});

export default store;
