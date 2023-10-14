import globalstyles from '../../global.module.scss';

import { useState } from 'react';

import { Flex, Button } from 'antd';

const welcomeMessage = (username: string) => {
  let options = [`Welcome back, ${username}!`, `Hello, ${username}!`, 'Quack!'];

  return options[Math.floor(Math.random() * options.length)];
};

export const HomeScreen: React.FC = () => {
  const [welcome, setWelcome] = useState(welcomeMessage('John'));
  return (
    <div className={globalstyles.Center} style={{ height: '100vh' }}>
      <Flex vertical gap={'4em'}>
        <h1 className={globalstyles.Title}>Duck Tycoon</h1>
        <h3 className={globalstyles.Subtitle}>{welcome}</h3>
        <Button type="primary" shape="round" size="large">
          Enter
        </Button>
      </Flex>
    </div>
  );
};
