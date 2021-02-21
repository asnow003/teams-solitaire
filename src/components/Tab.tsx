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

  private solitaire: Solitaire;

  constructor(props: any){
    super(props);

    this.solitaire = new Solitaire();
    
    this.state = {
    }
  }

  private updateTheme = (themeStr?: string | null): void => {

  }

  private beforeUnload = (readyToUnload: ()=> void): boolean => {
    this.solitaire.pause();
    readyToUnload();
    return true;
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

    this.solitaire.start();

    microsoftTeams.registerOnThemeChangeHandler(this.updateTheme);

    microsoftTeams.registerBeforeUnloadHandler(this.beforeUnload);
  
    microsoftTeams.registerOnLoadHandler(() => {
      this.solitaire.pause();
      microsoftTeams.appInitialization.notifyAppLoaded();
    });
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