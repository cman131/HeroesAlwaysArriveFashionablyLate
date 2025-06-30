import React from 'react';
import './role-selector.css';

class RoleSelector extends React.Component {
  constructor(props) {
    super(props)
    this.changeRole = this.changeRole.bind(this)
  }

  changeRole(event) {
    const role = parseInt(event.target.value);
    window.localStorage.role = role;
    this.props.roleChangeHandler(role);
  }

  render() {
    const options = this.props.roles?.map(role => <option key={role.id} value={role.id}>
      {role.name}
    </option>) ?? [];

    return <div className="role-selector">
      <label htmlFor="standard-select">Role:</label>
      <div className="select">
        <select id="standard-select" value={this.props.role} onChange={this.changeRole}>
          <option key={0} value={0}></option>
          {options}
        </select>
      </div>
    </div>;
  }
}

export default RoleSelector;