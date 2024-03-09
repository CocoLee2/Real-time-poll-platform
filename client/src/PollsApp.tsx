// import React, { Component } from 'react';
// import { App } from './App';
// import { PollDetail, VoteInfo } from './PollDetail';
// import { NewPoll, NewPollInfo } from './CreateNew';
// import { Poll } from './Polls';

// // Indicates which page to show
// type Page = "list" | "new" | {kind: "details", poll: Poll};

// // RI: If page is "details", then index is a valid index into polls array.
// type AppState = {
//   page: Page,
//   polls: Poll[]
// }

// // Whether to show debugging information in the console.
// const DEBUG: boolean = true;

// // Top-level component that displays the appropriate page.
// export class PollsApp extends Component<{}, AppState> {
//   constructor(props: {}) {
//     super(props);
//     this.state = {page: "list", polls: [] };
//   }

//   render = (): JSX.Element => {
//     if (this.state.page === "list") {
//       if (DEBUG) console.debug("rendering list page");
//       return (
//         <App
//           onNewClick={this.doNewClick}
//           onPollsClick={this.doPollClick}
//         />
//       );
//     } else if (this.state.page === "new") {
//       if (DEBUG) console.debug("rendering add page");
//       return (
//         <NewPoll
//           polls={this.state.polls || []} // Provide an empty array if this.state.polls is undefined
//           onAddClick={this.doCreateClick}
//           onBackClick={this.doBackClick}
//         />
//       );
//     } else {
//       return (
//         <PollDetail poll={this.state.page.poll}
//         onBackClick={this.doBackClick}
//         onRefreshClick={this.doRefreshClick}
//         onVoteClick={this.doVoteClick} />
//       );
//     }
//   };

//   doNewClick = (): void => {
//     if (DEBUG) console.debug("set state to new");
//     this.setState({page: "new"});
//   };

//   // click on specific poll
//   doPollClick = (name: string): void => {
//     if (DEBUG) console.debug(`set state to details for poll ${name}`);
//     const poll = this.state.polls.find(p => p.name === name);
//     if (poll) {
//       this.setState({ page: { kind: "details", poll: poll } });
//     }
//   };

//   // go back
//   doBackClick = (): void => {
//     if (DEBUG) console.debug("set state to list");
//     this.setState({page: "list"});
//   };

//   // create a vote
//   doCreateClick = (info: NewPollInfo): void => {
//     fetch("/api/create-poll", {
//       method: "POST", body: JSON.stringify(info),
//       headers: { "Content-Type": "application/json" }
//     })
//       .then(this.doCreateResp)
//       .catch(() => this.doCreateError("failed to connect to server"));
//   }

//   doCreateResp = (res: Response): void => {
//     if (res.status === 400) {
//       res.text().then(this.doCreateError)
//         .catch(() => this.doCreateError("400 response is not text"));
//     } else {
//       this.doCreateError(`bad status code ${res.status}`);
//     }
//   };

//   doCreateError = (msg: string): void => {
//     console.error(`Error fetching /save: ${msg}`);
//   };

//   // vote
//   doVoteClick = (info: VoteInfo): void => {
//     fetch("/api/vote", {
//       method: "POST", body: JSON.stringify(info),
//       headers: { "Content-Type": "application/json" }
//     })
//       .then(this.doVoteResp)
//       .catch(() => this.doVoteError("failed to connect to server"));
//   }

//   doVoteResp = (res: Response): void => {
//     if (res.status === 400) {
//       res.text().then(this.doVoteError)
//         .catch(() => this.doVoteError("400 response is not text"));
//     } else {
//       this.doVoteError(`bad status code ${res.status}`);
//     }
//   };

//   doVoteError = (msg: string): void => {
//     console.error(`Error fetching /save: ${msg}`);
//   };

//   // refresh the page
//   doRefreshClick = (): void => {
//     this.doRefreshAllPollClick();
//   }

//   doRefreshAllPollClick = (): void => {
//     fetch("/api/list").then(this.doRefreshAllPollResp)
//       .catch(() => this.doRefreshAllPollError("failed to connect to server"));
//   };

//   doRefreshAllPollResp = (res: Response): void => {
//     if (res.status === 400) {
//       res.text().then(this.doRefreshAllPollError)
//         .catch(() => this.doRefreshAllPollError("400 response is not text"));
//     } else {
//       this.doRefreshAllPollError(`bad status code ${res.status}`);
//     }
//   };

//   doRefreshAllPollError = (msg: string): void => {
//     console.error(`Error fetching /list: ${msg}`);
//   };
// }
import React, { Component } from "react";
import { isRecord } from './record';
import { NewPoll, NewPollInfo } from "./CreateNew";
import { PollDetail, VoteInfo } from "./PollDetail";
// import { PollList } from "./Polls";
import { App } from "./App";

