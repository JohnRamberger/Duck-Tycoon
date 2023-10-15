import { Card, Flex, Statistic, Button } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import globalstyles from '../../global.module.scss';
import { StockQuantityRow } from '../../component/StockQuantityRow';
import { StockRow } from '../../component/StockRow';
import { useNavigate } from 'react-router-dom';

export const ExchangeScreen: React.FC = () => {
  const nav = useNavigate();
  return (
    <div className={globalstyles.Center}>
      <Card
        title="Exchange"
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
        <Flex gap={'4em'} wrap="wrap">
          <Flex vertical gap={'2em'} align="flex-start">
            <h1 style={{ lineHeight: '1em' }}>Portfolio</h1>
            <Statistic
              title="Total Value"
              value={10_000}
              prefix="$"
              style={{ paddingRight: '2em' }}
            />
            <Flex
              vertical
              style={{
                maxHeight: '30vh',
                overflow: 'auto',
                paddingRight: '2em',
              }}
              gap={'2px'}
            >
              <StockQuantityRow
                ticker="DUCK"
                direction="up"
                marketPrice={100}
                shareQuantity={3}
              />
              <StockQuantityRow
                ticker="GOOSE"
                direction="down"
                marketPrice={12}
                shareQuantity={1}
              />
              <StockQuantityRow
                ticker="GOOSE"
                direction="down"
                marketPrice={12}
                shareQuantity={1}
              />
              <StockQuantityRow
                ticker="GOOSE"
                direction="down"
                marketPrice={12}
                shareQuantity={1}
              />
              <StockQuantityRow
                ticker="GOOSE"
                direction="down"
                marketPrice={12}
                shareQuantity={1}
              />
              <StockQuantityRow
                ticker="GOOSE"
                direction="down"
                marketPrice={12}
                shareQuantity={1}
              />
              <StockQuantityRow
                ticker="GOOSE"
                direction="down"
                marketPrice={12}
                shareQuantity={1}
              />
            </Flex>
          </Flex>
          <Flex vertical gap={'2em'}>
            <h1 style={{ lineHeight: '1em' }}>Options</h1>
            <Statistic
              title="Buying Power"
              value={500}
              prefix="$"
              style={{ paddingRight: '2em' }}
            />
            <Flex
              vertical
              style={{
                maxHeight: '30vh',
                overflow: 'auto',
                paddingRight: '2em',
                flexGrow: 1,
              }}
              gap={'1em'}
            >
              <StockRow
                ticker="DUCK"
                marketPrice={100}
                buyingPower={500}
                sharesOwned={20}
              />
              <StockRow ticker="DUCK" marketPrice={100} buyingPower={500} />
              <StockRow ticker="DUCK" marketPrice={100} buyingPower={500} />
              <StockRow ticker="DUCK" marketPrice={100} buyingPower={500} />
              <StockRow ticker="DUCK" marketPrice={100} buyingPower={500} />
              <StockRow ticker="DUCK" marketPrice={100} buyingPower={500} />
              <StockRow ticker="DUCK" marketPrice={101} buyingPower={500} />
            </Flex>
          </Flex>
        </Flex>
      </Card>
    </div>
  );
};
