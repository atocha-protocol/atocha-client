import React, { useEffect, useState } from 'react';
import { Form, Input, Grid, Card, Statistic, TextArea, Label } from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import {useAtoContext} from "./AtoContext";

function Main (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash, challengeDepositList} = props;
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck} } = useAtoContext();


  // Puzzle information.
  const [deposit, setDeposit] = useState(0);
  const [status, setStatus] = useState(null);
  // const [puzzleHash, setPuzzleHash] = useState('');
  useEffect(() => {

  }, [api.query.atochaModule]);

  function countDeposit (num) {
    const decimals = api.registry.chainDecimals;
    setDeposit(BigInt(num * (10 ** decimals)));
  }

  function statusChange (newStatus) {
    if (newStatus.isFinalized) {
      const query_str = `
         query{
          challengeDepositEvents(filter: {
            puzzleHash:{
              equalTo: "${puzzle_hash}"
            }
          }){
            totalCount
          }
        } `;
      tryToPollCheck(query_str, updatePubRefresh, ()=>{}, challengeDepositList.length);
    }else{
    }
  }

  return (
    <Grid.Column width={8}>
      <Form>
        <Form.Field>
          Puzzle info: {puzzle_hash}
        </Form.Field>
        <Form.Field>
          <Input
              label='Add challenge Crowdfunding (Min 1Ato)'
              type='number'
              state='amount'
              onChange={(_, { value }) => countDeposit(value) }
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
                callable: 'challengeCrowdloan',
                inputParams: [puzzle_hash, deposit],
                paramFields: [true, true]
              }}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}

export default function PuzzleChallengeRaising (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash, challengeDepositList} = props;
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck} } = useAtoContext();
  return api.query && puzzle_hash && apollo_client && gql && challengeDepositList
      ? <Main {...props} />
      : null;
}
