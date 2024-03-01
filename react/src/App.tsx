import React from 'react';
import { flushSync } from 'react-dom';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0
    };
  }

  componentDidMount() {
    flushSync(() => this.setState({ value: this.state.value + 1 }));
    console.log(this.state.value); // 0
    flushSync(() => this.setState({ value: this.state.value + 1 }));
    console.log(this.state.value); // 0
  }

  render() {
    console.log('更新'); // 执行两次
    return <div>{this.state.value}</div>; // 1
  }
}

export default App;
