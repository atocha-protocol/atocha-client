import React, { useEffect, useState } from 'react';
import { Card, Icon, Grid } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';

function Main (props) {
  const { api, socket } = useSubstrate();
  const [palletInfo, setPalletInfo] = useState({});
  const [blockNumber, setBlockNumber] = useState(0);
  const [currentAddress, setCurrentAddress] = useState('');
  const [points, setPoints] = useState(-1);
  const [currentExchangeRewardEra, setCurrentExchangeRewardEra] = useState(0);
  const { accountPair } = props;
  const [atochaModuleConfig, setAtochaModuleConfig] = useState(null);
  const [atochaFinaceConfig, setAtochaFinaceConfig] = useState(null);

  async function updateAtochaModuleConfig() {
    api.query.atochaModule.atoConfig().then(puzzleInfoOpt => {
      // challengePeriodLength: "20"
      // maxAnswerExplainLen: "1,024"
      // maxSponsorExplainLen: "256"
      // minBonusOfPuzzle: "100,000,000,000,000,000,000"
      // penaltyOfCp: "10.00%"
      // taxOfTcr: "10.00%"
      // taxOfTi: "10.00%"
      // taxOfTvo: "10.00%"
      // taxOfTvs: "5.00%"
      if (puzzleInfoOpt.isSome) {
        // console.log(puzzleInfoOpt.value.toHuman());
        const config_val = puzzleInfoOpt.value.toHuman();
        setAtochaModuleConfig(config_val);
      }
    });
  }

  async function updateAtochaFinaceConfig() {
    api.query.atochaFinace.atoConfig().then(puzzleInfoOpt => {
      // exchangeEraLength: 60
      // exchangeHistoryDepth: 10
      // exchangeMaxRewardListSize: 3
      // issuancePerBlock: 1,902,587,519,025,900,000
      // perEraOfBlockNumber: 10
      // challengeThreshold: 60.00%
      // raisingPeriodLength: 100
      // storageBaseFee: 10,000
      if (puzzleInfoOpt.isSome) {
        // console.log(puzzleInfoOpt.value.toHuman());
        const config_val = puzzleInfoOpt.value.toHuman();
        setAtochaFinaceConfig(config_val);
      }
    });
  }

  useEffect(() => {
    const getInfo = async () => {
      if (accountPair) {
        setCurrentAddress(accountPair.address);
        api.query.atochaFinace.atoPointLedger(accountPair.address).then(chain_point =>{
          setPoints(chain_point.toString());
        });
      }

      updateAtochaModuleConfig();
      updateAtochaFinaceConfig();

      try {
        const [
          challengePeriodLength,
          // minBonusOfPuzzle,
          exchangeMaxRewardListSize,
          // exchangeEraLength,
          // currentExchangeRewardEra,
          lastExchangeRewardEra,
          // perEraOfBlockNumber
        ] = await Promise.all([
          // api.consts.atochaModule.challengePeriodLength,
          // api.consts.atochaModule.minBonusOfPuzzle,
          api.consts.atochaFinace.exchangeMaxRewardListSize,
          // api.consts.atochaFinace.exchangeEraLength,
          // api.query.atochaFinace.currentExchangeRewardEra(),
          api.query.atochaFinace.lastExchangeRewardEra(),
          // api.consts.atochaFinace.perEraOfBlockNumber
        ]);
        setPalletInfo({
          // challengePeriodLength: challengePeriodLength.toString(),
          // minBonusOfPuzzle: minBonusOfPuzzle.toString(),
          exchangeMaxRewardListSize: exchangeMaxRewardListSize.toString(),
          // exchangeEraLength: exchangeEraLength.toString(),
          // currentExchangeRewardEra: currentExchangeRewardEra.isSome ? currentExchangeRewardEra.value.toNumber() : 'Null',
          lastExchangeRewardEra: lastExchangeRewardEra.isSome ? lastExchangeRewardEra.value.toNumber() : 'Null',
          // perEraOfBlockNumber: perEraOfBlockNumber.toNumber()
        });
        // console.log('exchangeMaxRewardListSize = ', minBonusOfPuzzle, exchangeMaxRewardListSize);
      } catch (e) {
        console.error(e);
      }
    };
    getInfo();

    const unsubscribeAll = null;
    api.derive.chain.bestNumber(number => {
      setBlockNumber(number.toNumber());
    });

    api.query.atochaFinace.currentExchangeRewardEra((era_opt) => {
      console.log(`Chain currentExchangeRewardEra: #${era_opt}`);
      if (era_opt.isSome) {
        setCurrentExchangeRewardEra(era_opt.value.toNumber());
      }
    });

    return () => unsubscribeAll && unsubscribeAll();
  }, [
    api.derive.chain.bestNumber,
    api.query.atochaFinace.currentExchangeRewardEra,
    api.query.atochaFinace.atoPointLedger,
    api.query.atochaFinace.lastExchangeRewardEra,
    accountPair]);

  return (
    <Grid.Column>
      <Card>
        <Card.Content>
          <Card.Header>Atocha Pallet</Card.Header>
          <Card.Description>Address: {currentAddress}</Card.Description>
          <Card.Description>Points: {points}</Card.Description>
        </Card.Content>
        <Card.Content>
          <Card.Description><Icon name='setting' />Puzzle settings:</Card.Description>
          <Card.Description>Min bouns: {atochaModuleConfig?atochaModuleConfig.minBonusOfPuzzle:'*'} </Card.Description>
        </Card.Content>
        <Card.Content>
          <Card.Description><Icon name='setting' />Point reward settings:</Card.Description>
          <Card.Description>Point reward era length: {atochaFinaceConfig?atochaFinaceConfig.perEraOfBlockNumber:'*'}b </Card.Description>
        </Card.Content>
        <Card.Content>
          <Card.Description><Icon name='setting' />Challenge settings:</Card.Description>
          <Card.Description>Challenge period length: {atochaModuleConfig ?atochaModuleConfig.challengePeriodLength:'*'}b (0line 5 Days)</Card.Description>
        </Card.Content>
        <Card.Content>
          <Card.Description><Icon name='setting' />Exchange settings:</Card.Description>
          <Card.Description>Exchange era length: {atochaFinaceConfig?atochaFinaceConfig.exchangeEraLength:'*'}b (Online 1 Weeks)</Card.Description>
          <Card.Description>Exchange era calculation: [{atochaFinaceConfig?(blockNumber / atochaFinaceConfig.exchangeEraLength).toFixed(2):'*'}] </Card.Description>
          <Card.Description>Available exchange era: [{currentExchangeRewardEra}]</Card.Description>
          <Card.Description>Last completed exchange era: [{palletInfo.lastExchangeRewardEra}]</Card.Description>
          <Card.Description>Reward list size: {atochaFinaceConfig?atochaFinaceConfig.exchangeMaxRewardListSize:'*'}</Card.Description>
        </Card.Content>
      </Card>
    </Grid.Column>
  );
}

export default function AtochaPalletInfo (props) {
  const { api } = useSubstrate();
  return api.query &&
    api.query.atochaModule &&
    api.query.atochaFinace
    ? <Main {...props} />
    : null;
}
