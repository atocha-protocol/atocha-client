import React, { useEffect, useState } from 'react';
import {Form, Input, Grid, Card, Statistic, TextArea, Label} from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import AnswerList from "./AnswerList";
import {gql} from "@apollo/client";
import {useAtoContext} from "./AtoContext";

function Main (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash, answerList } = props;
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck} } = useAtoContext()

  // Puzzle information.
  const [answerTxt, setAnswerTxt] = useState('');
  const [answerExplain, setAnswerExplain] = useState('');
  const [status, setStatus] = useState(null);
  useEffect(() => {
  }, [api.query.atochaModule]);


  function statusChange (newStatus) {
    if (newStatus.isFinalized) {
      const query_str = `
         query{
          answerCreatedEvents(filter: {
            puzzleHash:{
              equalTo: "${puzzle_hash}"
            }
          }){
            totalCount
          }
        } `;
      tryToPollCheck(query_str, updatePubRefresh, ()=>{}, answerList.length);
    }else{
    }
  }

  return (
    <Grid.Column width={8}>
      <Form>
        <Form.Field>
          PuzzleHash: {puzzle_hash}
        </Form.Field>
        <Form.Field>
          <Input
              label='Answer text'
              type='text'
              onChange={(_, { value }) => setAnswerTxt(value) }
          />
        </Form.Field>
        <Form.Field>
          <div>Answer explain:</div>
          <TextArea
              onChange={(_, { value }) => setAnswerExplain(value) }
          />
        </Form.Field>
        <Form.Field style={{ textAlign: 'center' }}>
          <TxButton
              label='Submit'
              type='SIGNED-TX'
              setStatus={setStatus}
              refStatus={statusChange}
              attrs={{
                palletRpc: 'atochaModule',
                callable: 'answerPuzzle',
                inputParams: [puzzle_hash, answerTxt, answerExplain],
                paramFields: [true, true, true]
              }}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}

export default function PuzzleAnswer (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash } = props;
  const { apollo_client, gql } = useAtoContext()
  return api.query && puzzle_hash && apollo_client && gql
      ? <Main {...props} />
      : null;
}