const DEBUG: boolean = false;

type Page = "polls" | { kind: "vote", poll: Poll } | "new" | { kind: "details", poll: Poll };

export type Poll = {
  readonly name: string,
  readonly option: string[],
  readonly votedOption: number[],
  readonly endTime: number,
  readonly totalvotes: number
};

type PollsAppState = {
  page: Page,
  polls: Poll[]
}

export class PollsApp extends Component<{}, PollsAppState> {

  constructor(props: {}) {
    super(props);
    this.state = { page: "polls", polls: [] };
  }

  componentDidMount = (): void => {
    this.doRefreshClick();
  };

  render = (): JSX.Element => {
    if (this.state.page === "polls") {
      if (DEBUG) console.debug("rendering list page");
      return (
        <App
          onNewClick={this.doNewPollClick}
          onPollsClick={this.doLoadfromClick}
        />
      );
    } else if (this.state.page === "new") {
      if (DEBUG) console.debug("rendering add page");
      return (
        <NewPoll
          polls={this.state.polls || []} // Provide an empty array if this.state.polls is undefined
          onAddClick={this.doNewPollClick}
          onBackClick={this.doBackClick}
        />
      );
    } else {
      return (
                <PollDetail poll={this.state.page.poll}
                onBackClick={this.doBackClick}
                onRefreshClick={this.doRefreshClick}
                onVoteClick={this.doVoteClick} />
              );
    }
  };

  doRefreshClick = (): void => {
    this.doRefreshAllPollClick();
  }

  doRefreshAllPollClick = (): void => {
    fetch("/api/list").then(this.doRefreshAllPollResp)
      .catch(() => this.doRefreshAllPollError("failed to connect to server"));
  };

