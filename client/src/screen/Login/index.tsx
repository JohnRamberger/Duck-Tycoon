import globalstyles from '../../global.module.scss';
import { Button, Checkbox, Form, Input } from 'antd';
import { useState } from 'react';

type FieldType = {
  username?: string;
  email?: string;
  password?: string;
};

export const LoginScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const onFinish = (values: FieldType) => {
    console.log('Success:', values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
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
        {!isLogin && (
          <Form.Item<FieldType>
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please input your username' }]}
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
        <p>
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
  );
};
