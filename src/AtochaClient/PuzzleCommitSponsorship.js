import React, { useEffect, useState } from 'react';
import { Form, Input, Grid, Card, Statistic, TextArea, Label } from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import {useAtoContext} from "./AtoContext";
import KButton from "./KButton";

function Main (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash, puzzleDepositList } = props;
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck}, extractErrorMsg } = useAtoContext()

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

  // function statusChange (newStatus) {
  //   console.log(newStatus)
  //   if (newStatus.isInBlock) {
  //     console.log("Is InBlock")
  //     setStatus("Extrinsic success.")
  //   } else if (newStatus.isFinalized) {
  //     setStatus("isFinalized.")
  //     const query_str = `
  //        query{
  //         puzzleDepositEvents(filter: {
  //           puzzleInfoId:{
  //             equalTo: "${puzzle_hash}"
  //           }
  //         }){
  //           totalCount
  //         }
  //       } `;
  //     tryToPollCheck(query_str, updatePubRefresh, ()=>{}, puzzleDepositList.length);
  //   } else {
  //     console.log("Not InBlock")
  //     setStatus("Extrinsic failed.")
  //   }
  // }

  async function freshList(successCall, failedCall) {
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
    tryToPollCheck(query_str, successCall, failedCall, puzzleDepositList.length);
  }

  function handlerEvent(section, method, statusCallBack, data) {
    // atochaFinance.PuzzleDeposit
    if(section == 'atochaFinance' &&  method == 'PuzzleDeposit') {
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
        <Form.Field>
          <div>Reasons for less than 1000 characters:</div>
          <TextArea
              onChange={(_, { value }) => setSponsorshipExplain(value) }
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
          {/*      callable: 'additionalSponsorship',*/}
          {/*      inputParams: [puzzle_hash, deposit, sponsorshipExplain],*/}
          {/*      paramFields: [true, true, sponsorshipExplain?true:false]*/}
          {/*    }}*/}
          {/*/>*/}

          <KButton
            label={`Submit Sponsorship`}
            type={`SIGNED-TX`}
            attrs={{
              palletRpc: 'atochaModule',
              callable: 'additionalSponsorship',
              inputParams: [puzzle_hash, deposit, sponsorshipExplain?sponsorshipExplain:""],
              paramFields: [true, true, true]
            }}
            buttonKey={'puzzle_submit_sponsorship_on_click'}
            preCheckCall= {preCheckCall}
            handlerEvent= {handlerEvent}
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
