import React from 'react';
import changeLogData from './changeLogData';

class ChangeLog extends React.Component {
  constructor() {
    super();
    this.state = {
    };
  }

  renderItems() {
    let _items = [];
    
    for (let i = 0; i < changeLogData.length; i++) {
      let _itemsChanges = [];
  
      for (let j = 0; j < changeLogData[i].changes.length; j++) {
        _itemsChanges.push(
          <li key={ `change-log-items-${i}-${j}` }>
          { changeLogData[i].changes[j] }
          </li>
        );
      }
  
      _items.push(
        <div
          key={ `change-log-items-${i}` }
          className="item padding-bottom-15">
          <h4>v{ changeLogData[i].version }</h4>
          <ul>{ _itemsChanges }</ul>
        </div>
      );
    }
  
    return _items;
  }

  render() {
    return (
      <section className="change-log">
        <h3>Change log</h3>
        { this.renderItems() }
      </section>
    );
  }
}

export default ChangeLog;