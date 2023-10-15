import { BankCard } from '../../component/BankCard';
import { NetWorthCard } from '../../component/NetWorthCard';
import { SimpleStockRow } from '../../component/SimpleStockRow';

import { Card, Tour, Flex, Button } from 'antd';
import type { TourProps } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

import { useState, useRef } from 'react';
import styles from './styles.module.scss';
import globalstyles from '../../global.module.scss';

import { useNavigate } from 'react-router-dom';

import duck from '../../img/duckicon.png';
import { auth } from '../../firebase';
import { useQuery } from '@tanstack/react-query';

export const StatsScreen = () => {
  const navigate = useNavigate();

  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);

  const [open, setOpen] = useState(true);

  const steps: TourProps['steps'] = [
    {
      title: 'Net Worth',
      description: 'You can see the total value of all of your assets here.',
      target: () => ref1.current,
    },
    {
      title: 'Bank Accounts',
      description:
        'This shows the current balance of both your checking and savings accounts.',
      target: () => ref2.current,
    },
    {
      title: 'Owned Stocks',
      description:
        'Here, you can see the current Market Price for some of the stocks you own.',
      target: () => ref3.current,
    },
  ];

  const gap = '3em';

  const userid = auth.currentUser?.uid;

  const { data: owned_stocks, isLoading: owned_stocks_loading } = useQuery(
    [userid, 'stocks'],
    async () => {
      const res = await fetch(`/api/user/${userid}/stocks`);
      return res.json();
    }
  );

  const { data: update_stats, isLoading: update_stats_loading } = useQuery(
    [userid, 'update_stats'],
    async () => {
      const res = await fetch(`/api/user/${userid}/actions/update_stats`, {
        method: 'POST',
      });
      return res.json();
    }
  );

  const { data: all_stock_data, isLoading: all_stock_data_loading } = useQuery(
    ['stock'],
    async () => {
      const res = await fetch(`/api/stock/`);
      return res.json();
    }
  );

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        padding: gap,
        boxSizing: 'border-box',
      }}
    >
      <Flex vertical gap={gap} justify="space-evenly" align="center">
        <Button
          style={{ position: 'absolute', top: gap, right: gap }}
          shape="circle"
          type="text"
          icon={<CloseCircleOutlined style={{ fontSize: '2em' }} />}
          size="large"
          onClick={() => {
            navigate('/main');
          }}
        />
        <h1 className={globalstyles.Subtitle}>Here's how you're doing!</h1>
        <div ref={ref1} style={{ width: '100%' }}>
          <NetWorthCard avatar={duck} value={100_000} direction={'up'} />
        </div>
        <Flex style={{ width: '100%' }} gap={gap}>
          <Flex
            align="center"
            gap={'1em'}
            style={{ width: '100%' }}
            vertical
            ref={ref2}
          >
            <img
              className={styles.ImageHeader}
              src={duck}
              alt="Owned Stocks Icon"
            />
            <div
              style={{ width: '100%', height: '100%', alignSelf: 'stretch' }}
            >
              <BankCard
                checking={{ value: 12, direction: 'down' }}
                savings={{ value: 123456, direction: 'up' }}
              />
            </div>
          </Flex>
          <Flex
            align="center"
            gap={'1em'}
            style={{ width: '100%' }}
            vertical
            ref={ref3}
          >
            <img
              className={styles.ImageHeader}
              src={duck}
              alt="Owned Stocks Icon"
            />
            <Card style={{ width: '100%' }}>
              <Flex vertical gap="1em">
                <SimpleStockRow
                  ticker="DUCK"
                  marketPriceChange={12}
                  marketPrice={100}
                  direction="down"
                />
                <SimpleStockRow
                  ticker="DUCK"
                  marketPriceChange={12}
                  marketPrice={100}
                  direction="down"
                />
                <SimpleStockRow
                  ticker="DUCK"
                  marketPriceChange={12}
                  marketPrice={100}
                  direction="down"
                />
              </Flex>
            </Card>
          </Flex>
        </Flex>
      </Flex>

      <Tour open={open} onClose={() => setOpen(false)} steps={steps} />
    </div>
  );
};
