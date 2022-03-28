import React, { useEffect, useState } from 'react';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Table} from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import ArweaveTitle from "./ArweaveTitle";
import config from "../config";
import PuzzleAnswer from "./PuzzleAnswer";
import PuzzleCommitChallenge from "./PuzzleCommitChallenge";
import {useAtoContext} from "./AtoContext";
import PuzzleChallengeRaising from "./PuzzleChallengeRaising";
import UserHomeLink from "./UserHomeLink";

function Main (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash } = props;
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck} } = useAtoContext()

  // Puzzle information.
  const [challengeDepositList, setChallengeDepositList] = useState([]);

  async function loadChallengeDepositList() {
    if (!puzzle_hash){
      return;
    }
    apollo_client.query({
      query: gql`
        query{
          challengeDepositEvents(last: 1000, filter: {
            puzzleHash:{
              equalTo: "${puzzle_hash}"
            }
          }){
            nodes{
              whoId,
              eventBn,
              deposit,
              depositType
            }
          }
        }
      `
    }).then(result => {
      console.log("result.data. = ", result.data); // challengeDepositEvents
      setChallengeDepositList(result.data.challengeDepositEvents.nodes);
    });
  }


  useEffect(() => {
    loadChallengeDepositList();
  }, [setChallengeDepositList, pubRefresh]);


  return (
    <Grid.Column width={8}>
      <PuzzleCommitChallenge puzzle_hash={puzzle_hash} challengeDepositList={challengeDepositList} />
      <PuzzleChallengeRaising puzzle_hash={puzzle_hash} challengeDepositList={challengeDepositList} />
      <h3>Challenge deposit info</h3>
      <Table>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Who</Table.Cell>
            <Table.Cell>Event bn</Table.Cell>
            <Table.Cell>Deposit</Table.Cell>
            <Table.Cell>Type</Table.Cell>
          </Table.Row>
          {challengeDepositList.map((challengeData, idx)=><Table.Row key={idx}>
            <Table.Cell><UserHomeLink user_address={challengeData.whoId} /></Table.Cell>
            <Table.Cell>{challengeData.eventBn}</Table.Cell>
            <Table.Cell>{challengeData.deposit}</Table.Cell>
            <Table.Cell>{challengeData.depositType}</Table.Cell>
          </Table.Row>)}
        </Table.Body>
      </Table>
    </Grid.Column>
  );
}

export default function ChallengeList (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash } = props;
  const {apollo_client, gql, puzzleSets: {updatePubRefresh, tryToPollCheck} } = useAtoContext()
  return api.query && puzzle_hash && apollo_client && gql
    ? <Main {...props} />
    : null;
}
