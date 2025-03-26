import React, { useState, useRef,useEffect } from 'react';
import { MdSend , MdAttachFile} from "react-icons/md";
import useChatContext from '../context/ChatContext';
import { useNavigate } from 'react-router';
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { baseURL } from '../config/AxiosHelper';

import toast from 'react-hot-toast';
import { getMessages } from "../services/RoomService";
import { timeAgo } from '../config/helper';










const ChatPage = () => {
  const{roomId,currentUser,connected,setConnected,setRoomId,setCurrentUser}=useChatContext();
  const navigate = useNavigate();
  useEffect(()=>{if (!connected) navigate('/')},[connected,roomId,currentUser])    

// we have to load msg first from database
// then we have to connect to the socket
// then we have to send the message to the socket
// then we have to receive the message from the socket
// then we have to update the message in the database
// then we have to update the message in the UI
// then we have to scroll to the bottom of the chat box

// we have to initialize stomp client
  

  
  const [messages, setMessages] = useState([]);
const [input,setInput] = useState('');


const inputRef = useRef(null)
const chatBoxRef = useRef(null)
const[stompClient,setStompClient] = useState(null)

// const[roomId,setRoomId] = useState('')
// const[currentUser] = useState('Vishal Jain')


useEffect(()=>{
  async function loadMessage(){
    try{
       const messages =await getMessages(roomId);
      //  console.log(messages)
       setMessages(messages)

    }
    catch(error){
      console.log(error)
    }
  }
  if (connected)
  {
    loadMessage();
  }
},[])

// scroll down mesgs
useEffect(()=>{
  if (chatBoxRef.current){
     chatBoxRef.current.scroll({
      top:chatBoxRef.current.scrollHeight,
      behavior:'smooth'
     })
  }
},[messages])



useEffect(()=>{
  const connectWebSocket = () =>{
    // sock js
    const sock = new SockJS(`${baseURL}/chat`);
    const client = Stomp.over(sock)

    client.connect({},()=>{
      setStompClient(client)
      toast.success("Connected")
      client.subscribe(`/topic/room/${roomId}`,(message)=>{
        console.log(message)
        const newMessage = JSON.parse(message.body)
        setMessages((prev)=>[...prev,newMessage])
        // rest of work after success recieving messages 
      })
    })



  }
  // connect only when we are coming from login page
  if (connected)
  {
    connectWebSocket();
  }

 },[roomId])

 // send message handle
 const sendMessage = async()=>{
  if (stompClient && connected && input.trim())
  {
    console.log(input);

    const message = {
      sender:currentUser,
      content:input,
      roomId:roomId
    }

    stompClient.send(`/app/sendMessage/${roomId}`,{},JSON.stringify(message))
    setInput('') 
  }

 }

 function handleLogout(){
   stompClient.disconnect()
   setConnected(false)
   setRoomId('')
   setCurrentUser('')
   navigate('/')
 }

  return (
    <div className=''>
      {/* This is a header */}
      <header className=' dark:border-gray-700 h-20 fixed w-full dark:bg-gray-900 py-5  shadow  flex justify-around items-center'>
        {/* room name container */}
        <div>
          <h1 className='text-xl font-semibold'>
              Room : <span>{roomId}</span>
          </h1>

        </div>
        {/* username container */}
        <div>
        <h1 className='text-xl font-semibold'>
              User : <span>{currentUser}</span>
          </h1>

        </div>
        {/* buttone leave room */}
        <div>
        <button onClick={handleLogout} className='dark:bg-red-500 dark:hover:bg-red-700 px-3 py-2 rounded-full'>Leave Room</button>

        </div>
      </header>

      {/* Chat Container */}
      <main ref={chatBoxRef} className='px-10 py-20 w-2/3 dark:bg-slate-600 mx-auto h-screen overflow-auto'>
      {
        messages.map((message,index)=>(
         <div key={index} className=  {`flex ${message.sender===currentUser? "justify-end" : "justify-start"}`} >
           <div  className={`my-2 ${message.sender===currentUser ? 'bg-indigo-700':'bg-cyan-500'} p-2 max-w-xs rounded-full `}>

                  <div className='flex flex-row gap-2'>
                       <img className='h-10 w-10' src={'https://avatar.iran.liara.run/public/48'} alt=''/>
 
                               <div className=' flex flex-col gap-1'>
                                 <p className='text-sm font-bold'>{message.sender}</p>
                                 <p>{message.content}</p> 
                                 <p className='text-xs text-orange-400'>{timeAgo(message.timeStamp)}</p>

</div> 

</div>
</div>
         </div>
        ))
      }
      </main>
        
   

       



      {/* Input Message */}
      <div className='border fixed bottom-4 w-full h-16'>
           <div className='h-full pr-10 gap-4  flex items-center justify-between rounded-full w-1/2 mx-auto dark:bg-gray-900'>
           <input value={input} onChange={(e)=>{setInput(e.target.value)}} 
           // for enter key
            onKeyDown={(e)=>{if (e.key==='Enter') sendMessage()}} 
           type='text' placeholder='Type Your Message Here..... ' className='dark:border-gray-600 w-full dark:bg-gray-800 px-5 py-2 rounded-full  h-full focus:outline-none'/>
          <div className='flex gap-4'>
          <button className='dark:bg-purple-600 h-10 w-10 flex justify-center items-center rounded-full'><MdAttachFile size={20}/></button>
          <button onClick={sendMessage} className='dark:bg-green-600 h-10 w-10 flex justify-center items-center rounded-full'><MdSend size={20}/></button>
          </div>

            </div>
      </div>
    </div>
  )
}

export default ChatPage