import axios from 'axios';
import React, {useState } from 'react'
import vmsg from "vmsg";
import { ChatState } from '../../context/chatProvider';
import Timer from './Timer';

const recorder = new vmsg.Recorder({
  wasmURL: "https://unpkg.com/vmsg@0.3.0/vmsg.wasm"
});


const Notification = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordings, setRecordings] = useState([])
  const [name, setName] = useState()
 
  const { selectedChat, user, } =
    ChatState();
  const [file, setFile] =useState()

  const record = async () => {
    setIsLoading(true);

    if (isRecording) {
      let blob = await recorder.stopRecording()
     setFile(new File(
        [blob],
        'ran.mpeg',
       { type: blob.type}
      ))
      setIsLoading(false)
      setIsRecording(false)
      setRecordings(recordings?.concat(URL.createObjectURL(blob)))

    } else {
      try {
        await recorder.initAudio();
        await recorder.initWorker();
        recorder.startRecording();
        setIsLoading(false)
        setIsRecording(true)
      }
      catch (e) {
        console.error(e);
        setIsLoading(false);
      }
    }
  }
  const [index, setIndex] = useState(0);
  const [click, setClick] = useState(false)


  const sendMessage = async () => {
    let data = new FormData();
    
    data.append("file", file);
    data.append("upload_preset", "chat-app");
    data.append("cloud_name", "dugdmyq5b");  
    const config = {
      headers: {
        "Content-type": 'multipart/form-data',
      },
    };
    await axios.post("https://api.cloudinary.com/v1_1/dugdmyq5b/upload", data, config)
      .then((res) => setName(res.data.secure_url))
      .catch((err) => {
        console.log(err);
      });    
  }


  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: "center",
      height: '100vh',
      width:'80%'
    }}>
      <Timer index={index} setIndex={setIndex} click={click}/>
      <h1 style={{ fontSize: 20, fontWeight: '700' }} id="header">This is for audio</h1>
      <div style={{width:400, display:'flex', justifyContent:'space-between', marginTop:10}}>
        <button id='start' onClick={record}
          style={{
            borderWidth: 1,
            borderColor: 'black',
            padding: 5,
            backgroundColor: 'white'
          }}>
         {isRecording ? 'Stop': 'Recored'}
        </button>

        <button 
          style={{
            borderWidth: 1,
            borderColor: 'black',
            padding: 5,
            backgroundColor: 'white'
          }}
          onClick={sendMessage}>
          Send
        </button>
        <button 
          style={{
            borderWidth: 1,
            borderColor: 'black',
            padding: 5,
            backgroundColor: 'white'
          }}
        onClick={()=> setClick(prev => !prev)}>
          
          log
        </button>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {recordings.map(url => (
            <li key={url}>
              <audio src={url} controls/>
            </li>
          ))}
        </ul>

      </div>
      </div>

  )
}

export default Notification