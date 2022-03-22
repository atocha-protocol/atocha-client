import React, { useEffect, useState } from 'react';
import sha256 from 'sha256';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Button, Table, Tab} from 'semantic-ui-react';

import config from '../config';
import {useSubstrate, useSubstrateState} from '../substrate-lib';
import ArweaveTitle from "./ArweaveTitle";

import ClientAtochaCreator from "./ClientAtochaCreator";
import {useAtoContext, useAtoContextState} from "./AtoContext";
import PointsRankList from "./PointsRankList";

function Main (props) {
  const {apollo_client, gql, puzzleSets: {pubPuzzleList, setPubPuzzleList, setPubPuzzleListType, pubRefresh, updatePubRefresh} , chainData: {pubBlockNumber} } = useAtoContext()
  const { api } = useSubstrateState();
  const [newPuzzle, setNewPuzzle] = useState(null);

  function updatePuzzleList(type) {
    setPubPuzzleListType(type)
  }

  // Puzzle information.
  useEffect(async () => {

  }, [newPuzzle]);

  return (
      <div>
        <Grid.Row>
          <Grid.Column width={8}>
            <h1>Atocha puzzle list</h1>
            <div>Current block number: {pubBlockNumber}</div>
            <div>
              <Button onClick={()=>updatePuzzleList('UNSOLVED')}>UNSOLVED</Button>
              <Button onClick={()=>updatePuzzleList('CHALLENGABLE')}>CHALLENGABLE</Button>
              <Button onClick={()=>updatePuzzleList('SOLVED')}>SOLVED</Button>
              <Button onClick={()=>updatePuzzleList('JUDGING')}>JUDGING</Button>
              <Button onClick={()=>updatePuzzleList('INVALID')}>INVALID</Button>
            </div>
            <Table>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>Puzzle Hash</Table.Cell>
                  <Table.Cell>Puzzle title</Table.Cell>
                  <Table.Cell>On chain bn</Table.Cell>
                  <Table.Cell>Total Deposit</Table.Cell>
                  <Table.Cell>Puzzle status</Table.Cell>
                  <Table.Cell>Answer status</Table.Cell>
                  <Table.Cell>Challenge submission deadline</Table.Cell>
                  <Table.Cell>Challenge status</Table.Cell>
                  <Table.Cell>Challenge period remaining</Table.Cell>
                </Table.Row>
                {pubPuzzleList.map(puzzleObj=><Table.Row key={puzzleObj.puzzleHash}>
                  <Table.Cell>{puzzleObj.puzzleHash}</Table.Cell>
                  <Table.Cell><ArweaveTitle puzzle_hash={puzzleObj.puzzleHash}/></Table.Cell>
                  <Table.Cell>
                    <a href={`${config.POLKADOT_EXPLORE}/?rpc=${config.PROVIDER_SOCKET}#/explorer/query/${puzzleObj.eventHash}`} target="_blank">
                      {puzzleObj.eventBn}
                    </a>
                  </Table.Cell>
                  <Table.Cell>{puzzleObj.dynTotalDeposit}</Table.Cell>
                  <Table.Cell>{puzzleObj.dynPuzzleStatus}</Table.Cell>
                  <Table.Cell>{puzzleObj.dynHaveMatchedAnswer?'Match':'Not match'}</Table.Cell>
                  <Table.Cell>{puzzleObj.dynChallengeDeadline>0?puzzleObj.dynChallengeDeadline:'*'}</Table.Cell>
                  <Table.Cell>{puzzleObj.dynChallengeStatus}</Table.Cell>
                  <Table.Cell>{puzzleObj.dynRaiseDeadline>0?puzzleObj.dynRaiseDeadline:'*'}</Table.Cell>
                </Table.Row>)}
              </Table.Body>
            </Table>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <ClientAtochaCreator setNewPuzzle={setNewPuzzle} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <PointsRankList />
          </Grid.Column>
        </Grid.Row>
      </div>
  );
}

export default function PuzzleList (props) {
  const { api } = useSubstrateState();
  const { apollo_client, gql } = useAtoContext()
  return api.query && apollo_client && gql
    ? <Main {...props} />
    : null;
}
