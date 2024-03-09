import React, { Component, /*ChangeEvent,**/ MouseEvent } from 'react';
import { Poll } from './PollsApp';

export type NewPollInfo = {
    name: string,
    minutes: number,
    options: string[]
}

type NewPollProps = {
    polls: ReadonlyArray<Poll>,
    onAddClick: (info: NewPollInfo) => void,
    onBackClick: () => void
}

type NewPollState = {
    name: string,
    optiontext: string,
    minutes: string,
    error: string
}

// allows the user to create a new poll
export class NewPoll extends Component<NewPollProps, NewPollState> {
    
    constructor(props: NewPollProps) {
        super(props);
        this.state = {name: "", optiontext: "", minutes:"10", error: ""}
    }

    render = (): JSX.Element => {
        return (
        <div>
            <h3>New Poll</h3>
            <div>
            <label htmlFor="name">Name: </label>
            <input type="text" value={this.state.name || ''}
                     id="name" onChange={this.doNameChange}></input>
            <br/>
            <div>
            <label htmlFor="minutes">Minutes:</label>
            <input id="minutes" type="number" min="1" value={this.state.minutes}
              onChange={this.doMinutesChange}></input>
            </div>
            <label htmlFor="optiontext">Options (one per line, minimum 2 lines):</label>
            <br/>
            <textarea id="optiontext" rows={3} cols={40} value={this.state.optiontext}
            onChange={this.doOptiontextChange}></textarea>
            <br/>
            <button type="button" onClick={this.doSaveClick}>Create</button>
            <button type="button" onClick={this.doBackClick}>Back</button>
            </div>
            {this.renderError()}
        </div>);
    }

    // show error message
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
    
    // set the name of new poll
    doNameChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({name: evt.target.value});
    };

    // set the options
    doOptiontextChange = (evt: React.ChangeEvent<HTMLTextAreaElement>): void => {
        this.setState({optiontext: evt.target.value});
    };

    // set the minutes
    doMinutesChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({minutes: evt.target.value, error: ""});
    };

    // check if multiple options have the same string name (if an option appeared more than once)
    doCheckrepeatClick = (val: string[]): boolean => {
        // Inv: i < val.length
        for(let i:number = 0; i < val.length; i++)
        {   
            const list = val.slice(i+1);
            const option: string = val[i];
            if(list.indexOf(option) >= 0)
            {
                return true;
            }
        }
        return false;
    }

    doBackClick = (_: MouseEvent<HTMLButtonElement>): void => {
        this.props.onBackClick();  // tell the parent this was clicked
    };

    doSaveClick = (_: MouseEvent<HTMLButtonElement>): void => {
        // Verify that the user entered all required information.
        if (this.state.name.trim().length === 0 ||
            this.state.optiontext.trim().length === 0 ||
            this.state.minutes.trim().length === 0) {
          this.setState({error: "a required field is missing."});
          return;
        }
        const options = this.state.optiontext.split('\n').filter(line => line.trim() !== '');
        if(this.doCheckrepeatClick(options))
        {
            this.setState({error: "there are repeated options"})
            return;
        }
        if(options.length <= 1)
        {
            this.setState({error: "there is only one option"})
            return;
        }
        // Verify that minutes is a number.
        const minutes = parseFloat(this.state.minutes);
        if (isNaN(minutes) || minutes < 1 || Math.floor(minutes) !== minutes) {
          this.setState({error: "minutes is not a positive integer"});
          return;
        }
        const names: string[] = [];
        for(const poll of this.props.polls)
        {
            names.push(poll.name);
        }
        // if(names.indexOf(this.state.name) >= 0)
        // {
        //     this.setState({error: `poll called ${this.state.name} already exists`});
        //     return;
        // }
        this.setState({error: ""});
        // Ask the app to start this auction (adding it to the list).
        this.props.onAddClick({
            name: this.state.name,
            minutes: minutes,
            options: options,
         });
      };
}