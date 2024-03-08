import React, { Component, ChangeEvent, MouseEvent } from 'react';
import { isRecord } from './record';

type NewPollProps = {
  onBackClick: () => void;
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

export class NewPoll extends Component<NewPollProps, NewPollState> {
  constructor(props: NewPollProps) {
    super(props);
    this.state = { name: '', time: '10', options: '', error: '' };
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

  doCreateClick = (): void => {
    const name = this.state.name.trim();
    const time = this.state.time.trim();
    const options = this.state.options.trim();

    if (!name.trim() || !time.trim() || !options.trim()) {
      this.setState({ error: 'Please fill in all fields.' });
      return;
    }

    const timeNum = parseInt(time);
    if (isNaN(timeNum) || timeNum <= 0) {
      this.setState({ error: 'Time must be a positive integer.' });
      return;
    }

    const optionsArray = options.split('\n').filter(option => option.trim()).map(option => option.trim());
    if (optionsArray.length < 2) {
      this.setState({ error: 'At least 2 options are required.' });
      return;
    }

    this.doAddClick({ name: name.trim(), time: timeNum, options: optionsArray });
  };

  doAddClick = (pollData: PollData): void => {
    if (!pollData.name || !pollData.time || !pollData.options) {
      this.setState({ error: 'Missing poll data.' });
      return;
    }
  
    const args = { name: pollData.name, time: pollData.time, options: pollData.options };
    fetch("/api/add", {
      method: "POST", body: JSON.stringify(args),
      headers: { "Content-Type": "application/json" }
    })
      .then(this.doAddResp)
      .catch(() => this.doAddError("Failed to connect to the server."));
  };

  doAddResp = (resp: Response): void => {
    if (resp.status === 200) {
      resp.json().then(this.doAddJson)
          .catch(() => this.doAddError("200 response is not JSON"));
    } else if (resp.status === 400) {
      resp.text().then(this.doAddError)
          .catch(() => this.doAddError("400 response is not text"));
    } else {
      this.doAddError(`bad status code from /api/add: ${resp.status}`);
    }
  };

  doAddJson = (data: unknown): void => {
    if (!isRecord(data)) {
      console.error("bad data from /api/add: not a record", data);
      return;
    }

    this.props.onBackClick();  // show the updated list
  };

  doAddError = (msg: string): void => {
    this.setState({error: msg})
  };

  doBackClick = (_: MouseEvent<HTMLButtonElement>): void => {
    this.props.onBackClick();  // tell the parent this was clicked
  };

  render = (): JSX.Element => {
    return (
      <div>
        <h2>New Poll</h2>
        <div>
          <label htmlFor="name">Name:</label>
          <input id="name" type="text" value={this.state.name} onChange={this.doNameChange} />
        </div>
        <div>
          <label htmlFor="time">Time (minutes):</label>
          <input id="time" type="number" min="1" value={this.state.time} onChange={this.doTimeChange} />
        </div>
        <div>
          <label htmlFor="options">Options (one per line, minimum 2 lines):</label>
          <br />
          <textarea id="options" rows={3} value={this.state.options} onChange={this.doOptionsChange}></textarea>
        </div>

        <button type="button" onClick={this.doCreateClick}>Create Poll</button>
        <button type="button" onClick={this.doBackClick}>Back</button>
        {this.renderError()}
      </div>
    );
  }

  renderError = (): JSX.Element | null => {
    if (this.state.error.length === 0) {
      return <div></div>;
    } else {
      const style = {
        color: 'white',
        backgroundColor: 'red',
        padding: '10px',
        borderRadius: '5px',
        marginTop: '15px'
      };
      return (
        <div style={style}>
          <b>Error</b>: {this.state.error}
        </div>
      );
    }
  }
}
