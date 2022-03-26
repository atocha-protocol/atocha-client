import React, {createRef, useState} from 'react'
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
import ClientAtochaCreator from "./AtochaClient/ClientAtochaCreator";
import MyHome from "./AtochaClient/MyHome";

function Main() {
  const { apiState, apiError, keyringState } = useSubstrateState()

  const [menuItemCss, setMenuItemCss] = useState({
    itemHome: 'item active',
    itemUser: 'item',
    itemCreate: 'item',
    itemRanklist: 'item',
    itemStep: 'item',
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

  function menuClick(menuName){
    let newClass = {
      itemHome: 'item',
      itemUser: 'item',
      itemCreate: 'item',
      itemRanklist: 'item',
      itemStep: 'item',
    };
    switch (menuName) {
      case 'home':
        newClass.itemHome='item active';
        break;
      case 'user':
        newClass.itemUser='item active';
        break;
      case 'create':
        newClass.itemCreate='item active';
        break;
      case 'ranklist':
        newClass.itemRanklist='item active';
        break;
      case 'step':
        newClass.itemStep='item active';
        break;
    }
    setMenuItemCss(newClass);
  }

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
              <div className="ui secondary menu">
                <Link className={menuItemCss.itemHome} to="/" onClick={()=>{menuClick("home")}}>Home(v333)</Link>
                <Link className={menuItemCss.itemRanklist} to="/points_rank_list" onClick={()=>{menuClick("ranklist")}}>Points rank list</Link>
                <Link className={menuItemCss.itemCreate} to="/create" onClick={()=>{menuClick("create")}}>Create</Link>
                <Link className={menuItemCss.itemStep} to="/step_case" onClick={()=>{menuClick("step")}}>StepCase [old - tools]</Link>
                <Link className={menuItemCss.itemUser} to="/my_home" onClick={()=>{menuClick("user")}}>My</Link>
              </div>
                <Routes>
                  <Route path="/" element={<PuzzleList />} />
                  <Route path="/create" element={<ClientAtochaCreator />} />
                  <Route path="/points_rank_list" element={<PointsRankList />} />
                  <Route path="/step_case" element={<StepCase />} />
                  <Route path="/my_home" element={<MyHome />} />
                  <Route path="/user_home/:account_id" element={<UserHome />} />
                  <Route path="/puzzle_detail/:puzzle_hash" element={<PuzzleDetail />} />
                </Routes>
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
