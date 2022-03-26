import React, { useEffect, useState } from 'react';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Table} from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import ArweaveTitle from "./ArweaveTitle";
import config from "../config";
import PuzzleAnswer from "./PuzzleAnswer";
import PuzzleCommitChallenge from "./PuzzleCommitChallenge";
import PuzzleCommitSponsorship from "./PuzzleCommitSponsorship";
import {useAtoContext} from "./AtoContext";
import UserHomeLink from "./UserHomeLink";

function Main (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash } = props;

  // Puzzle information.
  const [puzzleDepositList, setPuzzleDepositList] = useState([]);
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck} } = useAtoContext()

  async function loadChallengeDepositList() {
    if (!puzzle_hash){
      return;
    }
    apollo_client.query({
      query: gql`
        query{
          puzzleDepositEvents(last: 1000, filter: {
            puzzleInfoId:{
              equalTo: "${puzzle_hash}"
            }
          },orderBy: DEPOSIT_DESC){
            nodes{
              id,
              whoId,
              eventBn,
              deposit,
              puzzleInfo{
                id
              },
              tip
            }
          }
        }
      `
    }).then(result => {
      console.log("result.data. = ", result.data); // puzzleDepositEvents
      setPuzzleDepositList(result.data.puzzleDepositEvents.nodes);
    });
  }


  useEffect(() => {
    loadChallengeDepositList();
  }, [pubRefresh]);


  return (
    <Grid.Column width={8}>
      <PuzzleCommitSponsorship puzzle_hash={puzzle_hash} puzzleDepositList={puzzleDepositList} />
      <h3>Sponsor deposit info</h3>
      <Table>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Who</Table.Cell>
            <Table.Cell>Event bn</Table.Cell>
            <Table.Cell>Deposit</Table.Cell>
            <Table.Cell>Reason</Table.Cell>
          </Table.Row>
          {puzzleDepositList.map((sponsorDepositData, idx)=><Table.Row key={idx}>
            <Table.Cell><UserHomeLink user_address={sponsorDepositData.whoId} /></Table.Cell>
            <Table.Cell>{sponsorDepositData.eventBn}</Table.Cell>
            <Table.Cell>{sponsorDepositData.deposit}</Table.Cell>
            <Table.Cell>{sponsorDepositData.tip}</Table.Cell>
          </Table.Row>)}
        </Table.Body>
      </Table>
    </Grid.Column>
  );
}

export default function SponsorList (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash } = props;
  const { apollo_client, gql } = useAtoContext()
  return api.query && puzzle_hash && apollo_client && gql
    ? <Main {...props} />
    : null;
}
