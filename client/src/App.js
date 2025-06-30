import './App.css';
import { useEffect, useState } from 'react';
import Calendar from './calendar';
import RoleSelector from './role-selector';

function getInitialRole() {
  if (!window.localStorage.role) {
    return 0;
  }
  const role = parseInt(window.localStorage.role);
  if (!role) {
    return 0;
  }

  return role;
}
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function App() {
  const [schedule, setSchedule] = useState({});
  const [currentRole, setRole] = useState(getInitialRole());
  const [roles, setRoles] = useState([]);

  const handleDateSelectionChange = async (date, isAdd) => {
    if (!date || !currentRole) {
      console.error('No role selected.');
      return;
    }

    const dataToSend = { date: date, id: currentRole }; // Data to send
    await fetch(`${API_BASE_URL}/api/schedule`, {
      method: isAdd ? 'POST' : 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    })
    .then(res => res.json())
    .then(data => setSchedule(data))
    .catch(err => console.error(err));
  };

  useEffect(() => {
      fetch(`${API_BASE_URL}/api/schedule`)
        .then(res => res.json())
        .then(data => setSchedule(data))
        .catch(err => console.error(err));
      fetch(`${API_BASE_URL}/api/roles`)
        .then(res => res.json())
        .then(data => setRoles(data.roles))
        .catch(err => console.error(err));
  }, []);

  return (
      <div className="app-container">
        <RoleSelector role={currentRole} roles={roles} roleChangeHandler={setRole}></RoleSelector>
        <Calendar schedule={schedule} role={currentRole} dateSelectionHandler={handleDateSelectionChange}></Calendar>
      </div>
  );
}

export default App;
