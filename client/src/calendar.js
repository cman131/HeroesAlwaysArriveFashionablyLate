import React from 'react';
import './calendar.css';

function addDay(date) {
    var newDate = new Date(date.valueOf());
    newDate.setDate(newDate.getDate() + 1);
    return newDate;
}

class Calendar extends React.Component {
  today = new Date();

  constructor(props) {
    super(props)
    this.state = { currentMonth: this.today.getMonth() + 1, currentYear: this.today.getFullYear() };
    this.backMonth = this.backMonth.bind(this)
    this.forwardMonth = this.forwardMonth.bind(this)
    this.getCurrentCalendarRows = this.getCurrentCalendarRows.bind(this)
  }

  backMonth() {
    const month = this.state.currentMonth;
    const year = this.state.currentYear;
    if (month - 1 < 1 && year > this.today.getFullYear()) {
      this.setState({ currentMonth: 12, currentYear: year - 1 })
    } else if (month - 1 >= 1) {
      this.setState({ currentMonth: month - 1, currentYear: year })
    }
  }
  forwardMonth() {
    const month = this.state.currentMonth;
    const year = this.state.currentYear;
    if (month + 1 > 12) {
      this.setState({ currentMonth: 1, currentYear: year + 1 })
    } else {
      this.setState({ currentMonth: month + 1, currentYear: year })
    }
  }
  getCurrentCalendarRows(currentDate) {
    const schedule = this.props.schedule;
    const firstDay = currentDate.getDay();

    const dateRows = [];
    for (let row = 0; row < 6; row++) {
      const children = [];
      for (let col = 1; col < 8; col++) {
        const blockId = row * 7 + col;

        let blockDate = undefined;
        if (blockId > firstDay && currentDate.getMonth() === this.state.currentMonth - 1) {
          // Only mark actual dates for this month
          blockDate = {
            date: currentDate,
            blockId: blockId,
            schedule: schedule[currentDate.toDateString()]
          };
          currentDate = addDay(currentDate);
        } else if (blockId > firstDay && col === 1) {
          // Don't add a blank bottom row
          return dateRows;
        }
        children.push(<DateBlock key={blockId} date={blockDate} roleId={this.props.role} dateSelectionHandler={this.props.dateSelectionHandler}></DateBlock>);
      }
      dateRows.push(<div key={'row' + row} className="date-row">{children}</div>);
    }
    return dateRows;
  }
  render() {
    let currentDate = new Date(this.state.currentYear, this.state.currentMonth - 1, 1);
    const dateRows = this.getCurrentCalendarRows(currentDate);

    const rightDisabled = this.state.currentYear > this.today.getFullYear() + 1;
    const leftDisabled = this.state.currentMonth - 2 < this.today.getMonth() && this.state.currentYear === this.today.getFullYear();

    return <div className="container">
      <div className="month-nav">
        <button disabled={leftDisabled} className="month-nav-button left" onClick={this.backMonth}>&lsaquo;</button>
        <h1 className="month-nav-display">{currentDate.toLocaleString('default', { month: 'long' })} {this.state.currentYear}</h1>
        <button disabled={rightDisabled} className="month-nav-button right" onClick={this.forwardMonth}>&rsaquo;</button>
      </div>
      <div className="day-nav">
        <h3>Sun</h3>
        <h3>Mon</h3>
        <h3>Tue</h3>
        <h3>Wed</h3>
        <h3>Thu</h3>
        <h3>Fri</h3>
        <h3>Sat</h3>
      </div>
      <div className="dates">
        {dateRows}
      </div>
    </div>;
  }
}

export class DateBlock extends React.Component {
  constructor(props) {
    super(props)
    this.selectionHandler = this.selectionHandler.bind(this)
  }
  selectionHandler() {
    const isSelected = this.props.date?.schedule?.roles.includes(this.props.roleId) ?? false;
    this.props.dateSelectionHandler(this.props.date?.date, !isSelected);
  }
  render() {
    const date = this.props.date;
    const isSelected = date?.schedule?.roles.includes(this.props.roleId) ?? false;

    let sceneInfo = [];
    if (date?.schedule?.sceneCount > 0) {
      sceneInfo.push(<span>{date?.schedule.sceneCount} scenes possible</span>);
    }

    let checkmark = [];
    if (isSelected) {
      checkmark.push(<span key={'checkmark' + date.blockId} className="checkmark"></span>);
    }

    let title = 'Mark as available';
    if (isSelected) {
      title = 'Remove availability'
    }
    const disabled = !date || this.props.roleId < 1;

    return <button className={'date-block' + (isSelected ? ' selected' : '')} title={disabled ? undefined : title} disabled={disabled} onClick={this.selectionHandler}>
      <span>{date?.date.getDate() ?? ''}</span>
      <div className="info-box">
        {sceneInfo}
      </div>
      {checkmark}
    </button>;
  }
}

export default Calendar;