import React, { useState, createRef } from 'react';
import { Container, Dimmer, Loader, Grid, Sticky, Message } from 'semantic-ui-react';
import { Routes, Route, Link, BrowserRouter} from "react-router-dom";
import 'semantic-ui-css/semantic.min.css';

import { SubstrateContextProvider, useSubstrate } from './substrate-lib';
import { DeveloperConsole } from './substrate-lib/components';


import AccountSelector from './AccountSelector';
import PuzzleList from "./PuzzleList";
import StepCase from "./StepCase";


function Main () {
  const [accountAddress, setAccountAddress] = useState(null);
  const { apiState, keyring, keyringState, apiError } = useSubstrate();
  const accountPair =
    accountAddress &&
    keyringState === 'READY' &&
    keyring.getPair(accountAddress);

  const loader = text =>
    <Dimmer active>
      <Loader size='small'>{text}</Loader>
    </Dimmer>;

  const message = err =>
    <Grid centered columns={2} padded>
      <Grid.Column>
        <Message negative compact floating
          header='Error Connecting to Substrate'
          content={`${JSON.stringify(err, null, 4)}`}
        />
      </Grid.Column>
    </Grid>;

  if (apiState === 'ERROR') return message(apiError);
  else if (apiState !== 'READY') return loader('Connecting to Substrate');

  if (keyringState !== 'READY') {
    return loader('Loading accounts (please review any extension\'s authorization)');
  }

  const contextRef = createRef();

  return (
    <div ref={contextRef}>
      <Sticky context={contextRef}>
        <AccountSelector setAccountAddress={setAccountAddress} />
      </Sticky>
      <Container>
        <Grid stackable columns='equal'>
          <Grid.Row>
            <BrowserRouter>
              <div className="App">
                <h3><Link to="/">Home</Link></h3>
                <h3><Link to="/puzzle_list">Atocha Puzzle Client</Link></h3>
                <h3><Link to="/step_case">StepCase</Link></h3>
                <Routes>
                  <Route path="/puzzle_list" element={<PuzzleList accountPair={accountPair}/>} />
                  <Route path="/step_case" element={<StepCase accountPair={accountPair}/>} />
                </Routes>
              </div>
            </BrowserRouter>
          </Grid.Row>
        </Grid>
      </Container>
      <DeveloperConsole />
    </div>
  );
}

export default function App () {
  return (
    <SubstrateContextProvider>
      <Main />
    </SubstrateContextProvider>
  );
}