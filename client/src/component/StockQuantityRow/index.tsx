import { Flex, Statistic } from 'antd';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';

interface StockQuantityRowProps {
  ticker: string;
  marketPrice: number;
  shareQuantity: number;
  direction: 'up' | 'down';
}

export const StockQuantityRow: React.FC<StockQuantityRowProps> = ({
  ticker,
  marketPrice,
  shareQuantity,
  direction,
}: StockQuantityRowProps) => {
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
      />
    </Flex>
  );
};
