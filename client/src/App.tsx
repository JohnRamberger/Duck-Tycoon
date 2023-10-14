import './App.css';

import { ConfigProvider, Space, theme } from 'antd';

import { HomeScreen } from './screen/Home';
// import { IntroLoadScreen } from './screen/IntroLoad';
// import { LoginScreen } from './screen/Login';

const App = () => {
  return (
    <div className="App">
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#111',
          },
        }}
      >
        <Space>
          {/* <IntroLoadScreen /> */}
          {/* <LoginScreen /> */}
          <HomeScreen />
        </Space>
      </ConfigProvider>
    </div>
  );
};

export default App;
