import React from 'react';
import './App.scss';
import Select from './components/Select';

const options = [
  { name: 'January', value: 'January' },
  { name: 'February', value: 'February' },
  { name: 'March', value: 'March' },
  { name: 'April', value: 'April' },
  { name: 'May', value: 'May' },
  { name: 'June', value: 'June' },
  { name: 'July', value: 'July' },
  { name: 'August', value: 'August' },
  { name: 'September', value: 'September' },
  { name: 'October', value: 'October' },
  { name: 'November', value: 'November' },
  { name: 'December', value: 'December' },
];

class App extends React.Component {
  state = { value: 'January' }

  onChange = (e) => {
    this.setState({ value: e.target.value })
  }

  render() {
    return (
      <div className="App">
        <Select
          name="testSelect"
          labelText="Select a month"
          value={this.state.value}
          options={options}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

export default App;
