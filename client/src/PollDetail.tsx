import React, { Component, MouseEvent } from 'react';
import { Poll } from './Polls';

export type VoteInfo = {
  name: string,
  voter: string,
  option: string,
}

type VoteProps = {
  poll: Poll,
  onBackClick: () => void,
  onRefreshClick: (name: string) => void,
  onVoteClick: (info: VoteInfo) => void
}

type VoteState = {
  name: string,
  now: number,
  voter: string,
  optionchosen: string,
  error: string,
  succ: string,
}

export class PollDetail extends Component<VoteProps, VoteState> {
  constructor(props: VoteProps) {
    super(props);
    this.state = { name: props.poll.name, now: Date.now(), voter: "", optionchosen: "", error: "", succ: "" };
  }

  componentDidMount = (): void => {
    this.doRefreshClick(); 
  };

  render = (): JSX.Element => {
    const poll = this.props.poll;
    const min = Math.round((poll.endTime - this.state.now) / 60 / 100) / 10;
    if (poll.endTime <= this.state.now) {
      return (
        <div>
          <h2>{this.props.poll.name}</h2>
          <p><i>closed {Math.abs(min)} minutes ago</i></p>
          <ul>{this.renderClose()}</ul>
          <button type="button" onClick={this.doBackClick}>Back</button>
          <button type="button" onClick={this.doRefreshClick}>Refresh</button>
        </div>
      );
    } else {
      return (
        <div>
          <h2>{this.props.poll.name}</h2>
          <p><i>Closes in {min} minutes...</i></p>
          <ul>{this.renderOpen()}</ul>
          <br />
          <label htmlFor="name">Name: </label>
          <input type="text" value={this.state.voter} id="name" onChange={this.doVoterChange}></input>
          <br />
          <button type="button" onClick={this.doBackClick}>Back</button>
          <button type="button" onClick={this.doRefreshClick}>Refresh</button>
          <button type="button" onClick={this.doVoteClick}>Vote</button>
          {this.renderError()}
          {this.renderSuccess()}
        </div>
      );
    }
  }

  renderError = (): JSX.Element => {
    if (this.state.error.length === 0) {
      return <div></div>;
    } else {
      return <div><span><b>Error</b>: {this.state.error}</span></div>;
    }
  };

  renderSuccess = (): JSX.Element => {
    if (this.state.succ.length === 0) {
      return <div></div>;
    } else {
      const name = this.state.voter;
      const op = this.state.optionchosen;
      return <div><p><i>recorded vote of "{name}" as "{op}"</i></p></div>;
    }
  };

  renderOpen = (): JSX.Element[] => {
    const op: JSX.Element[] = [];
    for (const poll of this.props.poll.option) {
      op.push(
        <div key={poll}>
          <input type="radio" id={poll} name="option" value={poll} onChange={this.doOptionchoosenChange} />
          <label htmlFor="optionchosen">{poll}</label>
        </div>
      );
    }
    return op;
  }

  renderClose = (): JSX.Element[] => {
    const op: JSX.Element[] = [];
    for (const poll of this.props.poll.option) {
      const index = this.props.poll.option.indexOf(poll);
      const total = this.props.poll.totalvotes;
      const percent = this.props.poll.votedOption[index] / Math.max(total, 1);
      op.push(
        <li key={poll}>
          <a> {Math.round(percent * 100)}% - {poll}</a>
        </li>
      );
    }
    return op;
  }

  doVoterChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ voter: evt.target.value, succ: "" });
  };

  doOptionchoosenChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ optionchosen: evt.target.value, succ: "" });
  }

  doBackClick = (_: MouseEvent<HTMLButtonElement>): void => {
    this.props.onBackClick();
  };

  doRefreshClick = (): void => {
    this.setState({ now: Date.now() })
    this.props.onRefreshClick(this.state.name);
  };

  doVoteClick = (_: MouseEvent<HTMLButtonElement>): void => {
    if (this.state.name.trim().length === 0 ||
      this.state.voter.trim().length === 0 ||
      this.state.optionchosen.trim().length === 0) {
      this.setState({ error: "a required field is missing.", succ: "" });
      return;
    }
    const endtime = this.props.poll.endTime;
    const min = Math.round((endtime - Date.now()) / 60 / 100) / 10;
    if (min < 0) {
      this.setState({ error: "the vote has closed, please refresh to see results", succ: "" });
      return;
    }
    this.setState({ error: "", succ: "true" });
  }
}
