import React, { useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import MainSection from "../../components/MainSection/MainSection";
import styles from "./MainPage.module.scss";
import { useDispatch } from "react-redux";
import { fetchNotes } from "../../store/slices/NoteSlice";
import { AppDispatch } from "../../store/store";
const MainPage = () => {
  const dispatch: AppDispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  return (
    <div className={styles.main_page}>
      <Sidebar />
      <MainSection />
    </div>
  );
};

export default MainPage;
