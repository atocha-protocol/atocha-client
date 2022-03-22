import React, { useEffect, useState } from 'react';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Table} from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import ArweaveTitle from "./ArweaveTitle";
import config from "../config";
import PuzzleAnswer from "./PuzzleAnswer";
import {useAtoContext} from "./AtoContext";

function Main (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash } = props;
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck} } = useAtoContext()

  // Puzzle information.
  const [answerList, setAnswerList] = useState([]);

  async function loadAnswerList() {
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
  }, [setAnswerList, pubRefresh]);

  return (
    <Grid.Column width={8}>
      <PuzzleAnswer puzzle_hash={puzzle_hash} answerList={answerList} />
      <h3>Answer history</h3>
      <Table>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Answer</Table.Cell>
            <Table.Cell>Event bn</Table.Cell>
            <Table.Cell>Match result</Table.Cell>
          </Table.Row>
          {answerList.map((answerData, idx)=><Table.Row key={idx}>
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
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck} } = useAtoContext()
  return api.query && puzzle_hash && apollo_client && gql && pubRefresh
    ? <Main {...props} />
    : null;
}
