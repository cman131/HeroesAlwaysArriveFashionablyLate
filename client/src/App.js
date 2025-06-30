import './App.css';
import React, { useEffect, useState } from 'react';
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
    await fetch('/api/schedule', {
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
      fetch('/api/schedule')
        .then(res => res.json())
        .then(data => setSchedule(data))
        .catch(err => console.error(err));
      fetch('/api/roles')
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
