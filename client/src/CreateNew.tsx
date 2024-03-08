import React, { Component, ChangeEvent, MouseEvent } from 'react';

type NewPollProps = {
  onBackClick: () => void;
  onCreatePoll: (pollData: PollData) => void;
};

type PollData = {
  name: string;
  time: number;
  options: string[];
};

type NewPollState = {
  name: string;
  time: string;
  options: string;
  error: string;
};

// comments
export class NewPoll extends Component<NewPollProps, NewPollState> {
  constructor(props: NewPollProps) {
    super(props);
    this.state = { name: '', time: '10', options: '', error: '' };
  }

  render = (): JSX.Element => {
    return (
      <div>
        <h2>New Poll</h2>
        <div>
          <label htmlFor="name">Name:</label>
          <input id="name" type="text" value={this.state.name} onChange={this.handleNameChange} />
        </div>
        <div>
          <label htmlFor="time">Time (minutes):</label>
          <input id="time" type="number" min="1" value={this.state.time} onChange={this.handleTimeChange} />
        </div>
        <div>
          <label htmlFor="options">Options (one per line, minimum 2 lines):</label>
          <br />
          <textarea id="options" rows={3} value={this.state.options} onChange={this.handleOptionsChange}></textarea>
        </div>

        <button type="button" onClick={this.doCreatePoll}>Create Poll</button>
        <button type="button" onClick={this.props.onBackClick}>Back</button>
        {this.renderError}
      </div>
    );
  }

  renderError = (): JSX.Element | null => {
    const error = this.state.error;
    if (!error) {
      return null;
    }
  
    return (
      <div style={{ color: 'red' }}>
        {error}
      </div>
    );
  }

  doNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ name: event.target.value, error: '' });
  };

  doTimeChange = (event: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ time: event.target.value, error: '' });
  };

  doOptionsChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    this.setState({ options: event.target.value, error: '' });
  };

  doCreatingPoll = (): void => {
    const { name, time, options } = this.state;

    if (!name.trim() || !time.trim() || !options.trim()) {
      this.setState({ error: 'Please fill in all fields.' });
      return;
    }

    const timeNum = parseInt(time);
    if (isNaN(timeNum) || timeNum <= 0) {
      this.setState({ error: 'Time must be a positive integer.' });
      return;
    }

    const optionsArray = options.trim().split('\n').map(option => option.trim());
    if (optionsArray.length < 2) {
      this.setState({ error: 'At least 2 options are required.' });
      return;
    }

    const pollData: PollData = {
      name: name.trim(),
      time: timeNum,
      options: optionsArray,
    };

    this.props.onCreatePoll(pollData);
  };
}
