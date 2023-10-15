import { BankCard } from '../../component/BankCard';
import { NetWorthCard } from '../../component/NetWorthCard';
import { SimpleStockRow } from '../../component/SimpleStockRow';
import { StockRow } from '../../component/StockRow';

import { Card } from 'antd';

import duck from '../../img/duckicon.png';

export const PlayScreen = () => {
  return (
    <div>
      <NetWorthCard avatar={duck} value={100_000} direction={'up'} />
      <BankCard
        checking={{ value: 12, direction: 'down' }}
        savings={{ value: 123456, direction: 'up' }}
      />
      <Card>
        <SimpleStockRow
          ticker="DUCK"
          marketPriceChange={12}
          marketPrice={100}
          direction="down"
        />
        <StockRow
          ticker="DUCK"
          marketPriceChange={12}
          marketPrice={100}
          direction="down"
          sharesOwned={3}
        />
      </Card>
    </div>
  );
};
