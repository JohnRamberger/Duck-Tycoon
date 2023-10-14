import globalstyles from '../../global.module.scss';
import { Button, Form, Input, message } from 'antd';
import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { auth } from '../../firebase';

type FieldType = {
  username?: string;
  email?: string;
  password?: string;
};

export const LoginScreen: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [isLogin, setIsLogin] = useState(true);

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
          .then(() => {
            messageApi.open({
              key: messageKey,
              type: 'success',
              content: `Profile created!`,
              duration: 3,
            });

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
