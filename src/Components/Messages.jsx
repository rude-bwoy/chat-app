import { useEffect, useState } from "react";
//import { connectToScaledrone } from "../Helpers/scaledrone";

export default function Messages() {

    const [messages, setMessages] = useState([]);
    const [myId, setMyId] = useState(null);
    
    const drone = new window.Scaledrone(process.env.REACT_APP_CHANNEL_ID);
    const room = drone.subscribe('first-chat');

    const sendMessage = (inputText) => {
        drone.publish({
            room: 'first-chat',
            message: {
            text: inputText
            }
        });
    }
    
    room.on('open', error => {
        if (error) {
            return console.error(error);
        }    
    });

    room.on('message', message => {
        setMessages(prevMessages => [
            ...prevMessages,
            {
                "clientId": message.clientId,
                "timestamp": new Date(message.timestamp),
                "text": message.data.text
            }
        ]);
    });
   
    return(
        <div className='main-container'>
          <div className='main-flex-items left'>
            left
          </div>
          <div className='main-flex-items right'>
            <div className='chat-container'>
                <div className='messages'>
                    <ul>
                        {console.log(messages)}
                        {messages.map(message => <li key={crypto.randomUUID()}>{message.text}</li>)}  
                    </ul>
                </div>
              <Input sendMessage={sendMessage}/>
            </div>
          </div>
        </div>
    ); 
}


function Input(props) {

    const [text, setText] = useState("");
    const input = document.getElementById("input");

    function prepareMessage(e) {
        e.preventDefault();
        if(!e.target.input.value) {
            return;
        };
        props.sendMessage(text);
        setText("");
        input.value = "";
    }

    return(    
        <div className='form'>
            <form onSubmit={(e) => prepareMessage(e)}>
                <input id="input" type="text" onChange={(e) => {
                    setText(e.target.value)
                }}/>
                <input type="submit" value='Send'/>
            </form>
        </div>
    );

}


