import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WebChat from '../pages/WebChat';
import WebChat2 from '../pages/WebChat2';

function RoutesSetting () {
  return ( 
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<WebChat />} />
        <Route path='/chat2' element={<WebChat2 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default RoutesSetting;