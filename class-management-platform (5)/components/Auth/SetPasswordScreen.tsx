
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';
import { APP_NAME } from '../../constants';

const SetPasswordScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { completePasswordSetupAndLogin, isLoading } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Both password fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) { 
        setError('Password must be at least 6 characters long.');
        return;
    }
    if (!userId) {
        setError('User ID is missing. Cannot set password.');
        return;
    }

    const success = await completePasswordSetupAndLogin(userId, password);
    if (success) {
      navigate('/');
    } else {
      setError('Failed to set password. Please try again or contact support.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgPage p-4">
      <Card title={`Set Your Password for ${APP_NAME}`} className="w-full max-w-md bg-bgSurface" titleClassName="text-center !py-5">
        <p className="text-textSubtle mb-6 text-center text-sm">
          Please create a secure password for your account.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="newPassword"
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your new password"
            disabled={isLoading}
            containerClassName="!mb-2"
          />
          <Input
            id="confirmPassword"
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            disabled={isLoading}
            containerClassName="!mb-2"
          />
          {error && <p className="text-sm text-danger text-center !mt-2 p-2 bg-danger-bgLight rounded-md border border-danger-borderLight text-danger-textDark">{error}</p>}
          <Button type="submit" isLoading={isLoading} fullWidth className="!mt-6">
            Set Password and Login
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default SetPasswordScreen;