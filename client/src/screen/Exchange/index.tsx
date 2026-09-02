import { Card, Flex, Statistic, Button } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import globalstyles from '../../global.module.scss';
import { StockQuantityRow } from '../../component/StockQuantityRow';
import { StockRow } from '../../component/StockRow';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOwnedStocks, getStocks, updateStats } from '../../api';

export const ExchangeScreen: React.FC = () => {
  const nav = useNavigate();

  const { data: owned_stocks } = useQuery(['owned_stocks'], getOwnedStocks);
  const { data: update_stats } = useQuery(['update_stats'], updateStats);
  const { data: all_stock_data } = useQuery(['stocks'], getStocks);

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
              value={update_stats?.p_new_net_worth}
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
              {owned_stocks?.map((owned_stock) => {
                return (
                  <StockQuantityRow
                    key={owned_stock.stockid}
                    ticker={owned_stock.stock.name}
                    stock_id={owned_stock.stockid}
                    marketPrice={owned_stock.stock.market_price}
                    shareQuantity={owned_stock.num_shares_owned}
                  />
                );
              })}
            </Flex>
          </Flex>
          <Flex vertical gap={'2em'}>
            <h1 style={{ lineHeight: '1em' }}>Options</h1>
            <Statistic
              title="Buying Power"
              value={update_stats?.p_new_checking}
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
              {all_stock_data?.map((stock) => {
                return (
                  <StockRow
                    key={stock.id}
                    ticker={stock.name}
                    marketPrice={stock.market_price}
                    buyingPower={update_stats?.p_new_checking ?? 0}
                    sharesOwned={
                      owned_stocks?.find((share) => share.stockid === stock.id)
                        ?.num_shares_owned ?? 0
                    }
                    stockId={stock.id}
                  />
                );
              })}
            </Flex>
          </Flex>
        </Flex>
      </Card>
    </div>
  );
};
