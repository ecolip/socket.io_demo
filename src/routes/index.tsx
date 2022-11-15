import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserChat1 from '../pages/UserChat1';
import UserChat2 from '../pages/UserChat2';
import GroupUserChat1 from '../pages/GroupUserChat1';
import GroupUserChat2 from '../pages/GroupUserChat2';
import GroupUserChat3 from '../pages/GroupUserChat3';

function RoutesSetting () {
  return ( 
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<UserChat1 />} />
        <Route path='/chat2' element={<UserChat2 />} />
        <Route path='/group1' element={<GroupUserChat1 />} />
        <Route path='/group2' element={<GroupUserChat2 />} />
        <Route path='/group3' element={<GroupUserChat3 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default RoutesSetting;