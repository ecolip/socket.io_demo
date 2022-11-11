import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatRoom from '../pages/ChatRoom';
import WebServer from '../pages/WebServer';

function RoutesSetting () {
  return ( 
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<ChatRoom />} />
        <Route path='/web_service' element={<WebServer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default RoutesSetting;