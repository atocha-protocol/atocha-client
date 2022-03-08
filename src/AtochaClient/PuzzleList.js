import React, { useEffect, useState } from 'react';
import sha256 from 'sha256';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Button, Table, Tab} from 'semantic-ui-react';

import config from '../config';
import {useSubstrate, useSubstrateState} from '../substrate-lib';
import ArweaveTitle from "./ArweaveTitle";

import ClientAtochaCreator from "./ClientAtochaCreator";
import {useAtoContext, useAtoContextState} from "./AtoContext";

function Main (props) {
  const {apollo_client, gql, puzzleSets: {pubPuzzleList, setPubPuzzleList, setPubPuzzleListType} , chainData: {pubBlockNumber} } = useAtoContext()
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
            <h1>Atocha puzzle list </h1>
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
                  <Table.Cell>Answer status</Table.Cell>
                  <Table.Cell>Challenge status</Table.Cell>
                  <Table.Cell>Challenge period remaining</Table.Cell>
                </Table.Row>
                {pubPuzzleList.map(puzzleObj=><Table.Row key={puzzleObj.puzzleHash}>
                  <Table.Cell>{puzzleObj.puzzleHash}</Table.Cell>
                  <Table.Cell><ArweaveTitle puzzle_hash={puzzleObj.puzzleHash}/></Table.Cell>
                  <Table.Cell>
                    <a href={`${config.POLKADOT_EXPLORE}/?rpc=ws%3A%2F%2F148.72.247.143%3A8844#/explorer/query/${puzzleObj.eventHash}`} target="_blank">
                      {puzzleObj.eventBn}
                    </a>
                  </Table.Cell>
                  <Table.Cell>{puzzleObj.ref_answer_infos.totalCount == 0?'No':puzzleObj.ref_answer_infos.nodes[0].resultType == 'ANSWER_HASH_IS_MATCH'?'Match':'Not match'}</Table.Cell>
                  <Table.Cell>{puzzleObj.ref_answer_infos.totalCount == 0?'Not':
                                  puzzleObj.ref_challenge_status.totalCount == 0?'No':
                                      puzzleObj.ref_challenge_status.nodes[0].challengeStatus}</Table.Cell>
                  <Table.Cell>*</Table.Cell>
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
