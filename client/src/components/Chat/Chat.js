import io from "socket.io-client";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ScrollToBottom from "react-scroll-to-bottom";

import styles from "./Chat.module.css";

const ENDPOINT = "http://localhost:5000";
const socket = io.connect(ENDPOINT);

const Chat = () => {
  const navigate = useNavigate();
  const search = useLocation().search;
  const username = new URLSearchParams(search).get("username");
  const roomname = new URLSearchParams(search).get("roomname");

  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [totalUsersInRoom, setTotalUsersInRoom] = useState(0);

  const timeStamp = () => {
    return `${new Date(Date.now()).getHours()}:${new Date(
      Date.now()
    ).getMinutes()}`;
  };

  const messageHandler = async () => {
    if (currentMessage !== "") {
      const messageData = {
        uid: new Date().getMilliseconds(),
        message: currentMessage,
        author: username,
        roomname: roomname,
        time: timeStamp(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((prevList) => [...prevList, messageData]);
      setCurrentMessage("");
    }
  };

  const buttonSendMessageHandler = (event) => {
    if (event.key === "Enter") {
      messageHandler();
    }
  };

  useEffect(() => {
    console.log("useEffect running!");
    if (username === null || roomname === null) {
      navigate("/");
    } else {
      // create connection
      console.log("Creating connection");
      socket.emit("join_room", { username, roomname }, () => {
        alert("Username already exists!");
        navigate("/");
      });
    }
  }, [username, roomname, navigate, socket]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((prevList) => [...prevList, data]);
    });

    socket.on("meta_info", (data) => {
      setTotalUsersInRoom(data.totalActiveUsers);
    });

    return () => {
      console.log("socket disconnection");
      socket.disconnect();
    };
  }, [socket]);

  return (
    <div className={styles.chatWrapper}>
      <div className={styles.header}>
        <p>
          {roomname} | {totalUsersInRoom} online
        </p>
        <p className={styles.logo}>drift</p>
      </div>
      <div className={styles.body}>
        <ScrollToBottom className={styles.messageContainer}>
          {messageList.map((item) => {
            return (
              <div
                key={item.uid}
                className={`${styles.messageWrapper} ${
                  username === item.author && styles.myMessageWrapper
                } ${item.author === "admin" && styles.adminMessageWrapper}`}
              >
                <div
                  className={`${styles.message} ${
                    item.author === "admin" && styles.adminMessage
                  } ${username === item.author && styles.myMessage}`}
                >
                  <div className={styles.messageContent}>
                    <p>{item.message}</p>
                  </div>
                  <div className={styles.messageMeta}>
                    {/* for author messages */}
                    {item.time && <p id="time">{item.time}</p>}
                    {item.author !== "admin" && (
                      <p id="author">{item.author}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className={styles.footer}>
        <input
          type="text"
          value={currentMessage}
          placeholder="Say it here..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={buttonSendMessageHandler}
        />
        <button onClick={messageHandler}>/Send</button>
      </div>
    </div>
  );
};

export default Chat;
