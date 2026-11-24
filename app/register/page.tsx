import type { Metadata } from 'next';
import RegisterForm from '../../components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account | Prime Blue',
  description: 'Create your Prime account.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
