import globalstyles from '../../global.module.scss';
import { Button, Form, Input, message, Radio } from 'antd';
import { useState } from 'react';

import { supabase } from '../../supabase';

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

  const [choiceValue, setChoiceValue] = useState<0 | 1>(0);

  const messageKey = 'key1';

  const onFinish = (values: FieldType) => {
    messageApi.open({
      key: messageKey,
      type: 'loading',
      content: isLogin ? 'Logging you in...' : 'Creating your account...',
    });

    if (isLogin) {
      loginUser(values);
    } else {
      registerUser(values);
    }
  };

  const loginUser = async (values: FieldType) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email!,
      password: values.password!,
    });

    if (error) {
      messageApi.open({
        key: messageKey,
        type: 'error',
        content: `Failed to login: ${error.message}`,
        duration: 10,
      });
      return;
    }

    messageApi.open({
      key: messageKey,
      type: 'success',
      content: `Logged in!`,
      duration: 3,
    });
    onDone();
  };

  const registerUser = async (values: FieldType) => {
    // username + path travel as signup metadata; a DB trigger creates the
    // player row and bank account from them (see database/supabase.sql).
    const { data, error } = await supabase.auth.signUp({
      email: values.email!,
      password: values.password!,
      options: {
        data: { username: values.username, path: choiceValue },
      },
    });

    if (error) {
      messageApi.open({
        key: messageKey,
        type: 'error',
        content: `Failed to register account: ${error.message}`,
        duration: 10,
      });
      return;
    }

    if (!data.session) {
      // Email confirmation is on for this Supabase project.
      messageApi.open({
        key: messageKey,
        type: 'info',
        content: `Account created! Check your email to confirm, then log in.`,
        duration: 10,
      });
      setIsLogin(true);
      return;
    }

    messageApi.open({
      key: messageKey,
      type: 'success',
      content: `Done!`,
      duration: 3,
    });
    onDone();
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
