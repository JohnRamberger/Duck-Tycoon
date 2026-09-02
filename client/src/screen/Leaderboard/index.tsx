import { Button, Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CloseCircleOutlined, CrownFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import globalstyles from '../../global.module.scss';
import { getLeaderboard, getUser, updateStats } from '../../api';

type Row = {
  key: number;
  rank: number;
  username: string;
  net_worth: number;
};

const medalColor = ['#ffd700', '#c0c0c0', '#cd7f32'];

export const LeaderboardScreen: React.FC = () => {
  const nav = useNavigate();

  const { data: me } = useQuery(['user'], getUser);

  // Net worth is snapshotted by update_stats, so refresh ours before ranking.
  const { data: rows, isLoading } = useQuery(['leaderboard'], async () => {
    await updateStats().catch(() => undefined);
    const board = await getLeaderboard();
    return board.map<Row>((u, i) => ({
      key: i,
      rank: i + 1,
      username: u.username,
      net_worth: Number(u.net_worth_la),
    }));
  });

  const columns: ColumnsType<Row> = [
    {
      title: '#',
      dataIndex: 'rank',
      width: '4em',
      render: (rank: number) =>
        rank <= 3 ? (
          <CrownFilled style={{ color: medalColor[rank - 1], fontSize: '1.3em' }} />
        ) : (
          rank
        ),
    },
    {
      title: 'Duck',
      dataIndex: 'username',
      render: (name: string) =>
        name === me?.username ? <strong>{name} (you)</strong> : name,
    },
    {
      title: 'Net Worth',
      dataIndex: 'net_worth',
      align: 'right',
      render: (v: number) =>
        `$${v.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
  ];

  return (
    <div className={globalstyles.Center}>
      <Card
        title="Leaderboard"
        style={{ minWidth: 'min(40em, 90vw)' }}
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
        <Table<Row>
          columns={columns}
          dataSource={rows}
          loading={isLoading}
          pagination={false}
          size="middle"
          scroll={{ y: '50vh' }}
          rowClassName={(row) =>
            row.username === me?.username ? 'leaderboard-me' : ''
          }
        />
      </Card>
    </div>
  );
};
