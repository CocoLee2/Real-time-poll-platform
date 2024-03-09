import React, { Component, MouseEvent } from "react";
import { isRecord } from './record';
import { Poll, parsePoll } from "./Polls";


type ListProps = {
  onNewClick: () => void,
  onPollsClick: (name: string) => void
};

type ListState = {
  now: number,
  polls: Poll[] | undefined
}

/** Displays the UI of the Polls application. */
export class App extends Component<ListProps, ListState> {

  constructor(props: ListProps) {
    super(props);
    this.state = {now: Date.now(), polls: undefined};
  }

  componentDidMount = (): void => {
    this.doRefreshClick();
  }

  componentDidUpdate = (prevProps: ListProps): void => {
    if (prevProps !== this.props) {
      this.setState({now: Date.now()});  // Force a refresh
    }
  };
  
  render = (): JSX.Element => {
    return (<div>
      <h2>Current Polls</h2>
      {this.renderAuctions()}
      <button type="button" onClick={this.doRefreshClick}>Refresh</button>
      <button type="button" onClick={this.doNewClick}>New Poll</button>
    </div>);
  };

  renderAuctions = (): JSX.Element => {
    if (this.state.polls === undefined) {
      return <p>Loading poll list...</p>;
    } else {
      const openPolls: JSX.Element[] = [];
      const closedPolls: JSX.Element[] = [];
  
      for (const poll of this.state.polls) {
        const min = (poll.endTime - this.state.now) / 60 / 1000;
        const desc = (min < 0) ? ` – closed ${Math.abs(Math.round(min))} minutes ago` : ` – ${Math.round(min)} minutes remaining`;
  
        const pollElement = (
          <li key={poll.name}>
            <a href="#" onClick={(evt) => this.doPollClick(evt, poll.name)}>{poll.name}</a>
            {desc}
          </li>
        );
  
        if (min < 0) {
          closedPolls.push(pollElement);
        } else {
          openPolls.push(pollElement);
        }
      }
  
      return (
        <div>
          <h3>Still Open</h3>
          <ul>{openPolls}</ul>
          <h3>Closed</h3>
          <ul>{closedPolls}</ul>
        </div>
      );
    }
  };

  doListResp = (resp: Response): void => {
    if (resp.status === 200) {
      resp.json().then(this.doListJson)
          .catch(() => this.doListError("200 response is not JSON"));
    } else if (resp.status === 400) {
      resp.text().then(this.doListError)
          .catch(() => this.doListError("400 response is not text"));
    } else {
      this.doListError(`bad status code from /api/list: ${resp.status}`);
    }
  };

  doListJson = (data: unknown): void => {
    if (!isRecord(data)) {
      console.error("bad data from /api/list: not a record", data);
      return;
    }

    if (!Array.isArray(data.polls)) {
      console.error("bad data from /api/list: polls is not an array", data);
      return;
    }

    const polls: Poll[] = [];
    for (const val of data.polls) {
      const poll = parsePoll(val);
      if (poll === undefined)
        return;
      polls.push(poll);
    }
    this.setState({polls, now: Date.now()});  // fix time also
  };

  doListError = (msg: string): void => {
    console.error(`Error fetching /api/list: ${msg}`);
  };

  doRefreshClick = (): void => {
    fetch("/api/list").then(this.doListResp)
        .catch(() => this.doListError("failed to connect to server"));
  };

  doNewClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
    this.props.onNewClick();  // tell the parent to show the new poll page
  };

  doPollClick = (evt: MouseEvent<HTMLAnchorElement>, name: string): void => {
    evt.preventDefault();
    this.props.onPollsClick(name);
  };
}