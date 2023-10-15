import { Card, Flex, Statistic, Button } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import globalstyles from '../../global.module.scss';
import { StockQuantityRow } from '../../component/StockQuantityRow';
import { StockRow } from '../../component/StockRow';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { useQuery } from '@tanstack/react-query';

export const ExchangeScreen: React.FC = () => {
  const nav = useNavigate();
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
  console.log(owned_stocks, update_stats, all_stock_data);

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
              {owned_stocks?.stocks.map((owned_stock: any) => {
                return (
                  <StockQuantityRow
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
              {all_stock_data?.stocks.map((stock: any) => {
                return (
                  <StockRow
                    ticker={stock.name}
                    marketPrice={stock.market_price}
                    buyingPower={update_stats?.p_new_checking}
                    sharesOwned={
                      owned_stocks?.stocks.find(
                        (share: any) => share.stockid === stock.id
                      )?.num_shares_owned ?? 0
                    }
                  />
                );
              })}

              <StockRow
                ticker="DUCK"
                marketPrice={100}
                buyingPower={update_stats?.p_new_checking}
              />
            </Flex>
          </Flex>
        </Flex>
      </Card>
    </div>
  );
};
