import React, { useEffect, useState } from 'react';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Table} from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import ArweaveTitle from "./ArweaveTitle";
import config from "../config";
import PuzzleAnswer from "./PuzzleAnswer";
import PuzzleCommitChallenge from "./PuzzleCommitChallenge";
import {useAtoContext} from "./AtoContext";
import PuzzleChallengeRaising from "./PuzzleChallengeRaising";
import {Link} from "react-router-dom";

function Main (props) {
  const { api, currentAccount } = useSubstrateState('');
  const { puzzle_hash } = props;
  const { apollo_client, gql } = useAtoContext()

  // Atocha user information.
  const [userBalance, setUserBalance] = useState(null);
  const [userPoints, setUserPoints] = useState(null);
  const [relationInfos, setRelationInfos] = useState(null);

  useEffect(() => {
    console.log("currentAccount = ", currentAccount)
    if (currentAccount) {
      loadAccountBalance();
      loadAccountPoints();
      loadReleationPuzzles()
    }
  }, [currentAccount, userBalance]);

  function loadAccountBalance() {
    currentAccount &&
    api.query.system
      .account(currentAccount.address, balance =>{
          setUserBalance(balance.data.free.toHuman());
      }) .then(unsub => {
    }) .catch(console.error)
  }

  function loadAccountPoints() {
    currentAccount &&
    api.query.atochaFinace
      .atoPointLedger(currentAccount.address, points =>{
        setUserPoints(points.toHuman())
      }) .then(unsub => {
    }) .catch(console.error)
  }

  async function loadReleationPuzzles() {
    if (!currentAccount){
      return;
    }
    console.log("currentAccount.address = ", currentAccount.address);
    apollo_client.query({
      query: gql`
          query{
              atochaUserStruct(id: "${currentAccount.address}"){
                  id,
                  ref_create_events{
                      nodes{
                          puzzleHash
                      }
                  },
                  ref_answer_events{
                      nodes{
                          puzzleInfoId,
                          resultType
                      }
                  },
                  ref_challenge_depoist_events{
                      nodes{
                          puzzleInfoId,
                          depositType
                      }
                  },
                  ref_deposit_events{
                      nodes{
                          puzzleInfoId,
                          kind
                      }
                  }
              }
          }
      `
    }).then(result => {
      console.log("result.data.atochaUserStruct = ", result.data.atochaUserStruct)
      setRelationInfos(result.data.atochaUserStruct)
    });
  }

  return (
    <Grid.Column width={8}>
      <Grid.Row>
        <h1>UserHome</h1>
        <div>CurrentAddress: {currentAccount?currentAccount.address:'loading...'}</div>
        <div>Balance: {userBalance?userBalance:'*'}</div>
        <div>Points: {userPoints?userPoints:'*'}</div>
      </Grid.Row>
      <Grid.Row>
        {relationInfos?<div>
          <h3>My created: </h3>
          <Table>
            <Table.Body>
            <Table.Row>
              <Table.Cell>Puzzle hash</Table.Cell>
            </Table.Row>
            {relationInfos.ref_create_events.nodes.map((data, idx)=><Table.Row key={idx}>
              <Table.Cell>
                <Link to={`/puzzle_detail/${data.puzzleHash}`}>{data?data.puzzleHash:'*'}</Link>
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
                <Table.Cell>Puzzle hash</Table.Cell>
                <Table.Cell>Result type</Table.Cell>
              </Table.Row>
              {relationInfos.ref_answer_events.nodes.map((data, idx)=><Table.Row key={idx}>
                <Table.Cell>
                  <Link to={`/puzzle_detail/${data.puzzleInfoId}`}>{data?data.puzzleInfoId:'*'}</Link>
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
                <Table.Cell>Puzzle hash</Table.Cell>
              </Table.Row>
              {relationInfos.ref_challenge_depoist_events.nodes.map((data, idx)=><Table.Row key={idx}>
                <Table.Cell>
                  <Link to={`/puzzle_detail/${data.puzzleInfoId}`}>{data?data.puzzleInfoId:'*'}</Link>
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
                <Table.Cell>Puzzle hash</Table.Cell>
              </Table.Row>
              {relationInfos.ref_deposit_events.nodes.map((data, idx)=><Table.Row key={idx}>
                <Table.Cell>
                  <Link to={`/puzzle_detail/${data.puzzleInfoId}`}>{data?data.puzzleInfoId:'*'}</Link>
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
