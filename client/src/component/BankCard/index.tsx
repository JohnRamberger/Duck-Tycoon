import { Card, Flex } from 'antd';
import { BankRow } from '../BankRow';

interface BankCardProps {
  checking: {
    value: number;
    direction: 'up' | 'down';
  };
  savings: {
    value: number;
    direction: 'up' | 'down';
  };
}

export const BankCard: React.FC<BankCardProps> = ({
  checking,
  savings,
}: BankCardProps) => {
  return (
    <Card style={{ width: '60vw' }}>
      <Flex style={{ width: '100%' }} gap={'1em'} align="center" vertical>
        <BankRow
          title="Checking"
          value={checking.value}
          direction={checking.direction}
        />
        <BankRow
          title="Savings"
          value={savings.value}
          direction={savings.direction}
        />
      </Flex>
    </Card>
  );
};
