import React, { useEffect, useState } from 'react';
import { Card, Icon, Grid } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';

function Main (props) {
  const { api, socket } = useSubstrate();
  const [palletInfo, setPalletInfo] = useState({});
  const [blockNumber, setBlockNumber] = useState(0);
  const [currentAddress, setCurrentAddress] = useState('');
  const [points, setPoints] = useState(-1);
  const { accountPair } = props;

  useEffect(() => {
    const getInfo = async () => {
      if (accountPair) {
        setCurrentAddress(accountPair.address);
        api.query.atochaFinace.atoPointLedger(accountPair.address).then(chain_point =>{
          setPoints(chain_point.toString());
        });
      }

      try {
        const [
          challengePeriodLength,
          minBonusOfPuzzle,
          exchangeMaxRewardListSize,
          exchangeEraLength
        ] = await Promise.all([
          api.consts.atochaModule.challengePeriodLength,
          api.consts.atochaModule.minBonusOfPuzzle,
          api.consts.atochaFinace.exchangeMaxRewardListSize,
          api.consts.atochaFinace.exchangeEraLength
        ]);
        setPalletInfo({
          challengePeriodLength: challengePeriodLength.toString(),
          minBonusOfPuzzle: minBonusOfPuzzle.toString(),
          exchangeMaxRewardListSize: exchangeMaxRewardListSize.toString(),
          exchangeEraLength: exchangeEraLength.toString()
        });
        console.log('exchangeMaxRewardListSize = ', minBonusOfPuzzle, exchangeMaxRewardListSize);
      } catch (e) {
        console.error(e);
      }
    };
    getInfo();

    const unsubscribeAll = null;
    api.derive.chain.bestNumber(number => {
      setBlockNumber(number.toNumber());
      console.log('number = ', number.toNumber());
    });
    return () => unsubscribeAll && unsubscribeAll();
  }, [api.consts.atochaModule, api.derive.chain.bestNumber, accountPair]);

  return (
    <Grid.Column>
      <Card>
        <Card.Content>
          <Card.Header>Atocha Pallet</Card.Header>
          <Card.Description>Challenge period length: {palletInfo.challengePeriodLength}</Card.Description>
          <Card.Description>Min bouns: {palletInfo.minBonusOfPuzzle} </Card.Description>
          <Card.Description>Point reward era: {(blockNumber / 600).toFixed(2)} </Card.Description>
          <Card.Description>Reward list size: {palletInfo.exchangeMaxRewardListSize}</Card.Description>
          <Card.Description>Address: {currentAddress}</Card.Description>
          <Card.Description>Points: {points}</Card.Description>
        </Card.Content>
      </Card>
    </Grid.Column>
  );
}

export default function AtochaPalletInfo (props) {
  const { api } = useSubstrate();
  return api.consts &&
    api.consts.atochaModule &&
    api.consts.atochaFinace
    ? <Main {...props} />
    : null;
}
