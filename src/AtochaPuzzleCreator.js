import React, { useEffect, useState } from 'react';
import sha256 from 'sha256';
import {Form, Input, Grid, Card, Statistic, TextArea, Label} from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;

  // Puzzle information.
  const [answerHash, setAnswerHash] = useState('');
  const [blockNumber, setBlockNumber] = useState(0);
  const [challengePeriodLength, setChallengePeriodLength] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [status, setStatus] = useState(null);
  const [puzzleHash, setPuzzleHash] = useState('');
  const [puzzleInfo, setPuzzleInfo] = useState(null);

  useEffect(async () => {
    // Get puzzle infos.
    if (puzzleHash !== '') {
      api.query.atochaModule.puzzleInfo(puzzleHash).then(puzzleInfoOpt => {
        if (puzzleInfoOpt.isSome) {
          setPuzzleInfo(puzzleInfoOpt.value.toHuman());
        }
      });
    }


    let periodLength = await api.consts.atochaModule.challengePeriodLength;

    console.log("period_length = ", periodLength.toString());
    setChallengePeriodLength(periodLength.toString());
    // (period_length => {
    //   console.log("period_length = ", period_length);
    //   // setChallengePeriodLength(period_length);
    // });

    api.derive.chain.bestNumber(number => {
      setBlockNumber(number.toNumber());
    });

  }, [api.query.atochaModule, puzzleHash]);

  function countDeposit(num) {
    const decimals = api.registry.chainDecimals;
    setDeposit(BigInt(num * (10 ** decimals)));
  }

  function statusChange (newStatus) {
    if (newStatus.isFinalized) {
    }else{
    }
  }

  return (
    <Grid.Column width={8}>
      <h1>Atocha - Step 2 Puzzle creator usecase.</h1>
      <Form>
        <Form.Field>
          <Input
              label='Puzzle hash'
              type='text'
              onChange={(_, { value }) => setPuzzleHash(value) }
          />
        </Form.Field>
        <Form.Field>
          <Input
              label='Answer answer'
              type='text'
              onChange={(_, { value }) => setAnswerHash(value) }
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
                palletRpc: 'atochaModule',
                callable: 'createPuzzle',
                inputParams: [puzzleHash, answerHash, deposit, 1],
                paramFields: [true, true, true, true]
              }}
          />
        </Form.Field>
        <Form.Field>
          <div style={{ overflowWrap: 'break-word' }}>{status}</div>
        </Form.Field>
        <Form.Field>
          <div>Infos:</div>
          <div>Create block number = {puzzleInfo?puzzleInfo.createBn:'Null'}</div>
          <div>Puzzle status = {puzzleInfo?puzzleInfo.puzzleStatus:'Null'}</div>
          <div>Puzzle version = {puzzleInfo?puzzleInfo.puzzleVersion:'Null'}</div>
          <div>Reveal answer = {puzzleInfo?puzzleInfo.revealAnswer:'Null'}</div>
          <div>Reveal block number = {puzzleInfo?puzzleInfo.revealBn:'Null'}</div>
          <div>Reward take line = {puzzleInfo? parseInt(puzzleInfo.revealBn) + parseInt(challengePeriodLength) - blockNumber:'Null'}</div>
        </Form.Field>
      </Form>

    </Grid.Column>
  );
}

export default function AtochaPuzzleCreator (props) {
  const { api } = useSubstrate();
  return api.query.templateModule && api.query.templateModule.something
    ? <Main {...props} />
    : null;
}
