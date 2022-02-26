import React, { createRef } from 'react'
import {
  Container,
  Dimmer,
  Loader,
  Grid,
  Sticky,
  Message,
} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'
import { Routes, Route, Link, BrowserRouter} from "react-router-dom";

import { SubstrateContextProvider, useSubstrateState } from './substrate-lib'
import { DeveloperConsole } from './substrate-lib/components'

import AccountSelector from './AccountSelector'
import Balances from './Balances'
import BlockNumber from './BlockNumber'
// import Events from './Events'
// import Interactor from './Interactor'
import Metadata from './Metadata'
import NodeInfo from './NodeInfo'
import TemplateModule from './TemplateModule'
import Transfer from './Transfer'
import PuzzleList from "./AtochaClient/PuzzleList";
import StepCase from "./Step/StepCase";
// import Upgrade from './Upgrade'

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql
} from "@apollo/client";
import PuzzleDetail from "./AtochaClient/PuzzleDetail";

function Main() {
  const { apiState, apiError, keyringState } = useSubstrateState()

  const apollo_client = new ApolloClient({
    uri: 'http://localhost:3010',
    cache: new InMemoryCache()
  });

  const loader = text => (
    <Dimmer active>
      <Loader size="small">{text}</Loader>
    </Dimmer>
  )

  const message = errObj => (
    <Grid centered columns={2} padded>
      <Grid.Column>
        <Message
          negative
          compact
          floating
          header="Error Connecting to Substrate"
          content={`Connection to websocket '${errObj.target.url}' failed.`}
        />
      </Grid.Column>
    </Grid>
  )

  if (apiState === 'ERROR') return message(apiError)
  else if (apiState !== 'READY') return loader('Connecting to Substrate')

  if (keyringState !== 'READY') {
    return loader(
      "Loading accounts (please review any extension's authorization)"
    )
  }

  const contextRef = createRef()

  return (
    <div ref={contextRef}>
      <Sticky context={contextRef}>
        <AccountSelector />
      </Sticky>
      <Container>
        <Grid stackable columns="equal">
          {/*<Grid.Row stretched>*/}
          {/*  <NodeInfo />*/}
          {/*  <Metadata />*/}
          {/*  <BlockNumber />*/}
          {/*  <BlockNumber finalized />*/}
          {/*</Grid.Row>*/}
          <Grid.Row stretched>
            <BrowserRouter>
              <div className="App">
                <h3><Link to="/">Home</Link></h3>
                <h3><Link to="/puzzle_list">Atocha Puzzle Client</Link></h3>
                <h3><Link to="/step_case">StepCase</Link></h3>
                <Routes>
                  <Route path="/puzzle_list" element={<PuzzleList apollo_client={apollo_client} gql={gql} />} />
                  <Route path="/step_case" element={<StepCase />} />
                  <Route path="/puzzle_detail/:puzzle_hash" element={<PuzzleDetail />} />
                </Routes>
              </div>
            </BrowserRouter>
          </Grid.Row>
          {/*<Grid.Row stretched>*/}
          {/*  <Balances />*/}
          {/*</Grid.Row>*/}
          {/*<Grid.Row>*/}
          {/*  <Transfer />*/}
          {/*</Grid.Row>*/}
          {/*<Grid.Row>*/}
          {/*  <TemplateModule />*/}
          {/*</Grid.Row>*/}
        </Grid>
      </Container>
      <DeveloperConsole />
    </div>
  )
}

export default function App() {
  return (
    <SubstrateContextProvider>
      <Main />
    </SubstrateContextProvider>
  )
}
