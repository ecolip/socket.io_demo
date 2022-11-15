import React, { useState, useRef, useEffect } from 'react';
import './style.css';
import { io } from 'socket.io-client';
const socket = io('http://localhost:5500');

const jwtToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm92aWRlciI6ImZhY2Vib29rIiwibmFtZSI6IueOi-WntembryIsImVtYWlsIjoid2VuODYwODMxQGdtYWlsLmNvbSIsInBpY3R1cmUiOiJodHRwczovL2dyYXBoLmZhY2Vib29rLmNvbS8zMTExMTU2NDk5MTk4ODM3L3BpY3R1cmU_dHlwZT1sYXJnZSIsImlhdCI6MTY1MzkwNzM3OX0.pgRuhU8zYcHrIylRecNXmPTXo9kiqI35m68WDGt1d6Y';
const DefaultUnhandled = [
  {
    group: 'bicycleA',
    uuid: 'bicycleA',
  },
  {
    group: 'bicycleB',
    uuid: 'bicycleB',
  },
  {
    group: 'bicycleC',
    uuid: 'bicycleC',
  },
]
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
type GroupsType = {
  group: string,
  uuid: string,
}

function WebServer() {
  const [msg, setMsg] = useState<string>('');
  const [allMessage, setAllMessage] = useState<AllMessageType[] | []>([]);
  const [groups, setGroups] = useState<GroupsType[]| []>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupsType | null>(null);
  const msgRef = useRef<HTMLDivElement | null>(null);
  const myEmail = useRef<string>('');

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
    const timestamp = Date.now();
    const trimMessage = msg.trim();
    if (trimMessage !== '' && selectedGroup) {
      setMsg(trimMessage);
      socket.emit('group_send_message', {
        msg,
        timestamp,
        email: myEmail.current,
        group: selectedGroup.uuid,
        uuid: selectedGroup.uuid,
      });
      addMessage('send', trimMessage, timestamp);
      setMsg('');
    }else {
      alert('請選擇group!')
    }
  };

  const renderMessage = () => {
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

  const selectGroup = (item: GroupsType) => {
    setSelectedGroup(item);
    socket.emit('group_join', item.uuid);
    setAllMessage([]);
  };

  const renderGroups = () => {
    const output = groups.map((item) => {
      return (
        <div className='unhandled-item' key={item.uuid} onClick={()=>{selectGroup(item)}}>
          <div>{item.group}</div>
        </div>
      );
    });
    return output;
  };

  useEffect(() => {
    myEmail.current = 'rose@gmail.com';
    setGroups(DefaultUnhandled);
  }, []);

  useEffect(() => {
    //監聽'receive_message' event
    socket.on('group_receive_message', (data) => {
      if (data.email !== myEmail.current) {
        console.log(data);
        addMessage('receive', data.msg, data.timestamp);
      }
    });
    return () => {
      socket.off('group_receive_message');
    }
  }, []);

  return (
    <React.Fragment>
      <div className='web-server'>
        <div className='unhandled'>
          <h3>{myEmail.current}<br/>參加的所有group</h3>
          {groups.length > 0 && renderGroups()}
        </div>
        <div>
          <h1>Web chat group {selectedGroup?.group}</h1>
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
              />
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
