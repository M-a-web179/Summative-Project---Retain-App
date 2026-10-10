import { Navigate, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/useAuth';

export default function LoginPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  return (
    <AuthForm
      mode="signin"
      onSubmit={async ({ email, password }) => {
        await signIn(email, password);
        navigate('/');
      }}
    />
  );
}