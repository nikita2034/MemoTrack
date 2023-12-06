import { useState } from "react";
import styles from "./Sidebat.module.scss";
import { Menu, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { searchNotesByTags, fetchNotes } from "../../store/slices/NoteSlice";
const Sidebar = () => {
  const dispatch: AppDispatch = useDispatch();
  const tags = useSelector((state: RootState) => state.notes.tags);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const tagClicked = (tag: string) => {
    return selectedTags.indexOf(tag) !== -1;
  };

  const handleTagClick = (tag: string) => {
    const updatedTags = [...selectedTags];
    const tagIndex = updatedTags.indexOf(tag);

    if (tagIndex === -1) {
      updatedTags.push(tag);
    } else {
      updatedTags.splice(tagIndex, 1);
    }

    setSelectedTags(updatedTags);

    if (updatedTags.length === 0) {
      dispatch(fetchNotes());
    } else {
      dispatch(searchNotesByTags(updatedTags));
    }
  };

  const menuItems = tags.map((tag, index) => (
    <Menu.Item
      key={index.toString()}
      onClick={() => handleTagClick(tag)}
      style={{
        cursor: "pointer",
        marginRight: "10px",
        color: tagClicked(tag) ? "blue" : "black",
      }}
    >
      {tag}
    </Menu.Item>
  ));

  const menu = <Menu>{menuItems}</Menu>;

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <img className={styles.image} src="./logo.png" />
        <div className={styles.title}>MemoTrack</div>
      </div>

      <Dropdown
        overlay={menu}
        placement="bottomLeft"
        className={styles.tag_dropdown}
      >
        <div className="tag-dropdown">
          Tags <DownOutlined />
        </div>
      </Dropdown>
    </div>
  );
};

export default Sidebar;
