import React, { useEffect, useState } from 'react';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Table, Button} from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import ArweaveTitle from "./ArweaveTitle";
import config from "../config";
import PuzzleAnswer from "./PuzzleAnswer";
import PuzzleCommitChallenge from "./PuzzleCommitChallenge";
import {useAtoContext} from "./AtoContext";
import PuzzleChallengeRaising from "./PuzzleChallengeRaising";
import {Link} from "react-router-dom";
import {
  useParams
} from "react-router-dom";
import PuzzleDetailLink from "./PuzzleDetailLink";
import {web3FromSource} from "@polkadot/extension-dapp";

function Main (props) {
  const { api, currentAccount } = useSubstrateState('');
  const { puzzle_hash } = props;
  const { account_id } = useParams();
  const { apollo_client, gql,  chainData: {pubBlockNumber, updatePubRefresh, userPoints} } = useAtoContext()

  // Atocha user information.
  const [userBalance, setUserBalance] = useState(null);
  const [relationInfos, setRelationInfos] = useState(null);
  const [currentAccountId, setCurrentAccountId] = useState(null);

  useEffect(async () => {
    console.log("currentAccount = ", currentAccount)
    if (currentAccount) {
      fillCurrentAccountId();
      loadAccountBalance();
      await loadReleationPuzzles();
    }
  }, [currentAccount, userBalance, pubBlockNumber]);

  function fillCurrentAccountId(){
    if(account_id == 'self') {
      setCurrentAccountId(currentAccount.address);
    }else{
      setCurrentAccountId(account_id);
    }
  }

  function loadAccountBalance() {
    currentAccount &&
    api.query.system
      .account(currentAccountId, balance =>{
          setUserBalance(balance.data.free.toHuman());
      }) .then(unsub => {
    }) .catch(console.error)
  }

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
      fromAcct = accountPair;
    }
    return fromAcct;
  };

  async function takeAnswerReward(hash) {
    const fromAcct = await getFromAcct();
    console.log(fromAcct);
    const unsub = await api.tx.atochaModule
      .takeAnswerReward(hash)
      .signAndSend(fromAcct, (result) => {
        // setStatus(`submit status: ${result.status}`);
        if (result.status.isInBlock) {
          // setStatus(`submit status: ${result.status} - ${result.status.asInBlock}`);
        } else if (result.status.isFinalized) {
          // setStatus(`submit status: ${result.status} - ${result.status.asFinalized}`);
          unsub();
          updatePubRefresh();
        }
      });
  }

  function remainBonusItems(nodes){
    let result = [];
    let duplication_keys = [];
    for(let k in nodes) {
      let dynPuzzleStatus = nodes[k].puzzleInfo.dynPuzzleStatus;
      let dynChallengeStatus = nodes[k].puzzleInfo.dynChallengeStatus;
      let dynRaiseDeadline = nodes[k].puzzleInfo.dynRaiseDeadline;
      let dynChallengeDeadline = nodes[k].puzzleInfo.dynChallengeDeadline;
      let remain = false;
      if(dynPuzzleStatus == "PUZZLE_STATUS_IS_FINAL" && dynChallengeStatus != "JudgePassed") {
        remain=true;
      }else if(dynChallengeStatus == "JudgeRejected") {
        remain=true;
      }else if(dynChallengeStatus == "RaiseFundsBack") {
        remain=true;
      }else if(dynPuzzleStatus == "PUZZLE_STATUS_IS_SOLVED" &&
        dynRaiseDeadline == 0 &&
        dynChallengeDeadline <= pubBlockNumber
      ){
        remain=true;
      }else if(dynPuzzleStatus == "PUZZLE_STATUS_IS_SOLVED" &&
        dynChallengeStatus =="Raise" &&
        dynRaiseDeadline > 0 &&
        dynRaiseDeadline <= pubBlockNumber
      ){
        remain=true;
      }
      if(remain){
        if(nodes[k].puzzleInfoId && !duplication_keys.includes(nodes[k].puzzleInfoId)){
          duplication_keys.push(nodes[k].puzzleInfoId);
          result.push(nodes[k]);
        }
      }
    }
    return result;
  }

  async function loadReleationPuzzles() {
    if (!currentAccountId){
      return;
    }
    console.log("currentAccount.address = ", currentAccountId);
    //(first: 0, last: 10000)
    apollo_client.query({
      query: gql`
          query{
              atochaUserStruct(id: "${currentAccountId}"){
                  id,
                  ref_create_events(first: 0, last: 10000){
                      nodes{
                          puzzleHash
                      }
                  },
                  ref_answer_events(first: 0, last: 10000){
                      nodes{
                          puzzleInfoId,
                          resultType,
                          whoId,
                          puzzleInfo{
                              dynPuzzleStatus,
                              dynChallengeStatus,
                              dynRaiseDeadline,
                              dynChallengeDeadline
                          }
                      }
                  },
                  ref_challenge_depoist_events(first: 0, last: 10000){
                      nodes{
                          puzzleInfoId,
                          depositType
                      }
                  },
                  ref_deposit_events(first: 0, last: 10000){
                      nodes{
                          puzzleInfoId,
                          kind
                      }
                  }
              }
          }
      `
    }).then(result => {
      setRelationInfos(result.data.atochaUserStruct)
    });
  }

  return (
    <Grid.Column width={8}>
      <Grid.Row>
        <h1>UserHome</h1>
        <div>CurrentAddress: {currentAccountId?currentAccountId:'loading...'}</div>
        <div>Balance: {userBalance?userBalance:'*'}</div>
        <div>Points: {userPoints?userPoints:'*'}</div>
      </Grid.Row>
      <Grid.Row>

        {relationInfos?<div>
          <h3>My created: </h3>
          <Table>
            <Table.Body>
            <Table.Row>
              <Table.Cell>Puzzle title</Table.Cell>
            </Table.Row>
            {relationInfos.ref_create_events.nodes.map((data, idx)=><Table.Row key={idx}>
              <Table.Cell>
                {data?<ArweaveTitle  puzzle_hash={data.puzzleHash} /> : '*'}
              </Table.Cell>
            </Table.Row>)}
            </Table.Body>
          </Table>
        </div>:'No data.'}
      </Grid.Row>
      <Grid.Row>
        {relationInfos?<div>
          <h3>My answers (all include solved): </h3>
          <Table>
            <Table.Body>
              <Table.Row>
                <Table.Cell>Puzzle title</Table.Cell>
                <Table.Cell>Puzzle hash</Table.Cell>
                <Table.Cell>Result type</Table.Cell>
              </Table.Row>
              {relationInfos.ref_answer_events.nodes.map((data, idx)=><Table.Row key={idx}>
                <Table.Cell>
                  {data?<ArweaveTitle  puzzle_hash={data.puzzleInfoId} /> : '*'}
                </Table.Cell>
                <Table.Cell>
                  {data?data.puzzleInfoId : '*'}
                </Table.Cell>
                <Table.Cell>
                  {data?data.resultType:'*'}
                </Table.Cell>
              </Table.Row>)}
            </Table.Body>
          </Table>
        </div>:'No data.'}
      </Grid.Row>
      <Grid.Row>
        {relationInfos?<div>
          <h3>My challenged: </h3>
          <Table>
            <Table.Body>
              <Table.Row>
                <Table.Cell>Puzzle title</Table.Cell>
                <Table.Cell>Type</Table.Cell>
              </Table.Row>
              {relationInfos.ref_challenge_depoist_events.nodes.map((data, idx)=><Table.Row key={idx}>
                <Table.Cell>
                  {data?<ArweaveTitle  puzzle_hash={data.puzzleInfoId} /> : '*'}
                </Table.Cell>
                <Table.Cell>
                  {data?data.depositType:'*'}
                </Table.Cell>
              </Table.Row>)}
            </Table.Body>
          </Table>
        </div>:'No data.'}
      </Grid.Row>
      <Grid.Row>
        {relationInfos?<div>
          <h3>My sponsored: </h3>
          <Table>
            <Table.Body>
              <Table.Row>
                <Table.Cell>Puzzle title</Table.Cell>
              </Table.Row>
              {relationInfos.ref_deposit_events.nodes.map((data, idx)=><Table.Row key={idx}>
                <Table.Cell>
                  {data?<ArweaveTitle  puzzle_hash={data.puzzleInfoId} /> : '*'}
                </Table.Cell>
                <Table.Cell>
                  {data?data.kind:'*'}
                </Table.Cell>
              </Table.Row>)}
            </Table.Body>
          </Table>
        </div>:'No data.'}
      </Grid.Row>
    </Grid.Column>
  );
}

export default function UserHome (props) {
  const { api } = useSubstrateState();
  const { apollo_client, gql } = useAtoContext()
  return api.query && apollo_client && gql
    ? <Main {...props} />
    : <h1>No user infos.</h1>;
}
