import { useState, useEffect } from "react";
import io from "socket.io-client";

import Chat from "./components/Chat/Chat";

import "./App.css";

const ENDPOINT = "http://localhost:5000";

const socket = io.connect(ENDPOINT);

function App() {
  const [username, setUsername] = useState("");
  const [roomname, setRoomname] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoomHandler = () => {
    if (username !== "" && roomname !== "") {
      socket.emit("join_room", roomname);
      setShowChat(true);
    }
  };

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="App">
      {!showChat ? (
        <div className="joinChatContainer">
          <h1>Hello</h1>
          <input
            type="text"
            placeholder="name"
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />
          <input
            type="text"
            placeholder="room ID"
            onChange={(event) => {
              setRoomname(event.target.value);
            }}
          />
          <button onClick={joinRoomHandler}>Join A room</button>
        </div>
      ) : (
        <Chat socket={socket} username={username} roomname={roomname} />
      )}
    </div>
  );
}

export default App;
