import React, { useEffect, useState } from 'react';
import {Form, Input, Grid, Card, Statistic, TextArea, Label} from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import AnswerList from "./AnswerList";
import {gql} from "@apollo/client";

function Main (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash, apollo_client, gql } = props;

  // Puzzle information.
  const [answerTxt, setAnswerTxt] = useState('');
  const [answerExplain, setAnswerExplain] = useState('');
  const [status, setStatus] = useState(null);
  useEffect(() => {
  }, [api.query.atochaModule]);


  function statusChange (newStatus) {
    if (newStatus.isFinalized) {
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
        {/*<AnswerList puzzle_hash={puzzle_hash} apollo_client={apollo_client} gql={gql} />*/}
      </Form>
    </Grid.Column>
  );
}

export default function PuzzleAnswer (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash, apollo_client, gql } = props;
  return api.query && puzzle_hash && apollo_client && gql
      ? <Main {...props} />
      : null;
}
