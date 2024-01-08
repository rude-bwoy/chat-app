import { useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

let drone = null;

export default function Messages() {

    const [messages, setMessages] = useState([]);
    const [myId, setMyId] = useState(null);
    const [newUser, setNewUser] = useState(false);
    

    useEffect(() => {
        if(drone === null) {
            connectToScaledrone();
        }
    }, []);

    function connectToScaledrone() {

        drone = new window.Scaledrone(process.env.REACT_APP_CHANNEL_ID);
        const room = drone.subscribe('observable-first-chat');

        drone.on('open', error => {
            if (error) {
                return console.error(error);
            }
            setMyId(drone.clientId);         
        });

        room.on('open', error => {
            if (error) {
                return console.error(error);
            }    
        });
    
        room.on('member_join', member => {
            toastify();
        });

        room.on('message', message => {
            setMessages(prevMessages => [
                ...prevMessages,
                {
                    "clientId": message.clientId,
                    "timestamp": new Date(message.timestamp * 1000),
                    "text": message.data.text
                }
            ]);
        });     
   
    }

    const toastify = () => {
        toast.success("New member joined!", {
            position: toast.POSITION.TOP_CENTER
        });
    }

    const sendMessage = (inputText) => {
        drone.publish({
            room: 'observable-first-chat',
            message: {
            text: inputText
            }
        });
    }
       
    function recalculateTimeStamp(timestamp) {
        
        const month   = timestamp.getUTCMonth() + 1; // months from 1-12
        const day     = timestamp.getUTCDate();
        const year    = timestamp.getUTCFullYear();
        const hours   = timestamp.getHours();
        const minutes = timestamp.getMinutes();

        const newDate = day + "." + month + "." + year + " " + hours + ":" + minutes;

        return newDate;
    }

    return(
        <div className='main-container'>
          <div className='main-flex-items left'>
              <ToastContainer autoClose={1000}/>
          </div>
          <div className='main-flex-items right'>
            <div className='chat-container'>
                <div className='messages'>
                    <ul>
                        {messages.map(message => 
                            <li key={crypto.randomUUID()} className={message.clientId === myId ? "me" : ""}>
                                <div className="outer">
                                    <div className="text">{message.text}</div>
                                    <div className="date">{recalculateTimeStamp(message.timestamp)}</div>
                                </div>
                            </li>)}  
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


