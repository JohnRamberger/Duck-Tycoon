import styles from './index.module.scss';
import globalstyles from '../../global.module.scss';

import { Flex, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 64 }} spin />;

export const IntroLoadScreen: React.FC = () => (
  <div className={`${styles.IntroLoad} ${globalstyles.Center}`}>
    <Flex vertical>
      <Spin indicator={antIcon} />
      <h1>Loading...</h1>
    </Flex>
  </div>
);
