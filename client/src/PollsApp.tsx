import React, { Component } from 'react';
import { App } from './app';
import { PollDetails } from './detail';
import { NewPoll } from './CreateNew';

// Indicates which page to show
type Page = "list" | "new" | {kind: "details", name: string};

// RI: If page is "details", then index is a valid index into polls array.
type AppState = {page: Page};

// Whether to show debugging information in the console.
const DEBUG: boolean = true;

// Top-level component that displays the appropriate page.
export class PollsApp extends Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = { page: "list" };

    this.doNewClick = this.doNewClick.bind(this);
    this.doPollClick = this.doPollClick.bind(this);
    this.doBackClick = this.doBackClick.bind(this);
  }

  render = (): JSX.Element => {
    if (this.state.page === "list") {
      if (DEBUG) console.debug("rendering list page");
      return <App onNewClick={this.doNewClick} onPollsClick={this.doPollClick} />;
    } else if (this.state.page === "new") {
      if (DEBUG) console.debug("rendering add page");
      return <NewPoll onBackClick={this.doBackClick} />;
    } else {
      if (DEBUG) console.debug(`rendering details page for "${this.state.page.name}"`);
      return <PollDetails name={this.state.page.name} onBackClick={this.doBackClick} />;
    }
  }

  doNewClick = (): void => {
    if (DEBUG) console.debug("set state to new");
    this.setState({ page: "new" });
  }

  doPollClick = (name: string): void => {
    if (DEBUG) console.debug(`set state to details for poll ${name}`);
    this.setState({ page: { kind: "details", name } });
  }

  doBackClick = (): void => {
    if (DEBUG) console.debug("set state to list");
    this.setState({ page: "list" });
  }
}