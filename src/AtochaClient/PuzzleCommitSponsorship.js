import React, { useEffect, useState } from 'react';
import { Form, Input, Grid, Card, Statistic, TextArea, Label } from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import {useAtoContext} from "./AtoContext";

function Main (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash, puzzleDepositList } = props;
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck} } = useAtoContext()

  // Puzzle information.
  const [deposit, setDeposit] = useState(0);
  const [status, setStatus] = useState(null);
  const [sponsorshipExplain, setSponsorshipExplain] = useState(null);

  useEffect(() => {

  }, [api.query.atochaModule]);

  function countDeposit (num) {
    const decimals = api.registry.chainDecimals;
    setDeposit(BigInt(num * (10 ** decimals)));
  }

  function statusChange (newStatus) {
    console.log(newStatus)
    if (newStatus.isInBlock) {
      console.log("Is InBlock")
      setStatus("Extrinsic success.")
    } else if (newStatus.isFinalized) {
      setStatus("isFinalized.")
      const query_str = `
         query{
          puzzleDepositEvents(filter: {
            puzzleInfoId:{
              equalTo: "${puzzle_hash}"
            }
          }){
            totalCount
          }
        } `;
      tryToPollCheck(query_str, updatePubRefresh, ()=>{}, puzzleDepositList.length);
    } else {
      console.log("Not InBlock")
      setStatus("Extrinsic failed.")
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
              label='Deposit (Min 1Ato)'
              type='number'
              state='amount'
              onChange={(_, { value }) => countDeposit(value) }
          />
        </Form.Field>
        <Form.Field>
          <div>Reasons for less than 1000 characters:</div>
          <TextArea
              onChange={(_, { value }) => setSponsorshipExplain(value) }
          />
        </Form.Field>
        <Form.Field style={{ textAlign: 'center' }}>
          {/* additionalSponsorship(puzzleHash, amount, reason) */}
          <TxButton
              label='Submit'
              type='SIGNED-TX'
              setStatus={setStatus}
              refStatus={statusChange}
              attrs={{
                palletRpc: 'atochaModule',
                callable: 'additionalSponsorship',
                inputParams: [puzzle_hash, deposit, sponsorshipExplain],
                paramFields: [true, true, sponsorshipExplain?true:false]
              }}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}

export default function PuzzleCommitSponsorship (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash } = props;
  const {apollo_client, gql } = useAtoContext()
  return api.query && puzzle_hash && apollo_client && gql
      ? <Main {...props} />
      : null;
}
