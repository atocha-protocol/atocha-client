import React, { useEffect, useState } from 'react';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Button} from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import AnswerList from "./AnswerList";
import {gql} from "@apollo/client";
import {useAtoContext} from "./AtoContext";
import {web3FromSource} from "@polkadot/extension-dapp";
import KButton from "./KButton";

function Main (props) {
  const { api, currentAccount } = useSubstrateState();
  const { puzzle_hash, answerList } = props;
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck}, extractErrorMsg} = useAtoContext()

  // Puzzle information.
  const [answerTxt, setAnswerTxt] = useState('');
  const [answerExplain, setAnswerExplain] = useState('');
  const [statusTxt, setStatusTxt] = useState(null);
  useEffect(() => {
  }, [api.query.atochaModule]);


  const getFromAcct = async () => {
    const {
      address,
      meta: { source, isInjected }
    } = currentAccount;
    let fromAcct;
    if (isInjected) {
      const injected = await web3FromSource(source);
      fromAcct = address;
      api.setSigner(injected.signer);
    } else {
      fromAcct = null;
    }
    return fromAcct;
  };

  function handlerEvent(section, method, statusCallBack, data) {
    if(section == 'atochaModule' &&  method == 'AnswerCreated') {
      freshList(
        ()=>{
          updatePubRefresh()
          statusCallBack(1, "[Good]")
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

  async function freshList(successCall) {
    const query_str = `
             query{
              answerCreatedEvents(filter: {
                puzzleHash:{
                  equalTo: "${puzzle_hash}"
                }
              }){
                totalCount
              }
            } `;
    tryToPollCheck(query_str, successCall, ()=>{}, answerList.length);
  }

  // async function doAnswerPuzzle() {
  //   const fromAcct = await getFromAcct();
  //   api.tx.atochaModule
  //     .answerPuzzle(puzzle_hash, answerTxt, answerExplain)
  //     .signAndSend(fromAcct, {}, ({events = [], status}) => {
  //       console.log('Transaction status:', status.type);
  //
  //       if (status.isInBlock) {
  //         console.log('Included at block hash', status.asInBlock.toHex());
  //         console.log('Events:');
  //
  //         events.forEach(({event: {data, method, section}, phase}) => {
  //           console.log('get events \t', phase.toString(), `: ${section}.${method}`, data.toString());
  //           // atochaModule.AnswerCreated
  //           if (`${section}.${method}` == 'system.ExtrinsicFailed') {
  //             setStatusTxt(`${section}.${method} = ${data.toString()}`)
  //           }
  //         });
  //       } else if (status.isFinalized) {
  //         // setStatusTxt(`${statusTxt}\nFinalized`)
  //         const query_str = `
  //            query{
  //             answerCreatedEvents(filter: {
  //               puzzleHash:{
  //                 equalTo: "${puzzle_hash}"
  //               }
  //             }){
  //               totalCount
  //             }
  //           } `;
  //         tryToPollCheck(query_str, updatePubRefresh, ()=>{}, answerList.length);
  //       }
  //     });
  // }

  // function statusChange (newStatus) {
  //   if (newStatus.isFinalized) {
  //     const query_str = `
  //        query{
  //         answerCreatedEvents(filter: {
  //           puzzleHash:{
  //             equalTo: "${puzzle_hash}"
  //           }
  //         }){
  //           totalCount
  //         }
  //       } `;
  //     tryToPollCheck(query_str, updatePubRefresh, ()=>{}, answerList.length);
  //   }else{
  //   }
  // }

  return (
    <Grid.Column width={8}>
      <Form>
        <Form.Field>
          PuzzleHash: {puzzle_hash}
        </Form.Field>
        <Form.Field>
          <Input
              label='Answer text'
              type='text'
              onChange={(_, { value }) => setAnswerTxt(value) }
          />
        </Form.Field>
        <Form.Field>
          <div>Answer explain:</div>
          <TextArea
              onChange={(_, { value }) => setAnswerExplain(value) }
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
          {/*      callable: 'answerPuzzle',*/}
          {/*      inputParams: [puzzle_hash, answerTxt, answerExplain],*/}
          {/*      paramFields: [true, true, true]*/}
          {/*    }}*/}
          {/*/>*/}
          {/*<Button onClick={()=>doAnswerPuzzle()}>Submit</Button>*/}
          <KButton
            label={`Kami new button with check events. `}
            type={`SIGNED-TX`}
            attrs={{
              palletRpc: 'atochaModule',
              callable: 'answerPuzzle',
              inputParams: [puzzle_hash, answerTxt, answerExplain],
              paramFields: [true, true, true],

            }}
            buttonKey={'puzzle_answer_on_click'}
            preCheckCall= {preCheckCall}
            handlerEvent= {handlerEvent}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{statusTxt}</div>
      </Form>
    </Grid.Column>
  );
}

export default function PuzzleAnswer (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash } = props;
  const { apollo_client, gql } = useAtoContext()
  return api.query && puzzle_hash && apollo_client && gql
      ? <Main {...props} />
      : null;
}
