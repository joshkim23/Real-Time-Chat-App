import React, { useState, useEffect } from "react";
import queryString from 'query-string';
import io from 'socket.io-client'; //used to communicate with the backend! 
import "./Chat.css";
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import Messages from '../Messages/Messages';


let socket;

const Chat = ({location}) => {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState(''); //state for new messages.
    const [messages, setMessages] = useState([]); // keep track of all messages using state. gonna have a state called messages that stores an array with ALL messages. 
    const ENDPOINT = 'https://react-chat-app-joshkim.herokuapp.com/';
    //const ENDPOINT = 'https://localhost:5000' for testing!! 

    //happens once you get the first connection. ONLY happens if endpoint or lcoation.search changes. 
    useEffect(() => {
        const { name, room } = queryString.parse(location.search); //location is from react-router and it gives a prop called location, which is a url. getting data from query string
        console.log(location.search);
        setName(name.trim().toLowerCase());
        setRoom(room.trim().toLowerCase());

        //from the front end, we can emit different events using this specific instance of a socket. do this using socket.emit which is a socket method that takes a string that the backend will recognize! Then something on the backend will happen once it recognizes this emitted event. You can also pass in data like an object or a function that can be received by the backend. 
        socket = io(ENDPOINT);  //specific instance of a socket. 
        socket.emit('join', { name, room }, (error) => {
            if(error) {
                alert(error);
            }
        }) // same as {name: name, room: room}

        // what is this?
        return () => {
            socket.emit('disconnect');
            socket.off();
        }

    }, [ENDPOINT, location.search]); //if the array is present, the effect only occurs (rerender) if the values in the array change.

    //Handles all the messages in the chat. grabs socket emit from backend with the username and the text that was captured from the input. the input from the front end is passed to the backend through sendMessage, then io.to(user.room).emit('message') communicates the user and text to this function. 
    useEffect(() => {
        // this comes from the back end emit 
        socket.on('message', (message) => {
            setMessages([...messages, message]); //adds every new message sent by admin, or by anyone else to the array!
        })
    }, [messages]); //only runs when messages array changes. 

    //function for sending messages
    const sendMessage = event => {
        event.preventDefault();
        event.target.value = '';

        if(message) {
            // setMessages([...messages, {user: name, text: message}]); //NO NEED TO DO THIS. the socket emits the data to the backend, the backend emits that back to the front end useEffect that sets the Messages state that re renders it. Need to do this to grab the user that sent the message!! So then the front end can re render the page with the right username and the input text. the users are stored in the backend. 
            socket.emit('sendMessage', message, () => setMessage('')); 
        }

    }

    console.log(message, messages);

    return (
        <div className = "outerContainer">
            <div className = "container">
                <InfoBar room = {room}/>
                <Messages messages = {messages} name = {name} />
                <Input message = {message} setMessage = {setMessage} sendMessage = {sendMessage}/>
            </div>
        </div>
    )
}

export default Chat;