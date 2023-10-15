import { Flex, Statistic } from 'antd';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { auth } from '../../firebase';

/*interface StockQuantityRowProps {
  ticker: string;
  marketPrice: number;
  shareQuantity: number;
  direction: 'up' | 'down';
}*/
interface StockQuantityRowProps {
  stock_id: string;
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
  const userid = auth.currentUser?.uid;

  const { data: update_stock_stats } =
    useQuery([userid, stock_id], async () => {
      const res = await fetch(
        `/api/user/${userid}/actions/update_stock_stats/stock/${stock_id}`,
        {
          method: 'POST',
        }
      );
      return res.json();
    });
  const change =
    update_stock_stats?.p_new_value - update_stock_stats?.p_old_value;
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
