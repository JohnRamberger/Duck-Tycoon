import { Card, Avatar, Flex, Statistic } from 'antd';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';

interface NetWorthCardProps {
  avatar: string | undefined;
  value: number;
  direction: 'up' | 'down';
}

export const NetWorthCard: React.FC<NetWorthCardProps> = ({
  value,
  direction,
  avatar = undefined,
}: NetWorthCardProps) => {
  return (
    <Card style={{ width: '60vw' }}>
      <Flex style={{ width: '100%' }} gap={'1em'} align="center">
        <Avatar size={'large'} src={avatar} />
        <Flex style={{ flexGrow: 1 }} justify="center">
          <Statistic value={value} title="Net Worth" prefix={'$'} />
        </Flex>

        {direction === 'up' ? (
          <CaretUpOutlined style={{ fontSize: '2em', color: 'green' }} />
        ) : (
          <CaretDownOutlined style={{ fontSize: '2em', color: 'red' }} />
        )}
      </Flex>
    </Card>
  );
};
