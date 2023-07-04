import Editor from "./Editor";
import Login from "./Login";
import { useState } from "react";

function App() {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");

  return (
    <div className="App">
      {username !== "" && roomId !== "" && <Editor username={username} roomId={roomId}/>}
      {(username === "" || roomId === "") && <Login setUsername={setUsername} setRoomId={setRoomId} />}
    </div>
  );
}

export default App;
