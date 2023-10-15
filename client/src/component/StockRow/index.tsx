import { Button, Flex, Statistic, Modal, InputNumber } from 'antd';
import { useState } from 'react';

interface StockRowProps {
  ticker: string;
  sharesOwned?: number;
  marketPrice: number;
  buyingPower: number;
}

export const StockRow: React.FC<StockRowProps> = ({
  ticker,
  sharesOwned = 0,
  marketPrice,
  buyingPower,
}: StockRowProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [action, setAction] = useState<'buy' | 'sell'>('buy');
  const [actionValue, setActionValue] = useState(0);

  return (
    <>
      <Modal
        title={`${action === 'buy' ? 'Buy' : 'Sell'} Shares of ${ticker}`}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
        }}
      >
        {action === 'buy' && (
          <>
            <Flex align="center" justify={'space-between'} gap={'2em'}>
              <h3>{`Total cost: $${actionValue * marketPrice}`}</h3>
              <InputNumber
                addonBefore="Shares"
                min={1}
                defaultValue={actionValue}
                max={Math.floor(buyingPower / marketPrice)}
                onChange={(value) => {
                  setActionValue(value ?? 0);
                }}
              />
            </Flex>
            <p
              style={{
                textAlign: 'right',
                lineHeight: '0',
                transform: 'translateY(-1em)',
              }}
            >
              ${marketPrice} per share
            </p>
          </>
        )}
        {action === 'sell' && (
          <>
            <Flex align="center" justify={'space-between'} gap={'2em'}>
              <h3>{`Total earnings: $${actionValue * marketPrice}`}</h3>
              <InputNumber
                addonBefore="Shares"
                min={1}
                defaultValue={actionValue}
                max={sharesOwned}
                onChange={(value) => {
                  setActionValue(value ?? 0);
                }}
              />
            </Flex>
            <p
              style={{
                textAlign: 'right',
                lineHeight: '0',
                transform: 'translateY(-1em)',
              }}
            >
              ${marketPrice} per share
            </p>
          </>
        )}
      </Modal>
      <Flex
        style={{ width: '100%' }}
        gap={'4vw'}
        justify="space-between"
        align="center"
      >
        <Statistic
          value={ticker}
          title="Ticker"
          valueStyle={{ fontWeight: 700 }}
        />
        <Statistic value={marketPrice} title="Market Price" prefix={'$'} precision={2} />
        <Statistic value={sharesOwned} title="My Shares" />
        <Flex vertical>
          <Button
            onClick={() => {
              setAction('buy');
              setModalOpen(true);
            }}
          >
            Buy
          </Button>
          <Button
            onClick={() => {
              setAction('sell');
              setModalOpen(true);
            }}
            disabled={sharesOwned <= 0}
          >
            Sell
          </Button>
        </Flex>
      </Flex>
    </>
  );
};
