import { Button, Flex, Statistic, Modal, InputNumber, message } from 'antd';
import { useState } from 'react';

import { auth } from '../../firebase';
import { useMutation } from '@tanstack/react-query';

interface StockRowProps {
  ticker: string;
  stockId?: string;
  sharesOwned?: number;
  marketPrice: number;
  buyingPower: number;
}

export const StockRow: React.FC<StockRowProps> = ({
  ticker,
  sharesOwned = 0,
  marketPrice,
  buyingPower,
  stockId = '1',
}: StockRowProps) => {
  const [messageApi, contextHolder] = message.useMessage();

  const [modalOpen, setModalOpen] = useState(false);
  const [action, setAction] = useState<'buy' | 'sell'>('buy');
  const [actionValue, setActionValue] = useState(0);

  const [confirmLoading, setConfirmLoading] = useState(false);

  const buyMutation = useMutation({
    mutationFn: ({
      stock_id,
      userid,
      shares,
    }: {
      stock_id: string;
      userid: String;
      shares: number;
    }) =>
      fetch(`/api/user/${userid}/actions/buy_stocks/stock/${stock_id}/${shares}`, {
        method: 'POST',
      }),
  });

  const sellMutation = useMutation({
    mutationFn: ({
      stock_id,
      userid,
      shares,
    }: {
      stock_id: string;
      userid: String;
      shares: number;
    }) =>
      fetch(`/api/user/${userid}/actions/sell_stocks/stock/${stock_id}/${shares}`, {
        method: 'POST',
      }),
  });

  const handleOk = () => {
    if (action === 'buy') {
      // buy
      messageApi.open({
        key: 'key2',
        type: 'loading',
        content: `Buying ${actionValue} shares of ${ticker}...`,
      });
      setConfirmLoading(true);
      buyMutation.mutate(
        {
          stock_id: stockId,
          userid: auth.currentUser?.uid!,
          shares: actionValue,
        },
        {
          onSuccess: (res) => {
            if (res.ok) {
              messageApi.open({
                key: 'key2',
                type: 'success',
                content: `Purchase succeeded`,
                duration: 3,
              });
            } else {
              messageApi.open({
                key: 'key2',
                type: 'error',
                content: `Purchase failed: ${res.statusText}`,
                duration: 10,
              });
            }
            setConfirmLoading(false);
          },
          onError: (err) => {
            console.error(err);
            setConfirmLoading(false);
            messageApi.open({
              key: 'key2',
              type: 'error',
              content: `Purchase failed: ${err}`,
              duration: 10,
            });
          },
        }
      );
    } else {
      // sell
      messageApi.open({
        key: 'key2',
        type: 'loading',
        content: `Selling ${actionValue} shares of ${ticker}...`,
      });
      setConfirmLoading(true);
      sellMutation.mutate(
        {
          stock_id: stockId,
          userid: auth.currentUser?.uid!,
          shares: actionValue,
        },
        {
          onSuccess: (res) => {
            if (res.ok) {
              messageApi.open({
                key: 'key2',
                type: 'success',
                content: `Sale succeeded`,
                duration: 3,
              });
            } else {
              messageApi.open({
                key: 'key2',
                type: 'error',
                content: `Sale failed: ${res.statusText}`,
                duration: 10,
              });
            }
            setConfirmLoading(false);
          },
          onError: (err) => {
            console.error(err);
            setConfirmLoading(false);
            messageApi.open({
              key: 'key2',
              type: 'error',
              content: `Sale failed: ${err}`,
              duration: 10,
            });
          },
        }
      );
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={`${action === 'buy' ? 'Buy' : 'Sell'} Shares of ${ticker}`}
        open={modalOpen}
        onOk={handleOk}
        confirmLoading={confirmLoading}
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
        <Statistic value={marketPrice} title="Market Price" prefix={'$'} />
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
