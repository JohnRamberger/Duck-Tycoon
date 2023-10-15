import { Flex, Statistic } from 'antd';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';

interface StockRowProps {
  ticker: string;
  marketPrice: number;
  marketPriceChange: number;
  direction: 'up' | 'down';
}

export const SimpleStockRow: React.FC<StockRowProps> = ({
  ticker,
  marketPrice,
  marketPriceChange,
  direction,
}: StockRowProps) => {
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
        value={(100 * marketPriceChange) / marketPrice}
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
