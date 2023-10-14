import styles from './index.module.scss';

import { Flex, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 64 }} spin />;

export const IntroLoadScreen: React.FC = () => (
  <div className={styles.IntroLoad}>
    <Flex vertical justify="center" style={{ height: '100%' }}>
      <Flex vertical>
        <Spin indicator={antIcon} />
        <h1>Loading...</h1>
      </Flex>
    </Flex>
  </div>
);
