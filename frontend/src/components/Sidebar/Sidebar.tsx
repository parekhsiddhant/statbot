import React, { useEffect, useRef, useState } from "react";
import "./Sidebar.css";
import { IconContext } from "react-icons";
import { IoMicCircleSharp, IoStopCircleSharp } from "react-icons/io5";

const mimeType = "audio/webm";

const Sidebar = (props: any) => {
  const { setAudioFile, recordingDisabled, toggleRecordingDisabled } = props;
  const mediaRecorder = useRef<any>(null);
  const [recordingPermission, setRecordingPermission] =
    useState<Boolean>(false);
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const [audioStream, setAudioStream] = useState<any | null>(null);
  const [audioChunks, setAudioChunks] = useState<Array<any>>([]);
  const [audio, setAudio] = useState<string>("");

  const getMicrophonePermission = async () => {
    if (recordingPermission) {
      startRecording();
    } else {
      if ("MediaRecorder" in window) {
        try {
          const streamData = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });
          setRecordingPermission(true);
          setAudioStream(streamData);
          console.log("Permission granted!");
        } catch (err) {
          console.log("Permission denied!", err);
          setRecordingPermission(false);
          // alert(err.message);
        }
      } else {
        alert("The MediaRecorder API is not supported in your browser.");
      }
    }
  };

  useEffect(() => {
    if (recordingPermission) {
      startRecording();
    }
  }, [recordingPermission]);

  useEffect(() => {
    console.log("Recording status changed!");
  }, [recordingStatus]);

  const startRecording = () => {
    if (recordingPermission) {
      setRecordingStatus("recording");
      const media = new MediaRecorder(audioStream, { mimeType: mimeType });
      mediaRecorder.current = media;
      mediaRecorder.current.start();

      let localAudioChunks: Array<any> = [];
      mediaRecorder.current.ondataavailable = (event: any) => {
        if (typeof event.data === "undefined") return;
        if (event.data.size === 0) return;
        localAudioChunks.push(event.data);
      };
      setAudioChunks(localAudioChunks);
    }
  };

  const stopRecording = () => {
    setRecordingStatus("inactive");
    toggleRecordingDisabled(true);
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      const audioUrl = URL.createObjectURL(audioBlob);
      const file = new File([audioBlob], "audioFile.webm", { type: mimeType });
      setAudio(audioUrl);
      setAudioFile(file);
      setAudioChunks([]);
    };
  };

  return (
    <div className="sidebar-container">
      {/* <button onClick={getMicrophonePermission}>Get Permission</button> */}
      <IconContext.Provider value={{ color: "teal", size: "100%" }}>
        <div>
          {recordingStatus === "recording" ? (
            <button
              className="btn"
              disabled={recordingDisabled}
              onClick={stopRecording}
            >
              <IoStopCircleSharp />
            </button>
          ) : (
            <button
              className="btn"
              disabled={recordingDisabled}
              onClick={getMicrophonePermission}
            >
              <IoMicCircleSharp />
            </button>
          )}
          {/* {audio && (
					<a download href={audio}>
						Download Recording
					</a>
				)} */}
        </div>
      </IconContext.Provider>
    </div>
  );
};

export default Sidebar;
