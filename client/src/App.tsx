import './App.css';

import { useState, useEffect } from 'react';
import { ConfigProvider, Space, theme, message } from 'antd';

import { HomeScreen } from './screen/Home';
import { IntroLoadScreen } from './screen/IntroLoad';
import { LoginScreen } from './screen/Login';

import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import { PlayScreen } from './screen/Play';

const App = () => {
  const [messageApi, contextHolder] = message.useMessage();
  // check if user is logged in
  const [loggedIn, setLoggedIn] = useState<boolean | undefined>();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (loggedIn === undefined && user) {
        messageApi.open({
          type: 'success',
          content: 'Logged in!',
          duration: 3,
        });
      }
      if (loggedIn && user == null) {
        messageApi.open({
          type: 'success',
          content: 'Signed out!',
          duration: 3,
        });
      }
      setLoggedIn(user != null);
    });
    return () => {
      unsub();
    };
  }, [messageApi, loggedIn]);

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
          <RouterProvider
            router={createBrowserRouter([
              {
                path: '/',
                element: (
                  <>
                    {contextHolder}

                    {loggedIn === undefined && <IntroLoadScreen />}
                    {loggedIn !== undefined && (
                      <>
                        {!loggedIn && <LoginScreen />}
                        {loggedIn && <HomeScreen />}
                      </>
                    )}
                  </>
                ),
              },
              {
                path: '/play',
                element: loggedIn ? (
                  <PlayScreen />
                ) : loggedIn !== undefined ? (
                  <Navigate to="/" replace />
                ) : (
                  <IntroLoadScreen />
                ),
              },
            ])}
          />
        </Space>
      </ConfigProvider>
    </div>
  );
};

export default App;
