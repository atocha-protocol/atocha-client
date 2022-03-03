import React, { useEffect, useState } from 'react';
import sha256 from 'sha256';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Button, Table, Tab} from 'semantic-ui-react';

import config from '../config';
import {useSubstrate, useSubstrateState} from '../substrate-lib';
// import { TxButton } from './substrate-lib/components';
//
// import AtochaArweaveStorage from "./Step/AtochaArweaveStorage";
// import AtochaPuzzleAnswer from "./Step/AtochaPuzzleAnswer";
// import AtochaPuzzleCreator from "./Step/AtochaPuzzleCreator";
// import AtochaCommitChallenge from "./Step/AtochaCommitChallenge";
//
// import Balances from './Balances';
// import BlockNumber from './BlockNumber';
// import Events from './Events';
// import Interactor from './Interactor';
// import Metadata from './Metadata';
// import NodeInfo from './NodeInfo';
// import TemplateModule from './TemplateModule';
// import Transfer from './Transfer';
// import Upgrade from './Upgrade';
// import AtochaPalletInfo from "./Step/AtochaPalletInfo";
// import AtochaApplyTokenReward from "./AtochaApplyTokenReward";
import ArweaveTitle from "./ArweaveTitle";

import ClientAtochaCreator from "./ClientAtochaCreator";
import {useAtoContext, useAtoContextState} from "./AtoContext";

function Main (props) {
  const {apollo_client, gql } = useAtoContext()
  const { api } = useSubstrateState();
  const [puzzleList, setPuzzleList] = useState([]);
  const [newPuzzle, setNewPuzzle] = useState(null);


  async function loadPuzlleList() {
    apollo_client.query({
      query: gql`
        query{
          puzzleCreatedEvents(last:1000,orderBy:EVENT_BN_DESC){
            nodes{
              who,
              puzzleHash,
              createBn,
              eventBn,
              eventHash,
              challenge_infos{
                totalCount
              },
              challenge_status(orderBy:EVENT_BN_DESC){
                totalCount,
                nodes{
                  challengeStatus
                }
              },
              answer_infos(orderBy:EVENT_BN_DESC){
                totalCount,
                nodes{
                  answerContent,
                  eventBn,
                  resultType
                }
              }
            }
          }
        }
      `
    }).then(result => {
      console.log("result.data. = ", result.data); // puzzleCreatedEvents
      setPuzzleList(result.data.puzzleCreatedEvents.nodes);
    });
  }

  // Puzzle information.
  useEffect(async () => {
    await loadPuzlleList();
  }, [newPuzzle]);

  return (
      <div>
        <Grid.Row>
          <Grid.Column width={8}>
            <h1>Atocha puzzle list</h1>
            <Table>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>Creator</Table.Cell>
                  <Table.Cell>Puzzle title</Table.Cell>
                  <Table.Cell>On chain bn</Table.Cell>
                  <Table.Cell>Answer status</Table.Cell>
                  <Table.Cell>Challenge status</Table.Cell>
                  <Table.Cell>Challenge period remaining</Table.Cell>
                </Table.Row>
                {puzzleList.map(puzzleObj=><Table.Row key={puzzleObj.puzzleHash}>
                  <Table.Cell>{puzzleObj.who}</Table.Cell>
                  <Table.Cell><ArweaveTitle puzzle_hash={puzzleObj.puzzleHash}/></Table.Cell>
                  <Table.Cell>
                    <a href={`${config.POLKADOT_EXPLORE}/?rpc=ws%3A%2F%2F148.72.247.143%3A8844#/explorer/query/${puzzleObj.eventHash}`} target="_blank">
                      {puzzleObj.eventBn}
                    </a>
                  </Table.Cell>
                  <Table.Cell>{puzzleObj.answer_infos.totalCount == 0?'No':puzzleObj.answer_infos.nodes[0].resultType == 'ANSWER_HASH_IS_MATCH'?'Match':'Not match'}</Table.Cell>
                  <Table.Cell>{puzzleObj.answer_infos.totalCount == 0?'Not':
                                  puzzleObj.challenge_status.totalCount == 0?'No':
                                      puzzleObj.challenge_status.nodes[0].challengeStatus}</Table.Cell>
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
