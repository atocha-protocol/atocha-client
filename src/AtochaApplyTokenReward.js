import React, { useEffect, useState } from 'react';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Table, Container} from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;

  // Puzzle information.
  const [deposit, setDeposit] = useState(0);
  const [status, setStatus] = useState(null);

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
      <h1>Atocha - Step 5 Apply reward usecase.</h1>

      <Form>
          <Form.Field>
              <Container>
                  <Grid.Row>
                      <Table celled striped size='small'>
                          <Table.Body>
                              <Table.Row>
                                  <Table.Cell>Ranking</Table.Cell>
                                  <Table.Cell>Address</Table.Cell>
                              </Table.Row>
                          </Table.Body>
                      </Table>
                  </Grid.Row>
              </Container>
          </Form.Field>
        <Form.Field style={{ textAlign: 'center' }}>
          <TxButton
              accountPair={accountPair}
              label='Submit'
              type='SIGNED-TX'
              setStatus={setStatus}
              refStatus={statusChange}
              attrs={{
                palletRpc: 'atochaFinace',
                callable: 'applyPointReward',
                inputParams: [],
                paramFields: []
              }}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}

export default function AtochaApplyTokenReward (props) {
  const { api } = useSubstrate();
  return api.query.templateModule && api.query.templateModule.something
    ? <Main {...props} />
    : null;
}
