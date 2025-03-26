import React from 'react'
import { useState } from 'react';
import toast from "react-hot-toast";
import {createRoomApi, joinChatApi } from '../services/RoomService';
import useChatContext  from '../context/ChatContext.jsx';


import chatIcon from '../assets/chat.png'
import { useNavigate } from 'react-router';

const JoinCreateChat = () => {

const[detail,setDetail] = useState({
  roomId: '',
  userName: ''
})

const {roomId,userName,connected,setRoomId,setCurrentUser,setConnected} = useChatContext();
const navigate =  useNavigate()
function handleFormInputChange(event){
  setDetail({
    ...detail,
    [event.target.name]:event.target.value,
  })

}

function validateForm(){
  if (detail.roomId === '' || detail.userName === ''){
    toast.error('Please fill all the fields')
    return false;
  }
  return true;
}

async function joinChat(){
     if (validateForm()){
      // join room
   try{
    const room = await joinChatApi(detail.roomId)
    toast.success("Room Joined Successfully")
    setCurrentUser(detail.userName)
    setRoomId(room.roomId)
    setConnected(true)

     // forward to chat page
    navigate('/chat')

   }
   catch(error){
    if (error.status==400)
      toast.error(error.response.data)
    else 
    console.log("Error in joining room")
    console.log(error)

   }

    
}
}

async function createRoom(){
  if (validateForm()){
    // create room
    console.log(detail)
    // call api to create room on backend
      try{
        const response = await createRoomApi(detail.roomId)
        console.log(response);
        toast.success("Room Created Successfully")
        setCurrentUser(detail.userName)
        setRoomId(response.roomId)
        setConnected(true)

         // forward to chat page
        navigate('/chat')




       
      }
      catch(error){
        console.log(error);
        if (error.status==400)
          toast.error("Room already exists")
        else 
        console.log("Error in creating room")
        
      }
  }
  
}

  return (
    <div className="min-h-screen flex items-center justify-center">

      
      <div className='p-10 dark:border-gray-700 w-full flex flex-col gap-5 max-w-md rounded dark:bg-gray-900 shadow '>
        <div>
         <img src={chatIcon} alt='chat icon' className='w-20 h-20 mx-auto' /> 
        </div>
      <h1 className='text-2xl font-semibold text-center mb6'> Join Room / Create Room  </h1> 
      {/* name div */}
      <div className="">
        <label htmlFor="name" className='block font-medium mb-2'>Your Name</label>
        <input onChange={handleFormInputChange} value={detail.userName}  type='text' id='name' name='userName' placeholder='Enter Your Name' className='w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500'/>

      </div>
      {/* room id div */}
      <div className="">
        <label htmlFor="name" className='block font-medium mb-2'>Room Id / New Room Id</label>
        <input name='roomId' onChange={handleFormInputChange} value={detail.roomId} placeholder='Enter roomId' type='text' id='name' className='w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500'/>

      </div>

      {/* button  */}

      <div className='flex justify-between gap-8 mt-4'>
        <button onClick={joinChat} className='px-3 py-2 dark:bg-blue-500 hover:dark:bg-blue-800 rounded-full'>Join Room</button>
        <button onClick={createRoom} className='px-3 py-2 dark:bg-yellow-500 hover:dark:bg-yellow-800 rounded-full'>Create Room</button>
      </div>

      </div>


    </div>
  )
}


export default JoinCreateChat