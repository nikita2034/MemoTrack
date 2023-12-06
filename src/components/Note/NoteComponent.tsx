import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { Tag, Button, Input } from "antd";
import styles from "./NoteComponent.module.scss";
import { deleteNote, updateNote } from "../../store/slices/NoteSlice";
import { DeleteOutlined, EditOutlined, CheckOutlined } from "@ant-design/icons";

interface Note {
  id: number;
  title: string;
  description: string;
  date: string;
  tags: string[];
}

interface NoteProps {
  note: Note;
}

const NoteComponent: React.FC<NoteProps> = ({ note }) => {
  const dispatch: AppDispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [editedNote, setEditedNote] = useState<Note>({ ...note });
  const [expanded, setExpanded] = useState(false);

  const handleDeleteClick = () => {
    dispatch(deleteNote(note.id));
  };

  const handleNoteUpdate = async () => {
    const tagsWithPunctuation = editedNote.description
      .split(/\s+/)
      .filter((word) => word.startsWith("#"));
    const tags = tagsWithPunctuation.map((tag) =>
      tag.replace(/[^a-zA-Zа-яА-Я0-9]/g, "")
    );
    const cleanedDescription = editedNote.description.replace(/#/g, "").trim();

    const updatedNote: Note = {
      ...editedNote,
      description: cleanedDescription,
      tags: tags,
    };

    await dispatch(updateNote(updatedNote));
    setEditing(false);
  };

  const handleEditClick = () => {
    setEditing(true);
    const descriptionForEditing = note.description
      .split(/\s+/)
      .map((word) => (note.tags.includes(word) ? `#${word}` : word))
      .join(" ");
    setEditedNote({ ...editedNote, description: descriptionForEditing });
    console.log(editing);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedNote({ ...editedNote, title: e.target.value });
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setEditedNote({ ...editedNote, description: e.target.value });
  };
  const renderTags = () => {
    return note.tags.map((tag, index) => <Tag key={index}>{tag}</Tag>);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const renderDescription = () => {
    const maxLength = 100;
    let truncatedDescription = note.description;

    if (!expanded && note.description.length > maxLength) {
      truncatedDescription = note.description.substring(0, maxLength) + "...";
    }

    return truncatedDescription;
  };
  return (
    <div className={styles.note} onClick={toggleExpand}>
      <div className={styles.header_block}>
        {editing ? (
          <Input
            value={editedNote.title}
            onChange={handleTitleChange}
            className={styles.edit_title}
          />
        ) : (
          <div className={styles.title}>{note.title}</div>
        )}
        <div className="note-buttons">
          {editing ? (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleNoteUpdate()}
            >
              Save
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleEditClick}
            >
              Edit
            </Button>
          )}
          <Button type="text" danger onClick={handleDeleteClick}>
            <DeleteOutlined />
          </Button>
        </div>
      </div>

      <div className={styles.description_block}>
        {editing ? (
          <Input.TextArea
            value={editedNote.description}
            onChange={handleDescriptionChange}
            className={styles.edit_description}
            autoSize={{ minRows: 2, maxRows: 10 }}
          />
        ) : (
          <div className={styles.note_description}>{renderDescription()}</div>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.note_tags}>{renderTags()}</div>
        <div className={styles.date}>{note.date}</div>
      </div>
    </div>
  );
};

export default NoteComponent;
