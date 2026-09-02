import './App.css';

import { useState, useEffect } from 'react';
import { ConfigProvider, Space, theme } from 'antd';

import { HomeScreen } from './screen/Home';
import { IntroLoadScreen } from './screen/IntroLoad';
import { LoginScreen } from './screen/Login';

import { supabase } from './supabase';

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import { StatsScreen } from './screen/Stats';
import { MainScreen } from './screen/Main';
import { SchoolMinigame } from './screen/SchoolMinigame';
import { WorkMinigame1 } from './screen/WorkMinigame1';
import { ExchangeScreen } from './screen/Exchange';
import { BankScreen } from './screen/Bank';
import { LeaderboardScreen } from './screen/Leaderboard';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const App = () => {
  // undefined = still checking session, true/false = known
  const [loggedIn, setLoggedIn] = useState<boolean | undefined>();
  const [doneLoggingIn, setDoneLoggingIn] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' && session) {
        // Returning user with a stored session: skip the login screen.
        setDoneLoggingIn(true);
      }
      if (event === 'SIGNED_OUT') {
        queryClient.clear();
        setDoneLoggingIn(false);
      }
      setLoggedIn(session != null);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const guarded = (element: JSX.Element) =>
    loggedIn ? (
      element
    ) : loggedIn !== undefined ? (
      <Navigate to="/" replace />
    ) : (
      <IntroLoadScreen />
    );

  return (
    <div className="App">
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#5c1c9c',
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <Space>
            <RouterProvider
              router={createBrowserRouter([
                {
                  path: '/',
                  element: (
                    <>
                      {loggedIn === undefined && <IntroLoadScreen />}
                      {loggedIn !== undefined && (
                        <>
                          {!doneLoggingIn && (
                            <LoginScreen
                              onDone={() => {
                                setDoneLoggingIn(true);
                              }}
                            />
                          )}
                          {loggedIn && doneLoggingIn && <HomeScreen />}
                        </>
                      )}
                    </>
                  ),
                },
                { path: '/stats', element: guarded(<StatsScreen />) },
                { path: '/main', element: guarded(<MainScreen />) },
                { path: '/school', element: guarded(<SchoolMinigame />) },
                { path: '/work', element: guarded(<WorkMinigame1 />) },
                { path: '/exchange', element: guarded(<ExchangeScreen />) },
                { path: '/bank', element: guarded(<BankScreen />) },
                { path: '/leaderboard', element: guarded(<LeaderboardScreen />) },
              ])}
            />
          </Space>
        </QueryClientProvider>
      </ConfigProvider>
    </div>
  );
};

export default App;
