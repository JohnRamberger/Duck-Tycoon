import { Flex } from 'antd';

import duck from '../../img/duckicon.png';

import { useNavigate } from 'react-router-dom';
import { MainButton } from '../../component/MainButton';
import { ProfileCard } from '../../component/ProfileCard';

export const MainScreen: React.FC = () => {
  const nav = useNavigate();

  return (
    <div
      style={{
        width: '100vw',
        height: '80vh',
        boxSizing: 'border-box',
        padding: '5vmin',
      }}
    >
      <Flex vertical style={{ width: '100' }} gap={'5vmin'}>
        <Flex wrap={'wrap'} justify="center" gap={'5vmin'}>
          <MainButton
            title="School"
            img={duck}
            onClick={() => {
              nav('/school');
            }}
            disabled
            disabledMessage="You are not enrolled in school."
          />
          <MainButton
            title="Work"
            img={duck}
            onClick={() => {
              nav('/work');
            }}
          />
        </Flex>
        <Flex wrap={'wrap'} justify="center" gap={'5vmin'}>
          <MainButton
            title="Bank"
            img={duck}
            onClick={() => {
              nav('/bank');
            }}
          />
          <MainButton
            title="Exchange"
            img={duck}
            onClick={() => {
              nav('/exchange');
            }}
          />
          <MainButton
            title="Leaderboard"
            img={duck}
            onClick={() => {
              nav('/leaderboard');
            }}
          />
        </Flex>
      </Flex>

      <ProfileCard />
    </div>
  );
};
