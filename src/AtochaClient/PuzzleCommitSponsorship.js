import React, { useEffect, useState } from 'react';
import { Form, Input, Grid, Card, Statistic, TextArea, Label } from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';

function Main (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash, apollo_client, gql } = props;

  // Puzzle information.
  const [deposit, setDeposit] = useState(0);
  const [status, setStatus] = useState(null);
  const [sponsorshipExplain, setSponsorshipExplain] = useState(null);
  // const [puzzleHash, setPuzzleHash] = useState('');
  useEffect(() => {

  }, [api.query.atochaModule]);

  function countDeposit (num) {
    const decimals = api.registry.chainDecimals;
    setDeposit(BigInt(num * (10 ** decimals)));
  }

  function statusChange (newStatus) {
    if (newStatus.isFinalized) {
    } else {
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
  const { puzzle_hash, apollo_client, gql } = props;
  return api.query && puzzle_hash && apollo_client && gql
      ? <Main {...props} />
      : null;
}
