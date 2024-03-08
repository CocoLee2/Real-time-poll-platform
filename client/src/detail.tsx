import React, { Component, ChangeEvent, MouseEvent } from 'react';
import { Poll, parsePoll } from './poll';
import { isRecord } from './record';

type DetailsProps = {
  name: string,
  onBackClick: () => void,
};

type DetailsState = {
  now: number,
  poll: Poll | undefined,
  voterName: string,
  options: string,
  selected: string,
  recordedVoteMessage: string,
  error: string
};

export class PollDetails extends Component<DetailsProps, DetailsState> {

  constructor(props: DetailsProps) {
    super(props);
    this.state = {now: Date.now(), poll: undefined, voterName: "", options: "", selected: "", recordedVoteMessage: "", error: ""};
  }

  componentDidMount = (): void => {
    this.doRefreshClick(); 
  };

  render = (): JSX.Element => {
    if (this.state.poll === undefined) {
      return <p>Loading poll "{this.props.name}"...</p>
    } else {
      if (this.state.poll.endTime <= this.state.now) {
        return this.renderCompleted(this.state.poll);
      } else {
        return this.renderOngoing(this.state.poll);
      }
    }
  };

  renderCompleted = (poll: Poll): JSX.Element => {
    const min = Math.abs(Math.round((this.state.now - poll.endTime) / 60 / 1000));
    const resultInArray = poll.result.split(",");
    let total = 0;
    
    const resultInMap = new Map<string, number>();
    resultInArray.forEach((el, index) => {
      if (index != 0) {
        const temp = resultInMap.get(el);
        resultInMap.set(el, temp ? temp + 1 : 1)
        total += 1
      }
    })

    return (
      <div>
        <h2>{poll.name}</h2>
        <p>Closed {min} minutes ago</p>
      <ul>
      {[...resultInMap.keys()].map(key => {
        const temp = Number(resultInMap.get(key)) 
        return <li>{temp/total*100}% - {key}</li>
      })}
      </ul>
      <button type="button" onClick={this.doRefreshClick}>Refresh</button>
      <button type="button" onClick={this.doBackClick}>Back</button>
      </div>);
  };

  renderOngoing = (poll: Poll): JSX.Element => {
    const min = Math.round((poll.endTime - this.state.now) / 60 / 100) / 10;
    return (
      <div>
        <h2>{poll.name}</h2>
        <p><i>Closes in {min} minutes...</i></p>
        <ul>
          {poll.options.split('\n').map((option, index) => (
            <li key={index}>
              <input
                type="radio"
                id={`item-${index}`}
                name="item"
                value={option}
                checked={this.state.selected === option}
                onChange={() => this.setState({selected: option})} 
              />
              <label htmlFor={`item-${index}`}>{option}</label>
            </li>
          ))}
        </ul>

        <div>
          <label htmlFor="voterName">Voter Name:</label>
          <input type="text" id="voterName" value={this.state.voterName} 
              onChange={this.doVoterNameChange}></input>
        </div>
        <button type="button" onClick={this.doVoteClick}>Vote</button>
        <button type="button" onClick={this.doRefreshClick}>Refresh</button>
        <button type="button" onClick={this.doBackClick}>Back</button>
        {this.renderRecordedVoteMessage()}
        {this.renderError()}
      </div>);
  };

  renderRecordedVoteMessage = (): JSX.Element => {
    if (this.state.recordedVoteMessage.length === 0) {
      return <div></div>;
    } else {
      return (
      <div>
        <br/>
        {this.state.recordedVoteMessage}
      </div>);
    }
  };

  renderError = (): JSX.Element => {
    if (this.state.error.length === 0) {
      return <div></div>;
    } else {
      const style = {width: '300px', backgroundColor: 'rgb(246,194,192)',
          border: '1px solid rgb(137,66,61)', borderRadius: '5px', padding: '5px' };
      return (<div style={{marginTop: '15px'}}>
          <span style={style}><b>Error</b>: {this.state.error}</span>
        </div>);
    }
  };

  doRefreshClick = (): void => {
    const args = {name: this.props.name};
    fetch("/api/get-result", {
        method: "POST", body: JSON.stringify(args),
        headers: {"Content-Type": "application/json"} })
      .then(this.doGetResp)
      .catch(() => this.doGetError("failed to connect to server"));
  };

  doGetResp = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.doGetJson)
          .catch(() => this.doGetError("200 res is not JSON"));
    } else if (res.status === 400) {
      res.text().then(this.doGetError)
          .catch(() => this.doGetError("400 response is not text"));
    } else {
      this.doGetError(`bad status code from /api/refersh: ${res.status}`);
    }
  };

  doGetJson = (data: unknown): void => {
    if (!isRecord(data)) {
      console.error("bad data from /api/refresh: not a record", data);
      return;
    }

    this.doPollChange(data);
  }

  doPollChange = (data: {poll?: unknown}): void => {
    const poll = parsePoll(data.poll);
    if (poll !== undefined) {
        this.setState({poll, now: Date.now(), error: ""});
    } else {
      console.error("poll from /api/fresh did not parse", data.poll)
    }
  };

  doGetError = (msg: string): void => {
    console.error(`Error fetching /api/refresh: ${msg}`);
  };

  doVoterNameChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({voterName: evt.target.value, error: ""});
  };

  doVoteClick = (_: MouseEvent<HTMLButtonElement>): void => {
    if (this.state.poll === undefined)
      throw new Error("impossible");

    if (this.state.voterName.trim().length === 0) {
      this.setState({error: "a required field is missing."});
      return;
    }

    const args = {name: this.props.name, selected: this.state.selected, voterName: this.state.voterName};
    const recordedVoteMessage = `Recorded vote of "${args.voterName}" as "${args.selected}"`;
    this.setState({ recordedVoteMessage, error: "" });
    fetch("/api/vote", {
        method: "POST", body: JSON.stringify(args),
        headers: {"Content-Type": "application/json"} })
      .then(this.doVoteResp)
      .catch(() => this.doVoteError("failed to connect to server"));
  };

  doVoteResp = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.doVoteJson)
          .catch(() => this.doVoteError("200 response is not JSON"));
    } else if (res.status === 400) {
      res.text().then(this.doVoteError)
          .catch(() => this.doVoteError("400 response is not text"));
    } else {
      this.doVoteError(`bad status code from /api/bid: ${res.status}`);
    }
  };

  doVoteJson = (data: unknown): void => {
    if (this.state.poll === undefined)
      throw new Error("impossible");

    if (!isRecord(data)) {
      console.error("bad data from /api/bid: not a record", data);
      return;
    }

    this.doPollChange(data);
  };

  doVoteError = (msg: string): void => {
    console.error(`Error fetching /api/bid: ${msg}`);
  };

  doBackClick = (_: MouseEvent<HTMLButtonElement>): void => {
    this.props.onBackClick();  
  };
}

