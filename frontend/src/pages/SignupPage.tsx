import { Navigate, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/useAuth';

export default function SignupPage() {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  return (
    <AuthForm
      mode="signup"
      onSubmit={async ({ name, email, password }) => {
        await signUp(name, email, password);
        navigate('/');
      }}
    />
  );
}