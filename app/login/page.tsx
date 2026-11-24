import type { Metadata } from 'next';
import LoginForm from '../../components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Log In | Prime Blue',
  description: 'Log in to your Prime account.',
};

export default function LoginPage() {
  return <LoginForm />;
}
