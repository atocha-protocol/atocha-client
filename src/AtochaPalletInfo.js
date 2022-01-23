import React, { useEffect, useState } from 'react';
import { Card, Icon, Grid } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';

function Main (props) {
  const { api, socket } = useSubstrate();
  const [palletInfo, setPalletInfo] = useState({});

  useEffect(() => {
    const getInfo = async () => {
      console.log('-----RUN 2 ')
      try {
        const [
            challengePeriodLength,
            minBonusOfPuzzle,
            penaltyOfCP,
            taxOfTI,
            taxOfTVO,
            taxOfTVS
        ] = await Promise.all([
          api.consts.atochaModule.challengePeriodLength,
          api.consts.atochaModule.minBonusOfPuzzle,
          api.consts.atochaModule.penaltyOfCP,
          // api.consts.atochaModule.taxOfTI,
          // api.consts.atochaModule.taxOfTVO,
          // api.consts.atochaModule.taxOfTVS
        ]);
        setPalletInfo({
          challengePeriodLength: challengePeriodLength.toString(),
          minBonusOfPuzzle: minBonusOfPuzzle.toString(),
          // penaltyOfCP: penaltyOfCP,
          // taxOfTI: taxOfTI,
          // taxOfTVO: taxOfTVO,
          // taxOfTVS: taxOfTVS
        });
        console.log('------ Run 4', palletInfo);
      } catch (e) {
        console.error(e);
      }
    };
    getInfo();
  }, [api.consts.atochaModule]);

  return (
    <Grid.Column>
      <Card>
        <Card.Content>
          <Card.Header>Atocha Pallet</Card.Header>
          {/*const atochaModule.challengePeriodLength*/}
          <Card.Description>Challenge period length: {palletInfo.challengePeriodLength}</Card.Description>
          {/*atochaModule.minBonusOfPuzzle*/}
          <Card.Description>Min bouns: {palletInfo.minBonusOfPuzzle} </Card.Description>
          {/*<Card.Description>Tax CP: {palletInfo.penaltyOfCP}</Card.Description>*/}
          {/*<Card.Description>Tax TI: </Card.Description>*/}
          {/*<Card.Description>Tax TVO: </Card.Description>*/}
          {/*<Card.Description>Tax TVS: </Card.Description>*/}
        </Card.Content>
      </Card>
    </Grid.Column>
  );
}

export default function AtochaPalletInfo (props) {
  const { api } = useSubstrate();
  return api.consts &&
    api.consts.atochaModule
    ? <Main {...props} />
    : null;
}
