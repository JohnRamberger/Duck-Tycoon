import { Flex, Statistic } from 'antd';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';

interface BankRowProps {
  title: string;
  value: number;
  direction: 'up' | 'down';
}

export const BankRow: React.FC<BankRowProps> = ({
  title,
  value,
  direction,
}: BankRowProps) => {
  return (
    <Flex
      style={{ width: '100%' }}
      gap={'1em'}
      justify="space-between"
      align="center"
    >
      <Statistic value={value} title={title} prefix={'$'} />

      {direction === 'up' ? (
        <CaretUpOutlined style={{ fontSize: '2em', color: 'green' }} />
      ) : (
        <CaretDownOutlined style={{ fontSize: '2em', color: 'red' }} />
      )}
    </Flex>
  );
};
