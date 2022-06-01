import React, { useEffect, useState } from 'react';
import { Form, Input, Grid, Card, Statistic, TextArea, Label } from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import {useAtoContext} from "./AtoContext";
import KButton from "./KButton";

function Main (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash, challengeDepositList} = props;
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck} , extractErrorMsg} = useAtoContext();

  // Puzzle information.
  const [deposit, setDeposit] = useState(0);
  const [status, setStatus] = useState(null);
  // const [puzzleHash, setPuzzleHash] = useState('');
  useEffect(() => { }, [api.query.atochaModule]);

  function countDeposit (num) {
    const decimals = api.registry.chainDecimals;
    setDeposit(BigInt(num * (10 ** decimals)));
  }

  // function statusChange (newStatus) {
  //   if (newStatus.isFinalized) {
  //     const query_str = `
  //        query{
  //         challengeDepositEvents(filter: {
  //           puzzleHash:{
  //             equalTo: "${puzzle_hash}"
  //           }
  //         }){
  //           totalCount
  //         }
  //       } `;
  //     tryToPollCheck(query_str, updatePubRefresh, ()=>{}, challengeDepositList.length);
  //   }else{
  //   }
  // }


  async function freshList(successCall, failedCall) {
    const query_str = `
         query{
          challengeDepositEvents(filter: {
            puzzleHash:{
              equalTo: "${puzzle_hash}"
            }
          }){
            totalCount
          }
        } `
    tryToPollCheck(query_str, successCall, failedCall, challengeDepositList.length);
  }

  function handlerEvent(section, method, statusCallBack, data) {
    // atochaFinance.ChallengeDeposit
    if(section == 'atochaFinance' &&  method == 'ChallengeDeposit') {
      freshList(
        ()=>{
          updatePubRefresh()
          statusCallBack(1, "[Good]")
        },
        () => {
          statusCallBack(2, "[Get failed, please try to refresh the page]")
        }
      ) // update list
    }else if(section == 'system' &&  method == 'ExtrinsicFailed') {
      // module: {index: 22, error: 0}
      const failedData = data.toJSON()[0].module
      const failedMsg = extractErrorMsg(failedData.index, failedData.error)
      if(failedMsg) {
        statusCallBack(2, `[${failedMsg}]`)
      }else{
        statusCallBack(2, "[Unknown Mistake]")
      }
    }
  }

  function preCheckCall(buttonKey, currentStatus, statusCallBack) {
    console.log("currentStatus = ", currentStatus)
    if(currentStatus == 3) {
      alert('Have pending process.')
      return false
    }
    statusCallBack(0, "")
    return true
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
          {/*<TxButton*/}
          {/*    label='Submit'*/}
          {/*    type='SIGNED-TX'*/}
          {/*    setStatus={setStatus}*/}
          {/*    refStatus={statusChange}*/}
          {/*    attrs={{*/}
          {/*      palletRpc: 'atochaModule',*/}
          {/*      callable: 'commitChallenge',*/}
          {/*      inputParams: [puzzle_hash, deposit],*/}
          {/*      paramFields: [true, true]*/}
          {/*    }}*/}
          {/*/>*/}
          <KButton
            label={`Submit a challenge`}
            type={`SIGNED-TX`}
            attrs={{
              palletRpc: 'atochaModule',
              callable: 'commitChallenge',
              inputParams: [puzzle_hash, deposit],
              paramFields: [true, true]
            }}
            buttonKey={'puzzle_submit_challenge_on_click'}
            preCheckCall= {preCheckCall}
            handlerEvent= {handlerEvent}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}

export default function PuzzleCommitChallenge (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash, challengeDepositList} = props;
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck} } = useAtoContext();
  return api.query && puzzle_hash && apollo_client && gql && challengeDepositList
      ? <Main {...props} />
      : null;
}
