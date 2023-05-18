import React, { useEffect, useState } from "react";
import Chats from "../components/Chats/Chats";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
const axios = require("axios");
import "./Home.css";

const Home = () => {
  const [audioFile, setAudioFile] = useState<File | Blob | string>("");
  const [outputFile, setOutputFile] = useState<File | null>(null);
  const [chats, setChats] = useState<Array<any>>([]);
  const [recordingDisabled, toggleRecordingDisabled] = useState<Boolean>(false);

  const serverURL = "http://ec2-52-66-222-47.ap-south-1.compute.amazonaws.com";
  // const serverURL = "http://localhost:4000";

  useEffect(() => {
    if (audioFile && audioFile !== "") {
      console.log(audioFile);
      answerUserQuery();
    }
  }, [audioFile]);

  useEffect(() => {
    if (chats?.length) {
      console.log("Getting audio for latest text!");
      getAudioFromText(chats[chats.length - 1].content);
    }
  }, [chats]);

  useEffect(() => {
    if (outputFile) {
      console.log("Output file - ", outputFile);
      const audioBlob = new Blob([outputFile], { type: "audio/mpeg" });
      playAudio(audioBlob);
    }
  }, [outputFile]);

  const answerUserQuery = async () => {
    try {
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("chats", JSON.stringify(chats));
      setOutputFile(null);
      const result = await axios.post(`${serverURL}/user-query`, formData);
      if (result?.data?.data?.chats?.length) {
        let localChats = result?.data?.data?.chats;
        setChats([...localChats]);
        toggleRecordingDisabled(false);
      }
    } catch (err: any) {
      console.log("Error occured! - ", err.message);
    }
  };

  const getAudioFromText = async (text: any) => {
    try {
      const payload = {
        text: text,
      };
      const result = await axios.post(
        `${serverURL}/get-audio-from-text`,
        payload,
        { responseType: "arraybuffer" }
      );
      if (result?.data) {
        console.log(result);
        setOutputFile(result.data);
      }
    } catch (err: any) {
      console.log("Error in getting audio - ", err.message);
    }
  };

  const playAudio = async (audioFile: Blob) => {
    try {
      const url = window.URL.createObjectURL(audioFile);
      const audio = new Audio(url);
      audio.load();
      await audio.play();
    } catch (err: any) {
      console.log("Error in playing audio - ", err.message);
    }
  };

  return (
    <div className="home-container">
      <div className="header">
        <Header />
      </div>
      <div className="sidebar">
        <Sidebar
          setAudioFile={setAudioFile}
          recordingDisabled={recordingDisabled}
          toggleRecordingDisabled={toggleRecordingDisabled}
        />
      </div>
      <div className="chats">
        <Chats chats={chats} />
      </div>
    </div>
  );
};

export default Home;
