import {basicSetup, EditorView} from "codemirror"
import {EditorState, Text as TextType} from "@codemirror/state"
import {javascript as javascriptPlugin} from "@codemirror/lang-javascript"
import {html as htmlPlugin} from "@codemirror/lang-html"
import {css as CSSPlugin} from "@codemirror/lang-css"
import './App.css';
import {useState, useEffect, useRef} from "react"
import io from "socket.io-client"

export default function Editor({ username, roomId }) {
    const [html, setHTML] = useState(""); 
    const [css, setCSS] = useState(""); 
    const [js, setJS] = useState(""); 
  
    const [htmlInited, setHTMLInited] = useState(false);
    const [cssInited, setCSSInited] = useState(false);
    const [jsInited, setJSInited] = useState(false);

  
    const [users, setUsers] = useState([]);
  
    const socket = useRef();
  
    const [srcDoc, setSrcDoc] = useState(`
      <html>
        <body>
        </body>
      </html>
    `) 
  
    useEffect(() => {
      setSrcDoc(`
        <html>
          <style>${css}</style>
          <body>${html}</body>
          <script>${js}</script>
        </html> 
      `)
    }, [html, css, js])
  
    useEffect(() => {
        if (!socket.current) {
            socket.current = io('https://lviv-man-practice-server.onrender.com/', {
                transports: ['websocket']
            });

            socket.current.on("connect", () => {
                socket.current.emit("CONNECTED_TO_ROOM", {
                    roomId, username
                });
            })

            socket.current.on("ROOM:CONNECTION", (users) => {
                console.log(users)
                setUsers(users);
            })

        }
      if (!htmlInited) {
      const htmlEditor = new EditorView({
        state: EditorState.create({
          doc: "",
          extensions: [
              basicSetup,
              htmlPlugin(),
              EditorView.updateListener.of(function(e) {
                  if (e.transactions && (e.transactions[0]?.isUserEvent("input") || e.transactions[0]?.isUserEvent("delete"))) {
                    socket.current.emit("CODE_CHANGES_HTML", e.state.doc.toJSON());
                  }
                  setHTML(e.state.doc.toString());
              })
          ]
        }),
        parent: document.getElementById("html-container")
      })
      setHTMLInited(true);

      socket.current.on("CODE_CHANGES_HTML", (code) => {
        htmlEditor.dispatch({
            changes: {from: 0, to: htmlEditor.state.doc.length, insert: TextType.of(code)}
        })
      })
    }
     
    if (!cssInited) {
      const cssEditor = new EditorView({
        state: EditorState.create({
          doc: "",
            extensions: [
              basicSetup,
              CSSPlugin(),
                EditorView.updateListener.of(function(e) {
                    if (e.transactions && (e.transactions[0]?.isUserEvent("input") || e.transactions[0]?.isUserEvent("delete"))) {
                        socket.current.emit("CODE_CHANGES_CSS", e.state.doc.toJSON());
                    }
                    setCSS(e.state.doc.toString());
                })
            ]
        }),
        parent: document.getElementById("css-container")
      })
      setCSSInited(true);

      socket.current.on("CODE_CHANGES_CSS", (code) => {
        cssEditor.dispatch({
            changes: {from: 0, to: cssEditor.state.doc.length, insert: TextType.of(code)}
        })
      })
    }
  
    if (!jsInited) {
      const jsEditor = new EditorView({
        state: EditorState.create({
          doc: "",
            extensions: [
              basicSetup,
              javascriptPlugin({
                jsx: true,
              }),
                EditorView.updateListener.of(function(e) {
                    if (e.transactions && (e.transactions[0]?.isUserEvent("input") || e.transactions[0]?.isUserEvent("delete"))) {
                        socket.current.emit("CODE_CHANGES_JS", e.state.doc.toJSON());
                    }
                    setJS(e.state.doc.toString());
                })
            ]
        }),
        parent: document.getElementById("js-container")
      })
      setJSInited(true);

      socket.current.on("CODE_CHANGES_JS", (code) => {
        jsEditor.dispatch({
            changes: {from: 0, to: jsEditor.state.doc.length, insert: TextType.of(code)}
        })
      })
    }

    }, [])

    return (
        <div style={{display: "flex", flexDirection: "column", minHeight: "100vh"}}>
        {username?.length && <p style={{color: "white"}}>Username: {username}</p>}
        {roomId?.length && <p style={{color: "white"}}>roomId: {roomId}</p>}
        {users?.length && <p style={{color: "white"}}>Total users: {users.length}</p>}
        <div style={{display: "flex", flexDirection: "row", gap: "30px", marginRight: "20px", marginLeft: "20px", width: "100%", marginTop: "10px"}}>
          <div id="html-container" style={{flex: 1, borderRadius: "10px", backgroundColor: "#1D1E22", paddingBottom: "5px"}}>
              <h1>HTML</h1>
          </div>
          <div id="css-container" style={{flex: 1, borderRadius: "10px", backgroundColor: "#1D1E22", paddingBottom: "5px"}}>
              <h1>CSS</h1>
          </div>
          <div id="js-container" style={{flex: 1, borderRadius: "10px", backgroundColor: "#1D1E22", paddingBottom: "5px"}}>
              <h1>JS</h1>
          </div>
        </div>
        <iframe
            style={{width: "100%", flexGrow: 1, minHeight: "600px", marginTop: "20px"}}
            title="code-result"
            srcDoc={srcDoc}
        />
        </div>
    )
}