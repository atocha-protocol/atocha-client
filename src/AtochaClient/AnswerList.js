import React, { useEffect, useState } from 'react';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Table} from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import ArweaveTitle from "./ArweaveTitle";
import config from "../config";
import PuzzleAnswer from "./PuzzleAnswer";
import {useAtoContext} from "./AtoContext";
import UserHomeLink from "./UserHomeLink";

function Main (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash } = props;
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck} } = useAtoContext()

  // Puzzle information.
  const [answerList, setAnswerList] = useState([]);

  async function loadAnswerList() {
    console.log("Double run answer-list.");
    if (!puzzle_hash){
      return;
    }
    apollo_client.query({
      query: gql`
        query{
          answerCreatedEvents(last: 1000, filter: {
            puzzleHash:{
              equalTo: "${puzzle_hash}"
            }
          }){
            nodes{
              id,
              whoId,
              answerContent,
              eventBn,
              resultType
            }
          }
        }
      `
    }).then(result => {
      console.log("result.data. = ", result.data); // answerCreatedEvents
      setAnswerList(result.data.answerCreatedEvents.nodes);
    });
  }


  useEffect(() => {

    loadAnswerList();
  }, [pubRefresh]);

  return (
    <Grid.Column width={8}>
      <PuzzleAnswer puzzle_hash={puzzle_hash} answerList={answerList} />
      <h3>Answer history</h3>
      <Table>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Creator</Table.Cell>
            <Table.Cell>Answer</Table.Cell>
            <Table.Cell>Event bn</Table.Cell>
            <Table.Cell>Match result</Table.Cell>
          </Table.Row>
          {answerList.map((answerData, idx)=><Table.Row key={idx}>
            <Table.Cell><UserHomeLink user_address={answerData.whoId} /></Table.Cell>
            <Table.Cell>{answerData.answerContent}</Table.Cell>
            <Table.Cell>{answerData.eventBn}</Table.Cell>
            <Table.Cell>{answerData.resultType}</Table.Cell>
          </Table.Row>)}
        </Table.Body>
      </Table>
    </Grid.Column>
  );
}

export default function AnswerList (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash,  } = props;
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck} } = useAtoContext();
  return api.query && puzzle_hash && apollo_client && gql
    ? <Main {...props} />
    : null;
}
