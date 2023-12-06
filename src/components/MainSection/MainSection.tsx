import React, { useState, useEffect } from "react";
import { Input, Button, List, Modal } from "antd";
import NoteComponent from "../Note/NoteComponent";
import styles from "./MainSection.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  addNote,
  searchNotesByTitle,
  fetchNotes,
} from "../../store/slices/NoteSlice";
import { message } from "antd";
import { AppDispatch } from "../../store/store";
import { RootState } from "../../store/store";

export type Note = {
  id: number;
  title: string;
  description: string;
  tags: string[];
  date: string;
};

const MainSection = () => {
  const dispatch: AppDispatch = useDispatch();
  const notes: Note[] = useSelector((state: RootState) => state.notes.notes);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const generateUniqueId = (): number => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000);
    return timestamp + random;
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      dispatch(fetchNotes());
    } else {
      dispatch(searchNotesByTitle(searchTerm.trim()));
    }
  }, [searchTerm, dispatch]);

  const handleCancel = () => {
    setModalVisible(false);
    setTitle("");
    setDescription("");
  };

  const handleCreateNote = async () => {
    const currentDate = new Date();
    const tagsWithPunctuation = description
      .split(/\s+/)
      .filter((word) => word.startsWith("#"));

    const tags = tagsWithPunctuation.map((tag) =>
      tag.replace(/[^a-zA-Zа-яА-Я0-9]/g, "")
    );

    const cleanedDescription = description.replace(/#/g, "").trim();

    const newNote: Note = {
      id: generateUniqueId(),
      title: title,
      description: cleanedDescription,
      tags: tags,
      date: `${currentDate.getFullYear()}-${
        currentDate.getMonth() + 1
      }-${currentDate.getDate()}`,
    };

    if (!newNote.title || !newNote.description) {
      message.error("Введите заголовок и описание для создания заметки");
      return;
    }

    try {
      await dispatch(addNote(newNote));
      message.success("Заметка успешно добавлена!");
    } catch (error) {
      message.error("Ошибка при добавлении заметки");
      console.error("Ошибка при добавлении заметки:", error);
    }
    setModalVisible(false);
    setTitle("");
    setDescription("");
  };
  return (
    <div className={styles.main_section}>
      <div className={styles.header}>
        <div className={styles.title}>Notes</div>
        <Button type="primary" onClick={() => setModalVisible(true)}>
          Add
        </Button>
      </div>
      <div className={styles.notes_description}>
        Your personal notes are in one place. Organize, edit and create new
        entries with tags for easy search.
      </div>
      <div className={styles.search_bar}>
        <Input
          placeholder="Search by title"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.note_list}>
        <List
          dataSource={notes}
          renderItem={(note: Note) => (
            <List.Item key={note.id}>
              <NoteComponent note={note} />
            </List.Item>
          )}
        />
      </div>
      <Modal
        title="Создать заметку"
        visible={modalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Отмена
          </Button>,
          <Button key="create" type="primary" onClick={handleCreateNote}>
            Создать
          </Button>,
        ]}
      >
        <Input
          placeholder="Заголовок"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginBottom: "12px" }}
        />
        <Input.TextArea
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ marginBottom: "12px" }}
          autoSize={{ minRows: 2, maxRows: 10 }}
        />
      </Modal>
    </div>
  );
};

export default MainSection;
