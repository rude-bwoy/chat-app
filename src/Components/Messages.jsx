import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Avatar from "boring-avatars";
// import ParticlesBg from 'particles-bg'


let drone = null;

export default function Messages() {

    const [messages, setMessages] = useState([]);
    const [myId, setMyId] = useState(null);
    const [myName, setMyName] = useState("");

    useEffect(() => {

        if(drone === null) {
            connectToScaledrone();
        }

    }, []);

    function connectToScaledrone() {

        drone = new window.Scaledrone(process.env.REACT_APP_CHANNEL_ID);
        const room = drone.subscribe('observable-first-chat');

        const fetchApi = async () => {
            const response = await fetch("https://api.learn.skuflic.com/users/" + `${Math.floor(Math.random() * 100) + 1}`);
            if (!response.ok) {
                console.error(`Error: ${response.status} - ${response.statusText}`);
                return;
              }
            const data = await response.json();
            setMyName(data.name);
        }
        
        fetchApi();

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
                    "messageId": message.id,
                    "timestamp": new Date(message.timestamp * 1000),
                    "text": message.data.text,
                    "username": message.data.username
                }
            ]);
        });     
    }

    const scrollDown = () => {
        const ul = document.querySelector("ul");
        const listItems = ul.querySelectorAll("li");
        const lastListItem = listItems[listItems.length - 1];
        if(lastListItem) {
            lastListItem.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }


    const toastify = () => {
        toast.success(`New member joined!`, {
            position: toast.POSITION.TOP_CENTER
        });
    }

    const sendMessage = (inputText) => {
        drone.publish({
            room: 'observable-first-chat',
            message: {
            text: inputText,
            username: myName
            }
        });
    }
       
    function recalculateTimeStamp(timestamp) {
        const month   = timestamp.getUTCMonth() + 1;
        const day     = timestamp.getUTCDate();
        const year    = timestamp.getUTCFullYear();
        const hours   = timestamp.getHours();
        const minutes = timestamp.getMinutes();

        const newDate = day + "." + month + "." + year + " " + hours + ":" + minutes;
        return newDate;
    }

    return(
        <div className='main-container'>
              <ToastContainer autoClose={1000}/>
              {/* <ParticlesBg   
                            num={20} 
                            type="circle" 
                            bg={{
                                position: "absolute",
                                zIndex: 0,
                                top: 0,
                                left: 0
                            }} 
                            color={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
            /> */}
          <div className='main-flex-items right'>
            <div className='chat-container'>
                <div className='messages'>
                    <ul>
                        {messages.map(message => 
                            <li key={message.messageId} data-messageid={message.messageId} className={message.clientId === myId ? "me" : ""}>
                                        <div className="message-content">
                                            <div className="avatar"><Avatar size={40} name={message.username} variant="beam" colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}/></div>
                                            <div className={message.clientId === myId ? "outer messss" : "outer"}>
                                                {message.clientId !== myId && 
                                                <div className="username">{message.username}</div>} 
                                                <div className="text">{message.text}</div>
                                                <div className="date">{recalculateTimeStamp(message.timestamp)}</div>
                                            </div>
                                        </div>
                                        {scrollDown()}
                            </li>)}  
                    </ul>
                </div>
            </div>
          </div>
          <Input sendMessage={sendMessage}/>
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

