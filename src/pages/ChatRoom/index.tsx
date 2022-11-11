import React, { useState, useRef, useEffect } from 'react';
import './chatRoom.css';
import { io } from 'socket.io-client';
import api from '../../utils/api';
// const socket = io('https://cowork2.site');
const socket = io('http://localhost:3000');

type MessageType = {
  action?: string,
  msg?: string,
  date?: string,
  time?: string
}

function ChatRoom() {
  const [msg, setMsg] = useState<string>('');
  const [allMessage, setAllMessage] = useState<MessageType[] | []>([]);
  const [openChat, setOpenChat] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [email, setEmail] = useState(null);
  const [username, setUsername] = useState(null);
  const chatMessageRef = useRef(null);

  const translateWeekName = (day: number) => {
    switch(day){
      case 1:
        return '(ㄧ)';
      case 2:
        return '(二)';
      case 3:
        return '(三)';
      case 4:
        return '(四)';
      case 5:
        return '(五)';
      case 6:
        return '(六)'; 
      default:
        return '(日)';
    }
  }

  const transferDateToString = (timestamp: any) => {
    const dateObj = new Date(timestamp);
    const month = dateObj.getMonth()+1;
    const date = dateObj.getDate();
    const day = dateObj.getDay();
    const newDay = translateWeekName(day);
    return `${month}/${date}${newDay}`;
  }

  const transferTimeToString = (timestamp: any) => {
    const dateObj = new Date(timestamp);
    const hour = dateObj.getHours();
    const minute = dateObj.getMinutes();
    return `${hour}:${minute}`;
  }

  const addMessage = (action: string, msg: string, timestamp: any) => {
    const dateString = transferDateToString(timestamp);
    const hourMinute = transferTimeToString(timestamp);
    const newObj: MessageType = {};
    newObj.action = action;
    newObj.msg = msg;
    newObj.date = dateString;
    newObj.time = hourMinute;
    setAllMessage(prev => [...prev, newObj]);
  }

  //發送'send_message' event
  const sendMessage = () => {
    const jwtToken = localStorage.getItem('jwtToken');
    const timestamp = Date.now();
    const trimMessage = msg.trim();
    const data = {
      email,
      username,
      msg,
      timestamp,
    }
    if(trimMessage !== '') {
      setMsg(trimMessage);
      if (!jwtToken) return
      api.addMessages(jwtToken, data).then((res) => {
        socket.emit('send_message', { msg, timestamp, username, email}); //一對一使用
        addMessage('send', trimMessage, timestamp);
        setMsg('');
        setIsEmpty(true);
        // console.log('新增訊息: ', res);
      })
    }
  };

  const renderMessage = () => {
    // console.log(allMessage);
    let output = allMessage.map((item, index) => {
      return (
        <div className={item.action} key={index}>
          {item.action === 'send' && <small>{item.time}</small>}
          <span>{item.msg}</span>
          {item.action === 'receive' && <small>{item.time}</small>}
        </div>
      )
    });
    return output;
  }

  const updateAndCheckTextarea = (msg: string) => {
    const trimValue = msg.trim();
    setMsg(msg);
    if(trimValue){
      setIsEmpty(false);
    }
  }

  const fetchProfile = () => {
    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) return
    api.getProfile(jwtToken).then(res => {
      socket.emit('user_join', res.data);
      setUsername(res.data.name);
      setEmail(res.data.email);
      fetchHistory(jwtToken, res.data.email);
    })
  }

  const fetchHistory = (jwtToken: string, email: string) =>{
    api.getMessages(jwtToken, {email: email}).then(res => {
      let newHistory = res.map((item: any) => {
        let times = transferTimeToString(item.timestamp);
        if(item.username !== 'admin'){
          item.action = 'send';
        }else{
          item.action = 'receive';
        }
        item.time = times;
        return item;
      });
      setAllMessage(newHistory)
    })
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    //監聽'receive_message' event
    socket.on('receive_message', (data: any) => {
      console.log(data, '收到的訊息');
      addMessage('receive', data.msg, data.timestamp);
    });
  }, [socket]);

  return (
    <React.Fragment>
      <div className='chat-room' style={openChat ? {display: 'flex'} : {display: 'none'}}>
        <img className='close-chat-room' src={ require('../../images/close.png') } alt='close' onClick={()=>{setOpenChat(false)}}/>
        <div id='chat-message' className='chat-message' ref={chatMessageRef}>
          <div className='waypoint'></div>
          {allMessage.length >0 && renderMessage()}
        </div>
        <div className='chat-input-group'>
          <textarea placeholder='請輸入訊息' value={msg} onChange={(e) => {updateAndCheckTextarea(e.target.value)}}>
          </textarea>
          <img className='send-message' src={isEmpty ? require('../../images/send_unable.png') : require('../../images/send_enable.png')}
            style={isEmpty ? {cursor: 'not-allowed'} : {cursor: 'pointer'}}
            alt='send' onClick={sendMessage}
          />
        </div>
      </div>
      <div className='chat-room-icon-group' style={!openChat ? {display:'flex'} : {display: 'none'}}
        onClick={()=>{setOpenChat(true)}}
      >
        <img src={ require('../../images/chat.png') } alt='chat' />
        <span>數位客服</span>
      </div>
    </React.Fragment>
  );
}

export default ChatRoom;