import React, { useEffect, useState } from 'react';
import sha256 from 'sha256';
import { Form, Input, Grid, Card, Statistic, TextArea, Label } from 'semantic-ui-react';
import axios from 'axios';

import config from '../config';

import { useSubstrate } from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import MakeAnswerSha256WithSimple from '../units/MakeAnswerSha256';
import { web3FromSource } from '@polkadot/extension-dapp';

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  useApolloClient,
  gql
} from "@apollo/client";

function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;
  const getFromAcct = async () => {
    const {
      address,
      meta: { source, isInjected }
    } = accountPair;
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
  const apollo_client = new ApolloClient({
    uri: 'http://localhost:3010',
    cache: new InMemoryCache()
  });

  async function loadPuzzleCreateEventStatus(puzzle_hash) {
    if (puzzle_hash === undefined || puzzle_hash === "") {
      setPuzzleStatus(0);
      return;
    }
    const query_str = `
      query{
          puzzleCreatedEvents(filter:{
            puzzleHash: {equalTo: "${puzzle_hash}"}
          }){
            totalCount
          }
        }
    `;
    apollo_client.query({
      query: gql(query_str),
      fetchPolicy: 'no-cache'
    }).then(result => {
      console.log("result.data. = ", puzzleStatusInterval, result.data.puzzleCreatedEvents.totalCount); // puzzleCreatedEvents
      if (result.data.puzzleCreatedEvents.totalCount > 0 && puzzleStatusInterval) {
        console.log("loadPuzzleCreateEventStatus C ---");
        clearInterval(puzzleStatusInterval);
      }
      setPuzzleStatus(result.data.puzzleCreatedEvents.totalCount);
    });
  }

  // Puzzle information.
  const [answerHash, setAnswerHash] = useState('');
  const [status, setStatus] = useState(null);
  const [storageLength, setStorageLength] = useState('');
  const [storageHash, setStorageHash] = useState('');
  const [storageJson, setStorageJson] = useState({});

  const [maxFee, setMaxFee] = useState(0);
  const [puzzleAnswer, setPuzzleAnswer] = useState('');
  const [puzzleFileContent, setPuzzleFileContent] = useState({});
  const [puzzleHash, setPuzzleHash] = useState('');
  const [puzzleTitle, setPuzzleTitle] = useState('');
  const [puzzleTextContent, setPuzzleTextContent] = useState({});
  const [deposit, setDeposit] = useState(0);
  const [puzzleStatus, setPuzzleStatus] = useState(0);
  const [puzzleStatusInterval, setPuzzleStatusInterval] =  useState(null);

  useEffect(() => {
    const storageJson = {
      puzzle_title: puzzleTitle,
      puzzle_content: [
        puzzleTextContent,
        puzzleFileContent
      ]
    };
    const decimals = api.registry.chainDecimals;
    setMaxFee(BigInt(5000 * (18 ** decimals)));

    const jsonStr = JSON.stringify(storageJson);
    const jsonHash = sha256(jsonStr);
    setStorageJson(storageJson);
    setStorageLength(jsonStr.length);
    setStorageHash(jsonHash);
    console.log('JSON:', jsonStr, jsonStr.length);
    console.log('user Effect.', jsonHash);
    loadPuzzleCreateEventStatus('aaa');
  }, [api.query.atochaFinace, puzzleTitle, puzzleTextContent, puzzleFileContent]);

  function statusChange (newStatus) {
    if (newStatus.isFinalized) {
      console.log('Send data to arweave.');
      axios.post(config.ARWEAVE_HTTP, storageJson).then(response => {
        console.log('Request data: ', response.data);
        const puzzle_hash = response.data.puzzle_hash;
        const answer_hash = MakeAnswerSha256WithSimple(puzzleAnswer, response.data.puzzle_hash);
        setPuzzleHash(puzzle_hash);
        setAnswerHash(answer_hash);
        handleSubmitPuzzle(puzzle_hash, answer_hash);
      }, err => {
        console.log('Request err:', err);
      }).catch((err) => {
        console.log('Catch err:', err);
      });
    } else {
      setPuzzleHash('');
      setAnswerHash('');
    }
  }

  // Submit puzzle on chain
  async function handleSubmitPuzzle (puzzle_hash, answer_hash) {
    if(puzzle_hash=="" || answer_hash=="" ) {
      alert("Puzzle or Answer hash not be empty!");
      return;
    }
    console.log(`Puzzle hash: ${puzzle_hash}, Puzzle answer: ${answer_hash}, deposit = ${deposit}`);
    setStatus("submit puzzle info to atocha chain.")
    const fromAcct = await getFromAcct();
    console.log('getFromAcct B  == ', fromAcct);
    const unsub = await api.tx.atochaModule
      .createPuzzle(puzzle_hash, answer_hash, deposit, 1)
      .signAndSend(fromAcct, (result) => {
        console.log(`Current status is ${result.status}`);
        setStatus(`submit status: ${result.status}`);
        if (result.status.isInBlock) {
          setStatus(`submit status: ${result.status} - ${result.status.asInBlock}`);
        } else if (result.status.isFinalized) {
          setStatus(`submit status: ${result.status} - ${result.status.asFinalized}`);
          unsub();
          tryToUpdatePuzzleStatus(puzzle_hash);
        }
      });
  }

  function tryToUpdatePuzzleStatus(puzzle_hash) {
    if(puzzle_hash=="") {
      alert("Puzzle or Answer hash not be empty!");
      return;
    }
    const t = setInterval(()=>{
      loadPuzzleCreateEventStatus(puzzle_hash);
    }, 1000);
    setPuzzleStatusInterval(t);
  }

  function countDeposit (num) {
    const decimals = api.registry.chainDecimals;
    setDeposit(BigInt(num * (10 ** decimals)));
  }

  function handleContent (content) {
    setPuzzleTextContent({
      type: 'text',
      data: content
    });
  }
  function handleFileChosen (file) {
    console.log(file);
    const fileReader = new FileReader();
    fileReader.onloadend = e => {
      console.log(fileReader.result);
      setPuzzleFileContent({
        type: 'file',
        data: fileReader.result
      });
    };
    fileReader.readAsDataURL(file);
  }
  return (
    <Grid.Column width={8}>
      <h1>Create a puzzle on chain</h1>
      <Form>
        <Form.Field>
          <Input
              label='Puzzle title'
              type='text'
              onChange={(_, { value }) => setPuzzleTitle(value) }
          />
        </Form.Field>
        <Form.Field>
          <Input
              type='file'
              id='file'
              label='Upload png or jpeg'
              accept='.png,.jpeg'
              onChange={e => handleFileChosen(e.target.files[0])}
          />
        </Form.Field>
        <Form.Field>
          <div>Puzzle content:</div>
          <TextArea
              onChange={(_, { value }) => handleContent(value) }
          />
        </Form.Field>
        <Form.Field>
          <Input
              label='Puzzle answer'
              type='text'
              onChange={(_, { value }) => setPuzzleAnswer(value) }
          />
        </Form.Field>
        <Form.Field>
          <Input
              label='Deposit (Min 100Ato)'
              type='number'
              state='amount'
              onChange={(_, { value }) => countDeposit(value) }
          />
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
                callable: 'preStorage',
                inputParams: [storageHash, storageLength, maxFee],
                paramFields: [true, true, true]
              }}
          />
        </Form.Field>
          <div style={{ overflowWrap: 'break-word' }}>Chain status: {status}</div>
          <div style={{ overflowWrap: 'break-word' }}>Client confirm: {puzzleStatus?"Ok":"Try()"}</div>
        </Form>
    </Grid.Column>
  );
}

export default function ClientAtochaCreator (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;
  return api.query && accountPair
    ? <Main {...props} />
    : null;
}
