import React, { useState, useRef, useEffect } from 'react';
import './webserver.css';
import { io } from 'socket.io-client';
import api from '../../utils/api';
// const socket = io('https://cowork2.site');
const socket = io('http://localhost:3000');

const jwtToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm92aWRlciI6ImZhY2Vib29rIiwibmFtZSI6IueOi-WntembryIsImVtYWlsIjoid2VuODYwODMxQGdtYWlsLmNvbSIsInBpY3R1cmUiOiJodHRwczovL2dyYXBoLmZhY2Vib29rLmNvbS8zMTExMTU2NDk5MTk4ODM3L3BpY3R1cmU_dHlwZT1sYXJnZSIsImlhdCI6MTY1MzkwNzM3OX0.pgRuhU8zYcHrIylRecNXmPTXo9kiqI35m68WDGt1d6Y';

const emptyStyle = {
  cursor: 'not-allowed',
  backgroundColor: '#ddd',
  color: '#313538',
};

const normalStyle = {
  cursor: 'pointer',
};

type AllMessageType = {
  action?: string,
  msg?: string,
  date?: string,
  time?: string
}
type UnhandledType = {
  timestamp: number,
  email: string,
  username: string,
}

function WebServer() {
  const [room, setRoom] = useState('admin');
  const [msg, setMsg] = useState('');
  const [allMessage, setAllMessage] = useState<AllMessageType[] | []>([]);
  const [unhandled, setUnhandled] = useState<UnhandledType[]| []>([]);
  const msgRef = useRef(null);

  const translateWeekName = (day: number) => {
    switch (day) {
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
  };

  const transferDateToString = (timestamp: any) => {
    const dateObj = new Date(timestamp);
    const month = dateObj.getMonth() + 1;
    const date = dateObj.getDate();
    const day = dateObj.getDay();
    const newDay = translateWeekName(day);
    return `${month}/${date}${newDay}`;
  };

  const transferTimeToString = (timestamp: any) => {
    const dateObj = new Date(timestamp);
    const hour = dateObj.getHours();
    const minute = dateObj.getMinutes();
    return `${hour}:${minute}`;
  };

  const addMessage = (action: string, msg: string, timestamp: any) => {
    const dateString = transferDateToString(timestamp);
    const hourMinute = transferTimeToString(timestamp);
    const newObj: AllMessageType = {};
    newObj.action = action;
    newObj.msg = msg;
    newObj.date = dateString;
    newObj.time = hourMinute;
    setAllMessage(prev => [...prev, newObj]);
  }

  //發送'send_message' event
  const sendMessage = () => {
    // const jwtToken = localStorage.getItem('jwtToken');
    const timestamp = Date.now();
    const trimMessage = msg.trim();
    const data = {
      email: room,
      username: 'admin',
      msg,
      timestamp,
    };
    if (trimMessage !== '') {
      //如果room不是admin就進user房間
      setMsg(trimMessage);
      if (room !== 'admin') {
        api.addMessages(jwtToken, data).then((res) => {
          // console.log(res);
          socket.emit('user_join', room);
          socket.emit('send_message', {
            msg,
            timestamp,
            username: 'admin',
            email: room,
          }); //一對一使用
          addMessage('send', trimMessage, timestamp);
          setMsg('');
          console.log('新增訊息: ', res);
        });
      } else {
        alert('請選擇客戶email!');
      }
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
      );
    });
    return output;
  };

  const renderUnhandled = () => {
    const output = unhandled.map((item) => {
      return (
        <div className='unhandled-item' key={item.timestamp} onClick={()=>{setRoom(item.email)}}>
          <div>{item.email}</div>
          <div>{item.username}</div>
          <div>{`${transferDateToString(item.timestamp)} ${transferTimeToString(
            item.timestamp
          )}`}</div>
        </div>
      );
    });
    return output;
  };

  type GetMessageType = {
    timestamp?: any,
    username? :string,
    action?: string,
    time?: string,
  }

  const fetchHistory = () => {
    api.getMessages(jwtToken, { email: room }).then((res: GetMessageType[]) => {
      console.log(res);
      let newHistory = res.map((item) => {
        let times = transferTimeToString(item.timestamp);
        if (item.username === 'admin') {
          item.action = 'send';
        } else {
          item.action = 'receive';
        }
        item.time = times;
        return item;
      });
      setAllMessage(newHistory);
    });
  };

  useEffect(() => {
    socket.emit('admin_join');
  }, []);

  useEffect(() => {
    //監聽'receive_message' event
    socket.on('receive_message', (data) => {
      setUnhandled((pre) => [...pre, data]);
      addMessage('receive', data.msg, data.timestamp);
    });
  }, [socket]);

  return (
    <React.Fragment>
      <div className='web-server'>
        <div className='unhandled'>
          <h3>待處理訊息</h3>
          {unhandled.length > 0 && renderUnhandled()}
        </div>
        <div>
          <h1>Web Sever 客服</h1>
          <div className='input-room-group'>
            <input
              type='text'
              placeholder='請輸入 user email'
              value={room}
              readOnly
            />
            <button onClick={fetchHistory}>choice room</button>
          </div>
          <div className='chat-room'>
            <div id='chat-message' className='chat-message' ref={msgRef}>
              {allMessage.length > 0 && renderMessage()}
            </div>
            <div className='chat-input-group'>
              <textarea
                placeholder='請輸入訊息'
                value={msg}
                onChange={(e) => {
                  setMsg(e.target.value);
                }}
              ></textarea>
              <button
                onClick={sendMessage}
                style={msg === '' ? emptyStyle : normalStyle}
              >
                submit message
              </button>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default WebServer;
