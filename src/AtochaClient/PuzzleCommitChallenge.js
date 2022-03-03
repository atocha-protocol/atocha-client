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
  // const [puzzleHash, setPuzzleHash] = useState('');
  useEffect(() => {


    // Subscribe to system events via storage
    api.query.system.events((events) => {
      console.log(`\nReceived ${events.length} events:`);

      // Loop through the Vec<EventRecord>
      events.forEach((record) => {
        // Extract the phase, event and the event types
        const { event, phase } = record;
        const types = event.typeDef;

        // Show what we are busy with
        console.log(`\t${event.section}:${event.method}:: (phase=${phase.toString()})`);
        console.log(`\t\t${event.meta}`);

        // Loop through each of the parameters, displaying the type and data
        event.data.forEach((data, index) => {
          console.log(`\t\t\t${types[index].type}: ${data.toString()}`);
        });
      });
    });

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
        <Form.Field style={{ textAlign: 'center' }}>
          <TxButton
              label='Submit'
              type='SIGNED-TX'
              setStatus={setStatus}
              refStatus={statusChange}
              attrs={{
                palletRpc: 'atochaModule',
                callable: 'commitChallenge',
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

export default function PuzzleCommitChallenge (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash, apollo_client, gql } = props;
  return api.query && puzzle_hash && apollo_client && gql
      ? <Main {...props} />
      : null;
}
