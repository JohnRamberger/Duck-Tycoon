import globalstyles from '../../global.module.scss';
import { Button, Form, Input, message, Radio } from 'antd';
import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { auth } from '../../firebase';
import { useMutation } from '@tanstack/react-query';
import { Value } from 'sass';

type FieldType = {
  username?: string;
  email?: string;
  password?: string;
};

interface LoginScreenProps {
  onDone: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onDone,
}: LoginScreenProps) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [isLogin, setIsLogin] = useState(true);

  const [choiceValue, setChoiceValue] = useState(0);

  const messageKey = 'key1';

  const onFinish = (values: FieldType) => {
    console.log('Success:', values);
    messageApi.open({
      key: messageKey,
      type: 'loading',
      content: isLogin ? 'Logging you in...' : 'Creating your account...',
    });

    // firebase
    if (isLogin) {
      // Login user
      loginUser(values);
    } else {
      // Register user
      registerUser(values);
    }
  };

  const loginUser = (values: FieldType) => {
    signInWithEmailAndPassword(auth, values.email!, values.password!)
      .then((userCredential) => {
        messageApi.open({
          key: messageKey,
          type: 'success',
          content: `Logged in!`,
          duration: 3,
        });
        onDone();
      })
      .catch((error) => {
        messageApi.open({
          key: messageKey,
          type: 'error',
          content: `Failed to login: ${error.message}`,
          duration: 10,
        });
      });
  };

  const registerMutation = useMutation({
    mutationFn: ({ username, userid }: { username: string; userid: String }) =>
      fetch('/api/user/', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          userid: userid,
        }),
      }),
  });

  const routeMutation = useMutation({
    mutationFn: ({ route, userid }: { route: number; userid: String }) =>
      fetch(`/api/user/${userid}/actions/choose_path/${route}`, {
        method: 'PATCH',
      }),
  });

  const registerUser = (values: FieldType) => {
    createUserWithEmailAndPassword(auth, values.email!, values.password!)
      .then((userCredential) => {
        // Signed up
        // const user = userCredential.user;
        messageApi.open({
          key: messageKey,
          type: 'loading',
          content: `Account created! Updating Profile...`,
        });

        updateProfile(userCredential.user, {
          displayName: values.username,
        })
          .then(async () => {
            messageApi.open({
              key: messageKey,
              type: 'loading',
              content: `Profile created! Creating ducks...`,
            });

            const res = await registerMutation.mutateAsync({
              username: values.username!,
              userid: userCredential.user.uid,
            });

            if (!res.ok) {
              messageApi.open({
                key: messageKey,
                type: 'error',
                content: `Failed to create ducks: ${res.statusText}`,
                duration: 10,
              });
            } else {
              messageApi.open({
                key: messageKey,
                type: 'loading',
                content: `Ducks created! Choosing route...`,
              });
              const res_route = await routeMutation.mutateAsync({
                route: choiceValue,
                userid: userCredential.user.uid,
              });

              if (!res_route.ok) {
                messageApi.open({
                  key: messageKey,
                  type: 'error',
                  content: `Failed to create route: ${res_route.statusText}`,
                  duration: 10,
                });
              } else {
                messageApi.open({
                  key: messageKey,
                  type: 'success',
                  content: `Done!`,
                  duration: 3,
                });

                onDone();
              }
            }

            // setTimeout(() => {
            //   // redirect back to home page
            // }, 3000);
          })
          .catch((error) => {
            messageApi.open({
              key: messageKey,
              type: 'error',
              content: `Failed to register account: ${error.message}`,
              duration: 10,
            });
          });
      })
      .catch((error) => {
        messageApi.open({
          key: messageKey,
          type: 'error',
          content: `Failed to register account: ${error.message}`,
          duration: 10,
        });
      });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <>
      {contextHolder}
      <div style={{ height: '100vh' }} className={globalstyles.Center}>
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{}}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="on"
        >
          <h1 style={{ textAlign: 'center' }}>
            {isLogin ? 'Login' : 'Register'}
          </h1>
          {!isLogin && (
            <Form.Item<FieldType>
              label="Username"
              name="username"
              rules={[
                { required: true, message: 'Please input your username' },
              ]}
            >
              <Input />
            </Form.Item>
          )}
          <Form.Item<FieldType>
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please input your email' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password' }]}
          >
            <Input.Password />
          </Form.Item>

          {!isLogin && (
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <p>
                Please choose a route. If you decide to go to school, you will
                earn less money starting out, but more in the long run. If you
                decide to go straight to work, you make more starting money, but
                less over time.
              </p>
            </Form.Item>
          )}

          {!isLogin && (
            <Form.Item label="Route">
              <Radio.Group
                options={[
                  { label: 'School', value: 0 },
                  { label: 'Work', value: 1 },
                ]}
                onChange={(value) => {
                  setChoiceValue(value.target.value);
                }}
                value={choiceValue}
                optionType="button"
              />
            </Form.Item>
          )}

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              {isLogin ? 'Login' : 'Register'}
            </Button>
          </Form.Item>
          <p style={{ textAlign: 'center' }}>
            {isLogin ? 'Need an account?' : 'Already have an account?'}{' '}
            <Button
              type="text"
              className={globalstyles.ButtonUnderline}
              onClick={() => {
                setIsLogin(!isLogin);
              }}
            >
              {isLogin ? 'Register' : 'Login'}
            </Button>
          </p>
        </Form>
      </div>
    </>
  );
};
