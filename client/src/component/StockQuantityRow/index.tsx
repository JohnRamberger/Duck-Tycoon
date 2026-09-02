import { Flex, Statistic } from 'antd';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { updateStockStats } from '../../api';

interface StockQuantityRowProps {
  stock_id: number;
  ticker: string;
  marketPrice: number;
  shareQuantity: number;
}

export const StockQuantityRow: React.FC<StockQuantityRowProps> = ({
  stock_id,
  ticker,
  marketPrice,
  shareQuantity,
}: StockQuantityRowProps) => {
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
      {direction === 'up' ? (
        <CaretUpOutlined style={{ fontSize: '2em', color: 'green' }} />
      ) : (
        <CaretDownOutlined style={{ fontSize: '2em', color: 'red' }} />
      )}
      <Statistic
        value={ticker}
        title="Ticker"
        valueStyle={{ fontWeight: 700 }}
      />
      <Statistic value={shareQuantity} title="Shares" />
      <Statistic
        value={marketPrice * shareQuantity}
        title="Total Value"
        prefix={'$'}
        precision={2}
      />
    </Flex>
  );
};
