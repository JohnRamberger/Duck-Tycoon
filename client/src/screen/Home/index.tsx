import globalstyles from '../../global.module.scss';
import styles from './styles.module.scss';

import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

import { Flex, Button, Popconfirm } from 'antd';

const welcomeMessage = (username: string) => {
  let options = [`Welcome back, ${username}!`, `Hello, ${username}!`, 'Quack!'];

  return options[Math.floor(Math.random() * options.length)];
};

export const HomeScreen: React.FC = () => {
  const confirm = () => {
    signOut(auth);
  };

  return (
    <div className={globalstyles.Center} style={{ height: '100vh' }}>
      <Popconfirm
        title="Signout"
        description="Are you sure you want to signout?"
        onConfirm={confirm}
        okText="Yes"
        cancelText="No"
        placement="rightBottom"
      >
        <Button type="text" className={styles.SignoutButton}>
          Signout
        </Button>
      </Popconfirm>

      <Flex vertical gap={'4em'}>
        <h1 className={globalstyles.Title}>Duck Tycoon</h1>
        <h3 className={globalstyles.Subtitle}>{welcomeMessage('John')}</h3>
        <Button type="primary" shape="round" size="large">
          Enter
        </Button>
      </Flex>
    </div>
  );
};
