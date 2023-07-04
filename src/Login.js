import config from "./config.json";

export default function Login({
    setUsername,
    setRoomId,
}) {
    const createRoom = async (event) => {
        event.preventDefault();
        const form = event.target.form;
        const username = form.username.value.trim();

        console.log("Create room", username);

        if (username !== "") {
            const response = await fetch(config.serverURLCreateRoom, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({username})
            }).then((response) => response.json());

            console.log(response);

            setUsername(username);
            setRoomId(response.roomId);
        }
    }

    const joinRoom = async (event) => {
        event.preventDefault();
        const form = event.target.form;
        const username = form.username.value.trim();
        const roomId = form.roomId.value.trim();

        console.log("Join room", username, roomId);

        setUsername(username);
        setRoomId(roomId);
    }

    return (
        <>
            <form>
                <input id="username" type="text" placeholder="Username"></input>
                <input id="roomId" type="text" placeholder="RoomId"></input>
                <button onClick={createRoom}>Create room</button>
                <button onClick={joinRoom}>Join room</button>
            </form>
        </>
    )
}