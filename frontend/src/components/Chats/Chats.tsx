import React, { useEffect, useRef } from "react";
import "./Chats.css";

interface chatObject {
  role: String;
  content: String;
}

const Chats = (props: any) => {
  const { chats } = props;

  const chatsEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  return (
    <div className="chats-container">
      {chats?.length && chats?.slice(2, chats?.length)?.length
        ? chats.slice(2, chats.length).map((chat: chatObject, index: any) => (
            <div className="chat-row">
              <div
                key={index}
                className="chat-bubble"
                style={{
                  marginLeft: chat.role === "user" ? "auto" : "0",
                  marginRight: chat.role === "user" ? "0" : "auto",
                  backgroundColor:
                    chat.role === "user" ? "lightblue" : "lightpink",
                }}
              >
                <p className="chat-message">{chat.content}</p>
              </div>
            </div>
          ))
        : null}
      <div style={{ margin: 0, padding: 0, height: 0 }} ref={chatsEndRef} />
    </div>
  );
};

export default Chats;
