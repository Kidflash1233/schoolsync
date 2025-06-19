
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';
import { APP_NAME } from '../../constants';

const LoginScreen: React.FC = () => {
  const [roleCode, setRoleCode] = useState('');
  const [password, setPassword] = useState('');
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);
  const [error, setError] = useState('');
  const { loginWithCodeAndPassword, startPasswordSetupFlow, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!roleCode.trim()) {
      setError('Invitation code cannot be empty.');
      return;
    }

    if (isFirstTimeLogin) {
      const result = await startPasswordSetupFlow(roleCode);
      if (result.success && result.userId) {
        navigate(`/set-password/${result.userId}`);
      } else {
        setError(result.error || 'Failed to start password setup. Please check the code.');
      }
    } else {
      if (!password.trim()) {
        setError('Password cannot be empty.');
        return;
      }
      const success = await loginWithCodeAndPassword(roleCode, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid invitation code or password. Please check and try again.');
      }
    }
  };

  const cardDescription = isFirstTimeLogin 
    ? "Enter your invitation code. You'll be prompted to create a password on the next page."
    : "Enter your invitation code and password. If it's your first time and you provide a password, it will be set for your account.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgPage p-4">
      <Card title={`Welcome to ${APP_NAME}`} className="w-full max-w-md bg-bgSurface" titleClassName="text-center !py-5">
        <p className="text-textSubtle mb-6 text-center text-sm">
            {cardDescription}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="roleCode"
            label="Invitation Code"
            type="text"
            value={roleCode}
            onChange={(e) => setRoleCode(e.target.value.toUpperCase())}
            placeholder="e.g., TCHR-ABCDE"
            disabled={isLoading}
            containerClassName="!mb-2"
          />
          {!isFirstTimeLogin && (
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
              containerClassName="!mb-2"
            />
          )}
          <div className="flex items-center mt-2 mb-3">
            <input
              id="isFirstTimeLogin"
              type="checkbox"
              checked={isFirstTimeLogin}
              onChange={(e) => setIsFirstTimeLogin(e.target.checked)}
              className="h-4 w-4 text-primary border-borderDefault rounded focus:ring-primary"
              disabled={isLoading}
            />
            <label htmlFor="isFirstTimeLogin" className="ml-2 block text-sm text-textBody">
              This is my first time logging in / I need to set my password.
            </label>
          </div>

          {error && <p className="text-sm text-danger text-center !mt-2 p-2 bg-danger-bgLight rounded-md border border-danger-borderLight text-danger-textDark">{error}</p>}
          
          <Button type="submit" isLoading={isLoading} fullWidth className="!mt-6">
            {isFirstTimeLogin ? 'Proceed to Set Password' : 'Login / Set Password'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LoginScreen;