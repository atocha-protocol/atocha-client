import React, { useEffect, useState } from 'react';
import sha256 from 'sha256';
import {Form, Input, Grid, Card, Statistic, TextArea, Label} from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;

  // Puzzle information.
  const [status, setStatus] = useState(null);
  const [storageHash, setStorageHash] = useState('');
  const [storageLength, setStorageLength] = useState('');
  const [maxFee, setMaxFee] = useState(0);
  const [puzzleTitle, setPuzzleTitle] = useState('');
  const [puzzleTextContent, setPuzzleTextContent] = useState({});
  const [puzzleFileContent, setPuzzleFileContent] = useState({});
  const [puzzleAnswer, setPuzzleAnswer] = useState('');



  useEffect(() => {
    // let unsubscribe;
    //
    // return () => unsubscribe && unsubscribe();
    let storageJson = {
      puzzle_title: puzzleTitle,
      puzzle_content: [
        puzzleTextContent,
        puzzleFileContent
      ]
    };
    const decimals = api.registry.chainDecimals;
    setMaxFee(BigInt(5000000 * (10 ** decimals)));

    const jsonStr = JSON.stringify(storageJson);
    const jsonHash = sha256(jsonStr);
    setStorageLength(jsonStr.length)
    setStorageHash(jsonHash);
    console.log('JSON:', jsonStr, jsonStr.length);
    console.log('user Effect.', jsonHash);
  }, [api.query.templateModule, puzzleTitle, puzzleTextContent, puzzleFileContent]);

  function handleContent(content) {
    setPuzzleTextContent({
      type: 'text',
      data: content
    })
  }
  function handleFileChosen (file) {
    console.log(file);
    const fileReader = new FileReader();
    fileReader.onloadend = e => {
      console.log(fileReader.result)
      setPuzzleFileContent({
        type: 'file',
        data: fileReader.result
      })
    };
    fileReader.readAsDataURL(file);
  }
  return (
    <Grid.Column width={8}>
      <h1>Atocha Module</h1>
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
        <Form.Field style={{ textAlign: 'center' }}>
          <TxButton
              accountPair={accountPair}
              label='Submit'
              type='SIGNED-TX'
              setStatus={setStatus}
              attrs={{
                palletRpc: 'atochaFinace',
                callable: 'preStorage',
                inputParams: [storageHash, storageLength, maxFee],
                paramFields: [true,true,true]
              }}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}

export default function AtochaModule (props) {
  const { api } = useSubstrate();
  return api.query.templateModule && api.query.templateModule.something
    ? <Main {...props} />
    : null;
}
