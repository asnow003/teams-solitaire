// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import React from 'react';
import './App.css';
import * as microsoftTeams from "@microsoft/teams-js";
import { Solitaire } from '../objects/Solitaire/Solitaire';

/**
 * The 'PersonalTab' component renders the main tab content
 * of your app.
 */
class Tab extends React.Component<any, any> {

  constructor(props: any){
    super(props);

    
    this.state = {
    }
  }

  //React lifecycle method that gets called once a component has finished mounting
  //Learn more: https://reactjs.org/docs/react-component.html#componentdidmount
  componentDidMount(){
    // Get the user context from Teams and set it in the state
    microsoftTeams.getContext((context: microsoftTeams.Context) => {
      this.setState({
        context: context
      });
    });
    // Next steps: Error handling using the error object

    const solitaire = new Solitaire();
    solitaire.start();
  }

  render() {
      return (
      <div>
        <canvas id="canvas"></canvas>
      </div>
      );
  }
}
export default Tab;