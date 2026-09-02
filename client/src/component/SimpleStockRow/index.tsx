import { Flex, Statistic } from 'antd';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { updateStockStats } from '../../api';

interface StockRowProps {
  ticker: string;
  marketPrice: number;
  stock_id: number;
}

export const SimpleStockRow: React.FC<StockRowProps> = ({
  ticker,
  marketPrice,
  stock_id
}: StockRowProps) => {
  const { data: update_stock_stats } = useQuery(
    ['stock_stats', stock_id],
    () => updateStockStats(stock_id)
  );
  const change =
    (update_stock_stats?.p_new_value ?? 0) -
    (update_stock_stats?.p_old_value ?? 0);
  const direction = change >= 0 ? 'up' : 'down';

  return (
    <Flex
      style={{ width: '100%' }}
      gap={'1em'}
      justify="space-between"
      align="center"
    >
      <Statistic
        value={ticker}
        title="Ticker"
        valueStyle={{ fontWeight: 700 }}
      />
      <Statistic
        value={marketPrice}
        title="Market Price"
        prefix={'$'}
        suffix={'/ Share'}
      />
      <Statistic
        value={(100 * change) / marketPrice}
        title="% Change"
        precision={1}
        suffix={'%'}
      />

      {direction === 'up' ? (
        <CaretUpOutlined style={{ fontSize: '2em', color: 'green' }} />
      ) : (
        <CaretDownOutlined style={{ fontSize: '2em', color: 'red' }} />
      )}
    </Flex>
  );
};
