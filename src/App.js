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
import config from './config';

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

import PuzzleDetail from "./AtochaClient/PuzzleDetail";
import {AtoContextProvider} from "./AtochaClient/AtoContext";
import PointsRankList from "./AtochaClient/PointsRankList";
import UserHome from "./AtochaClient/UserHome";

function Main() {
  const { apiState, apiError, keyringState } = useSubstrateState()

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
                <h3><Link to="/puzzle_list">Atocha Puzzle Client - v322</Link></h3>
                <h3><Link to="/user_home">Atocha user home</Link></h3>
                <h3><Link to="/step_case">StepCase</Link></h3>
                <Routes>
                  <Route path="/puzzle_list" element={<PuzzleList />} />
                  <Route path="/points_rank_list" element={<PointsRankList />} />
                  <Route path="/step_case" element={<StepCase />} />
                  <Route path="/user_home" element={<UserHome />} />
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
      <AtoContextProvider>
        <Main />
      </AtoContextProvider>
    </SubstrateContextProvider>
  )
}
