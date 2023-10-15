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

import exchange from '../../img/exchange.png';
import bank from '../../img/bank.png';

export const StatsScreen = () => {
  const navigate = useNavigate();

  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);

  const [open, setOpen] = useState(
    localStorage.getItem('tour-stats') !== 'false'
  );

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
              src={bank}
              alt="Banks Icon"
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
              src={exchange}
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

      <Tour
        open={open}
        onClose={() => {
          setOpen(false);
          localStorage.setItem('tour-stats', 'false');
        }}
        steps={steps}
      />
    </div>
  );
};
