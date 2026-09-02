import { Button, Card, Flex, InputNumber, message } from 'antd';
import { CloseCircleOutlined, SwapOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import globalstyles from '../../global.module.scss';
import { BankCard } from '../../component/BankCard';
import {
  transferCheckingToSavings,
  transferSavingsToChecking,
  updateStats,
} from '../../api';

type Direction = 'toSavings' | 'toChecking';

export const BankScreen: React.FC = () => {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const [amount, setAmount] = useState<number>(0);

  const { data: stats } = useQuery(['update_stats'], updateStats);

  const checking = stats?.p_new_checking ?? 0;
  const savings = stats?.p_new_savings ?? 0;

  const transferMutation = useMutation({
    mutationFn: ({ direction, value }: { direction: Direction; value: number }) =>
      direction === 'toSavings'
        ? transferCheckingToSavings(value)
        : transferSavingsToChecking(value),
    onSuccess: () => {
      queryClient.invalidateQueries(['update_stats']);
      queryClient.invalidateQueries(['user']);
    },
  });

  const transfer = (direction: Direction) => {
    const label =
      direction === 'toSavings'
        ? 'checking to savings'
        : 'savings to checking';

    messageApi.open({
      key: 'bank',
      type: 'loading',
      content: `Moving $${amount.toFixed(2)} from ${label}...`,
    });

    transferMutation.mutate(
      { direction, value: amount },
      {
        onSuccess: () => {
          messageApi.open({
            key: 'bank',
            type: 'success',
            content: `Moved $${amount.toFixed(2)} from ${label}`,
            duration: 3,
          });
          setAmount(0);
        },
        onError: (err) => {
          messageApi.open({
            key: 'bank',
            type: 'error',
            content: `Transfer failed: ${(err as Error).message}`,
            duration: 10,
          });
        },
      }
    );
  };

  const busy = transferMutation.isLoading;
  const invalid = !amount || amount <= 0;

  return (
    <div className={globalstyles.Center}>
      {contextHolder}
      <Card
        title="Bank"
        style={{ minWidth: 'min(40em, 90vw)' }}
        extra={
          <Button
            shape="circle"
            type="text"
            icon={<CloseCircleOutlined />}
            size="large"
            onClick={() => {
              nav('/main');
            }}
          />
        }
      >
        <Flex vertical gap={'2em'}>
          <BankCard
            checking={{
              value: checking,
              direction:
                checking >= (stats?.p_old_checking ?? 0) ? 'up' : 'down',
            }}
            savings={{
              value: savings,
              direction: savings >= (stats?.p_old_savings ?? 0) ? 'up' : 'down',
            }}
          />

          <Flex vertical gap={'1em'}>
            <h2 style={{ margin: 0 }}>Transfer</h2>
            <p style={{ margin: 0, opacity: 0.8 }}>
              Savings earns 10% interest every 10 minigames you play. Checking
              is what you spend on the Exchange.
            </p>
            <InputNumber
              addonBefore="$"
              min={0}
              precision={2}
              step={5}
              value={amount}
              max={Math.max(checking, savings)}
              style={{ width: '100%' }}
              onChange={(value) => {
                setAmount(value ?? 0);
              }}
            />
            <Flex gap={'1em'} wrap="wrap">
              <Button
                type="primary"
                icon={<SwapOutlined />}
                loading={busy}
                disabled={invalid || amount > checking}
                onClick={() => transfer('toSavings')}
                style={{ flex: 1 }}
              >
                Checking → Savings
              </Button>
              <Button
                icon={<SwapOutlined />}
                loading={busy}
                disabled={invalid || amount > savings}
                onClick={() => transfer('toChecking')}
                style={{ flex: 1 }}
              >
                Savings → Checking
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Card>
    </div>
  );
};
