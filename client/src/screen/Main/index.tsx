import { Button, Flex, Tour } from 'antd';
import type { TourProps } from 'antd';

import duck from '../../img/duckicon.png';

import { useNavigate } from 'react-router-dom';
import { MainButton } from '../../component/MainButton';
import { ProfileCard } from '../../component/ProfileCard';
import { useRef, useState } from 'react';

import { auth } from '../../firebase';
import { useQuery } from '@tanstack/react-query';

export const MainScreen: React.FC = () => {
  const nav = useNavigate();

  const [open, setOpen] = useState(
    localStorage.getItem('tour-main') !== 'false'
  );

  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);

  const userQuery = useQuery({
    queryKey: ['asd'],
    queryFn: async () => {
      const x = await fetch(`/api/user/${auth.currentUser?.uid!}`);
      return x.json();
    },
  });

  const steps: TourProps['steps'] = [
    {
      title: 'School',
      description:
        'At school, you can learn more about finance. After graduating, you can get a better job with a higher salary.',
      target: () => ref1.current,
    },
    {
      title: 'Work',
      description:
        'This allows you to work and earn money. While in school, you can only work part-time.',
      target: () => ref2.current,
    },
    {
      title: 'Bank',
      description:
        'Here, you can access your bank accounts. You can manage your Checking and Savings accounts here.',
      target: () => ref3.current,
    },
    {
      title: 'Exchange',
      description:
        'This is where you can buy and sell stocks. You can also see the current Market Price for some of the stocks you own.',
      target: () => ref4.current,
    },
    {
      title: 'Leaderboard',
      description:
        'The leaderboard shows the top players with the highest net worth.',
      target: () => ref5.current,
    },
  ];

  return (
    <div
      style={{
        width: '100vw',
        height: '80vh',
        boxSizing: 'border-box',
        padding: '5vmin',
      }}
    >
      <Button
        onClick={() => {
          nav('/');
        }}
        type="text"
        style={{ position: 'absolute', top: '1em', right: '1em' }}
      >
        Home
      </Button>
      <Flex vertical style={{ width: '100' }} gap={'5vmin'}>
        <Flex wrap={'wrap'} justify="center" gap={'5vmin'}>
          <div ref={ref1}>
            <MainButton
              title="School"
              img={duck}
              onClick={() => {
                nav('/school');
              }}
              disabled={userQuery?.data?.days_school_left <= 0 ?? true}
              disabledMessage="You are not enrolled in school."
            />
          </div>
          <div ref={ref2}>
            <MainButton
              title="Work"
              img={duck}
              onClick={() => {
                nav('/work');
              }}
            />
          </div>
        </Flex>
        <Flex wrap={'wrap'} justify="center" gap={'5vmin'}>
          <div ref={ref3}>
            <MainButton
              title="Bank"
              img={duck}
              onClick={() => {
                nav('/bank');
              }}
            />
          </div>
          <div ref={ref4}>
            <MainButton
              title="Exchange"
              img={duck}
              onClick={() => {
                nav('/exchange');
              }}
            />
          </div>
          <div ref={ref5}>
            <MainButton
              title="Leaderboard"
              img={duck}
              onClick={() => {
                nav('/leaderboard');
              }}
            />
          </div>
        </Flex>
      </Flex>

      <ProfileCard
        salary={userQuery?.data?.salary ?? 0}
        username={auth.currentUser?.displayName!}
      />

      <Tour
        open={open}
        onClose={() => {
          setOpen(false);
          localStorage.setItem('tour-main', 'false');
        }}
        steps={steps}
      />
    </div>
  );
};
