import React, { useEffect, useState } from 'react';
import { Form, Input, Grid, Card, Statistic, TextArea, Label, Table, Container } from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import {useAtoContext} from "./AtoContext";
import UserHomeLink from "./UserHomeLink";

function Main (props) {
  const { api } = useSubstrateState();
  const { chainData: {userPoints}, puzzleSets: {pubRefresh, updatePubRefresh}} = useAtoContext()
  // Puzzle information.
  const [exchangeInfo, setExchangeInfo] = useState([]);
  const [previousExchangeInfo, setPreviousExchangeInfo] = useState([]);

  const [status, setStatus] = useState(null);
  const [lastUpBn, setLastUpBn] = useState('*');
  const [currentExchangeRewardEra, setCurrentExchangeRewardEra] = useState(0);
  const [previousExchangeRewardEra, setPreviousExchangeRewardEra] = useState(0);

  useEffect(() => {
    api.query.atochaFinance.pointExchangeInfo(currentExchangeRewardEra).then(res => {
      console.log('exchangeInfo current = ', res.toHuman());
      setExchangeInfo(res.toHuman());
    });
    api.query.atochaFinance.pointExchangeInfo(previousExchangeRewardEra).then(res => {
      console.log('exchangeInfo previous = ', res.toHuman());
      setPreviousExchangeInfo(res.toHuman());
    });
    api.query.atochaFinance.currentExchangeRewardEra((era_opt) => {
      if (era_opt.isSome) {
        setCurrentExchangeRewardEra(era_opt.value.toNumber());
        setPreviousExchangeRewardEra(era_opt.value.toNumber()-1)
      }
    });
    loadLastUpdateBN();
  }, [api.query.atochaModule, api.query.atochaFinance.pointExchangeInfo, currentExchangeRewardEra, previousExchangeRewardEra, pubRefresh]);

  function loadLastUpdateBN() {
    api.query.atochaFinance
      .lastUpdateBlockInfoOfPointExchage(bn =>{
        setLastUpBn(bn.toHuman())
      }) .then(unsub => {

    }) .catch(console.error)
  }

  function statusChange (newStatus) {
    if (newStatus.isFinalized) {
      console.log("Refresh list")
      updatePubRefresh()
    } else {
    }
  }
  return (
    <Grid.Column width={15}>
      <Grid.Row>
        <div>
          <h1>Current reward era: {currentExchangeRewardEra}</h1>
        </div>
        <div>Refresh block number : {lastUpBn} / My points: {userPoints}</div>
      </Grid.Row>
      <Grid.Row>
      <Table celled striped size='small'>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Address</Table.Cell>
            <Table.Cell>Points</Table.Cell>
            <Table.Cell>Proportion</Table.Cell>
            <Table.Cell>Take Token</Table.Cell>
          </Table.Row>
          {exchangeInfo.map((infoData,idx) => <Table.Row key={idx}>
            <Table.Cell><UserHomeLink user_address={infoData[0]} /></Table.Cell>
            <Table.Cell>{infoData[1]}</Table.Cell>
            <Table.Cell>{infoData[2]?infoData[2].proportion?infoData[2].proportion:'Pending':'Pending'}</Table.Cell>
            <Table.Cell>{infoData[2]?infoData[2].takeToken?infoData[2].takeToken:'Further':'Further'}</Table.Cell>
          </Table.Row>)}
        </Table.Body>
      </Table>
      </Grid.Row>
      <Grid.Row>
      <h3>Previous reward era: {previousExchangeRewardEra}</h3>
      </Grid.Row>
      <Grid.Row>
      <Table celled striped size='small'>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Who</Table.Cell>
            <Table.Cell>Points</Table.Cell>
            <Table.Cell>Proportion</Table.Cell>
            <Table.Cell>Take Token</Table.Cell>
          </Table.Row>
          {previousExchangeInfo.map((infoData, idx) => <Table.Row key={idx}>
            <Table.Cell><UserHomeLink user_address={infoData[0]} /></Table.Cell>
            <Table.Cell>{infoData[1]}</Table.Cell>
            <Table.Cell>{infoData[2]?infoData[2].proportion?infoData[2].proportion:'Err':'Err'}</Table.Cell>
            <Table.Cell>{infoData[2]?infoData[2].takeToken?infoData[2].takeToken:'Err':'Err'}</Table.Cell>
          </Table.Row>)}
        </Table.Body>
      </Table>
      </Grid.Row>
      <Grid.Row>
      <Form>
        <Form.Field style={{ textAlign: 'center' }}>
          <TxButton
              label='Apply point reward'
              type='SIGNED-TX'
              setStatus={setStatus}
              refStatus={statusChange}
              attrs={{
                palletRpc: 'atochaFinance',
                callable: 'applyPointReward',
                inputParams: [],
                paramFields: []
              }}
          />
        </Form.Field>
        <Form.Field>
          <div style={{ overflowWrap: 'break-word' }}>{status}</div>
        </Form.Field>
      </Form>
      </Grid.Row>
    </Grid.Column>
  );
}

export default function ApplyTokenReward (props) {
  const { api } = useSubstrateState();
  const { chainData: {userPoints} } = useAtoContext()
  return api.query && userPoints
    ? <Main {...props} />
    : null;
}
