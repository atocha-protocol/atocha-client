import React, { useEffect, useState } from 'react';
import { Form, Input, Grid, Card, Statistic, TextArea, Label, Table, Container } from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';

function Main (props) {
  const { api } = useSubstrateState();

  // Puzzle information.
  const [exchangeInfo, setExchangeInfo] = useState([]);
  const [previousExchangeInfo, setPreviousExchangeInfo] = useState([]);

  const [status, setStatus] = useState(null);
  const [currentExchangeRewardEra, setCurrentExchangeRewardEra] = useState(0);
  const [previousExchangeRewardEra, setPreviousExchangeRewardEra] = useState(0);
  const [updateCount, setUpdateCount] = useState(0);


  useEffect(() => {
    api.query.atochaFinace.pointExchangeInfo(currentExchangeRewardEra).then(res => {
      console.log('exchangeInfo current = ', res.toHuman());
      setExchangeInfo(res.toHuman());
    });
    api.query.atochaFinace.pointExchangeInfo(previousExchangeRewardEra).then(res => {
      console.log('exchangeInfo previous = ', res.toHuman());
      setPreviousExchangeInfo(res.toHuman());
    });
    api.query.atochaFinace.currentExchangeRewardEra((era_opt) => {
      if (era_opt.isSome) {
        setCurrentExchangeRewardEra(era_opt.value.toNumber());
        setPreviousExchangeRewardEra(era_opt.value.toNumber()-1)
      }
    });
  }, [api.query.atochaModule, api.query.atochaFinace.pointExchangeInfo, currentExchangeRewardEra, previousExchangeRewardEra, updateCount]);

  function statusChange (newStatus) {
    if (newStatus.isFinalized) {
      console.log("Refresh list")
      setUpdateCount(updateCount+1)
    } else {
    }
  }
  return (
    <>
      <h1>Current reward era: {currentExchangeRewardEra}</h1>
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
      <h3>Previous reward era: {previousExchangeRewardEra}</h3>
      <Table celled striped size='small'>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Address</Table.Cell>
            <Table.Cell>Points</Table.Cell>
            <Table.Cell>Proportion</Table.Cell>
            <Table.Cell>Take Token</Table.Cell>
          </Table.Row>
          {previousExchangeInfo.map(infoData => <Table.Row>
            <Table.Cell>{infoData[0]}</Table.Cell>
            <Table.Cell>{infoData[1]}</Table.Cell>
            <Table.Cell>{infoData[2]?infoData[2].proportion?infoData[2].proportion:'Null':'Null'}</Table.Cell>
            <Table.Cell>{infoData[2]?infoData[2].takeToken?infoData[2].takeToken:'Null':'Null'}</Table.Cell>
          </Table.Row>)}
        </Table.Body>
      </Table>
      <Form>
        <Form.Field style={{ textAlign: 'center' }}>
          <TxButton
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
    </>
  );
}

export default function ApplyTokenReward (props) {
  const { api } = useSubstrateState();
  return api.query
    ? <Main {...props} />
    : null;
}