  doRefreshAllPollResp = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.doRefreshAllPollJson)
        .catch(() => this.doRefreshAllPollError("200 response is not valid JSON"));
    } else if (res.status === 400) {
      res.text().then(this.doRefreshAllPollError)
        .catch(() => this.doRefreshAllPollError("400 response is not text"));
    } else {
      this.doRefreshAllPollError(`bad status code ${res.status}`);
    }
  };

  doRefreshAllPollJson = (val: unknown): void => {
    if (!isRecord(val)) {
      console.error("bad data from /list: not a record", val)
      return;
    }
    const polls = this.doParsefilenamesClick(val.polls);
    if (polls !== undefined)
      this.setState({ polls: polls });
  };

  doRefreshAllPollError = (msg: string): void => {
    console.error(`Error fetching /list: ${msg}`);
  };

  doParsefilenamesClick = (val: unknown): undefined | Poll[] => {
    if (!Array.isArray(val)) {
      console.error("not an array", val);
      return undefined;
    }
    const items: Poll[] = [];
    for (const item of val) {
      const po = this.doParsePollClick(item);
      if (po !== undefined) {
        items.push(po);
      }
    }
    return items;
  };

  doBackClick = (): void => {
    this.doRefreshAllPollClick();
    this.setState({ page: "polls" });
  };

  doLoadfromClick = (filename: string): void => {
    const url = "/api/load?name=" + encodeURIComponent(filename);
    fetch(url)
      .then(this.doLoadResp)
      .catch(() => this.doLoadError("failed to connect to server"));
  };

  doLoadResp = (res: Response): void => {
    if (res.status === 400) {
      res.text().then(this.doLoadError)
        .catch(() => this.doLoadError("400 response is not text"));
    } else {
      this.doLoadError(`bad status code ${res.status}`);
    }
  };

  // doLoadJson = (val: unknown): void => {
  //   if (!isRecord(val)) {
  //     console.error("bad data from /load: not a record", val)
  //     return;
  //   }
  //   const poll = this.doParsePollClick(val.poll);
  //   if (typeof val.name !== 'string') {
  //     throw new Error();
  //   }
  //   if (poll !== undefined && poll.endTime > 0) {
  //     this.setState({ page: { kind: "vote", poll: poll } })
  //   } else {
  //     this.setState({ page: { kind: "details", poll: poll } })
  //   }
  // };

  doLoadError = (msg: string): void => {
    console.error(`Error fetching /load: ${msg}`);
  };

  doNewPollClick = (): void => {
    if (DEBUG) console.debug("set state to new");
    this.setState({ page: "new" });
  };

  doSaveClick = (info: NewPollInfo): void => {
    fetch("/api/save", {
      method: "POST", body: JSON.stringify(info),
      headers: { "Content-Type": "application/json" }
    })
      .then(this.doSaveResp)
      .catch(() => this.doSaveError("failed to connect to server"));
  }

  doSaveResp = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.doSaveJson)
        .catch(() => this.doSaveError("200 response is not valid JSON"));
    } else if (res.status === 400) {
      res.text().then(this.doSaveError)
        .catch(() => this.doSaveError("400 response is not text"));
    } else {
      this.doSaveError(`bad status code ${res.status}`);
    }
  };

  doSaveJson = (data: unknown): void => {
    if (!isRecord(data)) {
      console.error("bad data from /save: not a record", data);
      return;
    }
    if (typeof data.name !== 'string') {
      console.error("bad data from /save: name is not a string", data);
      return;
    } else {
      fetch("/api/list").then(this.doRefreshAllPollResp)
        .catch(() => this.doRefreshAllPollError("failed to connect to server"));
      const curpo = this.doParsePollClick(data.poll);
      if (curpo === undefined) {
        throw new Error();
      }
      this.setState({ page: "polls" });
    }
  };

  doSaveError = (msg: string): void => {
    console.error(`Error fetching /save: ${msg}`);
  };

  doVoteClick = (info: VoteInfo): void => {
    fetch("/api/vote", {
      method: "POST", body: JSON.stringify(info),
      headers: { "Content-Type": "application/json" }
    })
      .then(this.doVoteResp)
      .catch(() => this.doVoteError("failed to connect to server"));
  }

  doVoteResp = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.doVoteJson)
        .catch(() => this.doVoteError("200 response is not valid JSON"));
    } else if (res.status === 400) {
      res.text().then(this.doVoteError)
        .catch(() => this.doVoteError("400 response is not text"));
    } else {
      this.doVoteError(`bad status code ${res.status}`);
    }
  };

  doVoteJson = (data: unknown): void => {
    if (!isRecord(data)) {
      console.error("bad data from /vote: not a record", data);
      return;
    }
    const poll = this.doParsePollClick(data.poll);
    if (poll !== undefined && typeof poll.name !== 'string') {
      console.error("bad data from /vote: name is not a string", data);
      return;
    }
  };

  doVoteError = (msg: string): void => {
    console.error(`Error fetching /save: ${msg}`);
  };

  doLoadPollClick = (filename: string): void => {
    const url = "/api/load?name=" + encodeURIComponent(filename);
    fetch(url)
      .then(this.doLoadPollResp)
      .catch(() => this.doLoadPollError("failed to connect to server"));
  };

  doLoadPollResp = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.doLoadPollJson)
        .catch(() => this.doLoadPollError("200 response is not valid JSON"));
    } else if (res.status === 400) {
      res.text().then(this.doLoadPollError)
        .catch(() => this.doLoadPollError("400 response is not text"));
    } else {
      this.doLoadPollError(`bad status code ${res.status}`);
    }
  };

  doLoadPollJson = (val: unknown): void => {
    if (!isRecord(val)) {
      console.error("bad data from /load: not a record", val)
      return;
    }
    const poll = this.doParsePollClick(val.poll);
    if (typeof val.name !== 'string') {
      throw new Error();
    }
    if (poll !== undefined) {
      const updatedpolls = Array.from(this.state.polls);
      const index = updatedpolls.indexOf(poll);
      const newpoll = updatedpolls.slice(0, index).concat([poll]).concat(updatedpolls.slice(index + 1))
      this.setState({ polls: newpoll, page: { kind: "vote", poll: poll } })
    }
  };

  doLoadPollError = (msg: string): void => {
    console.error(`Error fetching /load: ${msg}`);
  };

  doParsePollClick = (val: unknown): undefined | Poll => {
    if (!isRecord(val)) {
      console.error("not poll", val)
      return undefined;
    }

    if (typeof val.name !== "string") {
      console.error("not a poll: missing 'name'", val)
      return undefined;
    }

    if (!Array.isArray(val.option) || typeof (val.option[0]) !== 'string') {
      console.error("not a poll: missing 'option'", val)
      return undefined;
    }

    if (!Array.isArray(val.votes) || typeof (val.votes[0]) !== 'number') {
      console.error("not a poll: missing 'votes'", val)
      return undefined;
    }

    if (typeof val.endTime !== "number" || val.endTime < 0 || isNaN(val.endTime)) {
      console.error("not a poll: missing or invalid 'endTime'", val)
      return undefined;
    }
    if (typeof val.totalvotes !== "number" || val.totalvotes < 0 || isNaN(val.totalvotes)) {
      console.error("not a poll: missing or invalid 'totalvotes'", val)
      return undefined;
    }

    return {
      name: val.name, option: val.option, endTime: val.endTime, votedOption: val.votes, totalvotes: val.totalvotes
    };
  }
}
