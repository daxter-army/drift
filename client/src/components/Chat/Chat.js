import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";

import "./Chat.css";

const Chat = ({ socket, username, roomname }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const timeCreator = () => {
    return `${new Date(Date.now()).getHours()}:${new Date(
      Date.now()
    ).getMinutes()}`;
  };

  const messageHandler = async () => {
    if (currentMessage !== "") {
      const messageData = {
        roomname: roomname,
        author: username,
        message: currentMessage,
        time: timeCreator(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((prevList) => [...prevList, messageData]);
      setCurrentMessage("");
    }
  };

  const buttonSendMessageHandler = (event) => {
    console.log(event);
    if (event.key === "Enter") {
      messageHandler();
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((prevList) => [...prevList, data]);
    });
  }, [socket]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((item) => {
            return (
              <div
                className="message"
                id={username === item.author ? "you" : "other"}
              >
                <div>
                  <div className="message-content">
                    <p>{item.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{item.time}</p>
                    <p id="author">{item.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Say it here..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={buttonSendMessageHandler}
        />
        <button onClick={messageHandler}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
