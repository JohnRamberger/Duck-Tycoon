import { Button, Flex, Statistic, Modal, InputNumber, message } from 'antd';
import { useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buyStocks, sellStocks } from '../../api';

interface StockRowProps {
  ticker: string;
  stockId: number;
  sharesOwned?: number;
  marketPrice: number;
  buyingPower: number;
}

export const StockRow: React.FC<StockRowProps> = ({
  ticker,
  sharesOwned = 0,
  marketPrice,
  buyingPower,
  stockId,
}: StockRowProps) => {
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [action, setAction] = useState<'buy' | 'sell'>('buy');
  const [actionValue, setActionValue] = useState(0);

  const [confirmLoading, setConfirmLoading] = useState(false);

  const refresh = () => {
    queryClient.invalidateQueries(['owned_stocks']);
    queryClient.invalidateQueries(['stocks']);
    queryClient.invalidateQueries(['update_stats']);
    queryClient.invalidateQueries(['stock_stats']);
  };

  const tradeMutation = useMutation({
    mutationFn: ({ kind, shares }: { kind: 'buy' | 'sell'; shares: number }) =>
      kind === 'buy' ? buyStocks(stockId, shares) : sellStocks(stockId, shares),
  });

  const handleOk = () => {
    const verb = action === 'buy' ? 'Buying' : 'Selling';
    const noun = action === 'buy' ? 'Purchase' : 'Sale';

    messageApi.open({
      key: 'key2',
      type: 'loading',
      content: `${verb} ${actionValue} shares of ${ticker}...`,
    });
    setConfirmLoading(true);

    tradeMutation.mutate(
      { kind: action, shares: actionValue },
      {
        onSuccess: () => {
          messageApi.open({
            key: 'key2',
            type: 'success',
            content: `${noun} succeeded`,
            duration: 3,
          });
          setConfirmLoading(false);
          setModalOpen(false);
          refresh();
        },
        onError: (err) => {
          console.error(err);
          setConfirmLoading(false);
          messageApi.open({
            key: 'key2',
            type: 'error',
            content: `${noun} failed: ${(err as Error).message}`,
            duration: 10,
          });
        },
      }
    );
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={`${action === 'buy' ? 'Buy' : 'Sell'} Shares of ${ticker}`}
        open={modalOpen}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        okButtonProps={{ disabled: actionValue <= 0 }}
        onCancel={() => {
          setModalOpen(false);
        }}
      >
        {action === 'buy' && (
          <>
            <Flex align="center" justify={'space-between'} gap={'2em'}>
              <h3>{`Total cost: $${(actionValue * marketPrice).toFixed(2)}`}</h3>
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
              <h3>{`Total earnings: $${(actionValue * marketPrice).toFixed(2)}`}</h3>
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
