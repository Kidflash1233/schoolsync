
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateUser as apiUpdateUser } from '../../services/apiService';
import Card from '../UI/Card';
import Avatar from '../UI/Avatar';
import Input from '../UI/Input';
import Button from '../UI/Button';
import LoadingSpinner from '../UI/LoadingSpinner';
import { ROLE_DISPLAY_NAMES } from '../../constants';
import { User } from '../../types';

const UserProfile: React.FC = () => {
  const { currentUser, updateCurrentUserData, isLoading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setAvatarUrl(currentUser.avatarUrl || '');
      setEmail(currentUser.email);
      setRole(ROLE_DISPLAY_NAMES[currentUser.role]);
    }
  }, [currentUser]);

  const handleEditToggle = () => {
    if (isEditing) { 
        if (currentUser) {
            setName(currentUser.name);
            setAvatarUrl(currentUser.avatarUrl || '');
        }
    }
    setIsEditing(!isEditing);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!name.trim()) {
        setError("Name cannot be empty.");
        return;
    }
    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      const updatedUserPartial: Partial<User> = {
        name: name.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
      };
      
      const updatedUser = await apiUpdateUser(currentUser.id, updatedUserPartial);
      
      if (updatedUser) {
        updateCurrentUserData(updatedUser);
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setError('Failed to update profile. User not found or error occurred.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while updating your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || !currentUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Card title="My Profile" className="max-w-xl mx-auto"> {/* Changed max-w-2xl to max-w-xl */}
      <form onSubmit={handleSubmit} className="space-y-4"> {/* Reduced space-y-6 to space-y-4 */}
        <div className="flex flex-col items-center space-y-3"> {/* Reduced space-y-4 to space-y-3 */}
          <Avatar src={isEditing ? avatarUrl : currentUser.avatarUrl} alt={name} size="lg" /> {/* Changed size to lg from xl */}
          {isEditing && (
            <Input
              id="avatarUrl"
              label="Avatar URL"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              containerClassName="w-full text-sm" // Added text-sm
            />
          )}
        </div>

        <Input
          id="name"
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!isEditing || isSaving}
          required
        />
        <Input
          id="email"
          label="Email Address"
          value={email}
          disabled 
        />
        <Input
          id="role"
          label="Role"
          value={role}
          disabled 
        />

        {error && <p className="text-sm text-danger-textDark text-center bg-danger-bgLight p-2.5 rounded-md border border-danger-borderLight">{error}</p>}
        {successMessage && <p className="text-sm text-success-textDark text-center bg-success-bgLight p-2.5 rounded-md border border-success-borderLight">{successMessage}</p>}

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-3"> {/* Reduced space and padding */}
          {isEditing ? (
            <>
              <Button type="button" variant="secondary" onClick={handleEditToggle} disabled={isSaving} size="sm">
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving} disabled={isSaving} size="sm">
                Save Changes
              </Button>
            </>
          ) : (
            <Button type="button" onClick={handleEditToggle} size="sm">
              Edit Profile
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default UserProfile;