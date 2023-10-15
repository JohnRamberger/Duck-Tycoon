import { Flex, Statistic } from 'antd';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import { auth } from '../../firebase';
import { useQuery } from '@tanstack/react-query';

interface StockRowProps {
  ticker: string;
  marketPrice: number;
  stock_id: string;
}

export const SimpleStockRow: React.FC<StockRowProps> = ({
  ticker,
  marketPrice,
  stock_id
}: StockRowProps) => {
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
