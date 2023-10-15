import { Button, Flex, Statistic, Modal } from 'antd';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import { useState } from 'react';

interface StockRowProps {
  ticker: string;
  sharesOwned: number;
  marketPrice: number;
  marketPriceChange: number;
  direction: 'up' | 'down';
}

export const StockRow: React.FC<StockRowProps> = ({
  ticker,
  marketPrice,
  marketPriceChange,
  direction,
}: StockRowProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Modal
        title="Title"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
        }}
      >
        <p>modal something something</p>
      </Modal>
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
        <Statistic value={ticker} title="Ticker" />
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
          suffix={`%`}
        />
        <Flex vertical>
          <Button
            onClick={() => {
              setModalOpen(true);
            }}
          >
            Buy
          </Button>
          <Button
            onClick={() => {
              setModalOpen(true);
            }}
          >
            Sell
          </Button>
        </Flex>
      </Flex>
    </>
  );
};
