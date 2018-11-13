import React from 'react';
import './App.scss';
// import Select from './components/Select';
import Select from './components/HooksSelect';

const options = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
].map(m => ({ name: m, value: m }))

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
          labelText="Pick a month"
          value={this.state.value}
          options={options}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

export default App;
