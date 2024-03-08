import React, { Component } from "react";

const DEBUG: boolean = true;
type Page = "list" | "new" | { kind: "details"; name: string };

type Poll = {
  name: string;
  time: number;
  options: string[];
  result: string;
}

type PollsAppState = {
  page: Page;
  polls: Poll[];
  isLoading: boolean;
  error: string | null;
}

/** Displays the UI of the Polls application. */
export class PollsApp extends Component<{}, PollsAppState> {

  constructor(props: {}) {
    super(props);

    this.state = {
      page: "list",
      polls: [],
      isLoading: false,
      error: null
    };
  }
  
  render = (): JSX.Element => {
    const page = this.state.page;
    if (page === "list") {
      if (DEBUG) console.debug("rendering list page");
      return (
        <div>
          {/* Render the list page */}
        </div>
      );
    } else if (page === "new") {
      if (DEBUG) console.debug("rendering add page");
      return (
        <div>
          {/* Render the new poll creation page */}
        </div>
      );
    } else { // details
      const name = page.name;
      if (DEBUG) console.debug(`rendering details page for "${name}"`);
      return (
        <div>
          {/* Render the poll details page for the specified poll name */}
        </div>
      );
    }
  };

  doNewClick = (): void => {
    if (DEBUG) console.debug("set state to new");
    this.setState({ page: "new" });
  };

  doPollClick = (name: string): void => {
    if (DEBUG) console.debug(`set state to details for poll ${name}`);
    this.setState({ page: { kind: "details", name } });
  };

  doBackClick = (): void => {
    if (DEBUG) console.debug("set state to list");
    this.setState({ page: "list" });
  };
}