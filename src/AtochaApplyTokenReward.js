import React, { useEffect, useState } from 'react';
import { Form, Input, Grid, Card, Statistic, TextArea, Label, Table, Container } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;

  // Puzzle information.
  const [exchangeInfo, setExchangeInfo] = useState([]);
  const [status, setStatus] = useState(null);
  const [eraNumber, setEraNumber] = useState(0);
  const [currentExchangeRewardEra, setCurrentExchangeRewardEra] = useState(0);

  useEffect(() => {
    // atochaFinace.pointExchangeInfo
    api.query.atochaFinace.pointExchangeInfo(eraNumber).then(res => {
      console.log('exchangeInfo = ', res.toHuman());
      setExchangeInfo(res.toHuman());
    });
    api.query.atochaFinace.currentExchangeRewardEra((era_opt) => {
      if (era_opt.isSome) {
        setCurrentExchangeRewardEra(era_opt.value.toNumber());
      }
    });
  }, [api.query.atochaModule, api.query.atochaFinace.pointExchangeInfo, eraNumber]);

  function statusChange (newStatus) {
    if (newStatus.isFinalized) {
    } else {
    }
  }
  return (
    <Grid.Column width={8}>
      <h1>Atocha - Step 5 Apply reward usecase.</h1>
        <Grid.Row>
            <div>Current reward era: {currentExchangeRewardEra}</div>
        </Grid.Row>
      <Form>
          <Form.Field>
              <Input
                  label='Check Era Number'
                  type='number'
                  onChange={(_, { value }) => setEraNumber(value) }
              />
          </Form.Field>
          <Form.Field>
              <Container>
                  <Grid.Row>
                      <Table celled striped size='small'>
                          <Table.Body>
                              <Table.Row>
                                  <Table.Cell>Address</Table.Cell>
                                  <Table.Cell>Points</Table.Cell>
                                  <Table.Cell>Proportion</Table.Cell>
                                  <Table.Cell>Take Token</Table.Cell>
                              </Table.Row>
                              {exchangeInfo.map(infoData => <Table.Row>
                                  <Table.Cell>{infoData[0]}</Table.Cell>
                                  <Table.Cell>{infoData[1]}</Table.Cell>
                                  <Table.Cell>{infoData[2]?infoData[2].proportion?infoData[2].proportion:'Null':'Null'}</Table.Cell>
                                  <Table.Cell>{infoData[2]?infoData[2].takeToken?infoData[2].takeToken:'Null':'Null'}</Table.Cell>
                              </Table.Row>)}
                          </Table.Body>
                      </Table>
                  </Grid.Row>
              </Container>
          </Form.Field>

        <Form.Field style={{ textAlign: 'center' }}>
          <TxButton
              accountPair={accountPair}
              label='Apply point reward'
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
  return api.query
    ? <Main {...props} />
    : null;
}
