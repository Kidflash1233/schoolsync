import React, { useState, useEffect, FormEvent } from 'react';
import Modal from '../../UI/Modal';
import Button from '../../UI/Button';
import Input from '../../UI/Input';
import { User, Student, Class as SchoolClass, UserRole, UserCreationResponse } from '../../../types';
import { EntityType } from './ManagementHub'; 
import { DEFAULT_AVATAR_PLACEHOLDER, ROLE_DISPLAY_NAMES } from '../../../constants';
import { CheckCircleIcon, UserPlusIcon, AcademicCapIcon, RectangleStackIcon } from '@heroicons/react/24/outline';

// Extended FormData for student creation to include profile options
type FormDataStudentSpecific = { createProfile?: boolean; email?: string };
type FormData = Partial<User & Student & SchoolClass & { role: UserRole }> & FormDataStudentSpecific;


interface CreateEntityWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (
        entityData: FormData, 
        entityType: EntityType, 
        mode: 'create' | 'edit'
    ) => Promise<{ entity: User | Student | SchoolClass, invitationCode?: string } | null>;
    existingEntity?: User | Student | SchoolClass | null; 
    allUsers: User[]; 
    allClasses: SchoolClass[]; 
    onOpenLinksModal: (item: User | Student | SchoolClass, type: 'user' | 'student' | 'class') => void;
    isLoadingExternally: boolean;
}

const CreateEntityWizardModal: React.FC<CreateEntityWizardModalProps> = ({
    isOpen,
    onClose,
    onSave,
    existingEntity,
    onOpenLinksModal,
    isLoadingExternally
}) => {
    const [step, setStep] = useState(1);
    const [selectedEntityType, setSelectedEntityType] = useState<EntityType | null>(null);
    const [formData, setFormData] = useState<FormData>({});
    const [mode, setMode] = useState<'create' | 'edit'>('create');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createdEntityHolder, setCreatedEntityHolder] = useState<User | Student | SchoolClass | null>(null);
    const [invitationCode, setInvitationCode] = useState<string | null>(null);

    function getEntityTypeFromData(entity: User | Student | SchoolClass): EntityType {
        if ('email' in entity && 'role' in entity) return 'USER';
        // Check for student-specific fields more reliably
        if (('classId' in entity || 'parentIds' in entity || 'hasUserProfile' in entity) && !('role' in entity)) return 'STUDENT';
        return 'CLASS';
    }
    
    useEffect(() => {
        if (isOpen) { // Reset fields whenever modal is opened or existingEntity changes
            if (existingEntity) {
                setMode('edit');
                const type = getEntityTypeFromData(existingEntity);
                setSelectedEntityType(type);
                setFormData({ ...existingEntity });
                setStep(2); 
            } else {
                setMode('create');
                setStep(1); 
                setFormData({});
                setSelectedEntityType(null);
            }
            setError(null);
            setInvitationCode(null);
            setCreatedEntityHolder(null);
        }
    }, [isOpen, existingEntity]);


    const handleTypeSelect = (type: EntityType) => {
        setSelectedEntityType(type);
        setFormData(type === 'USER' ? { role: UserRole.TEACHER } : {}); 
        if (type === 'STUDENT') {
            setFormData(prev => ({ ...prev, createProfile: false })); // Default no profile for student
        }
        setStep(2);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmitProperties = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedEntityType) {
            setError("Entity type not selected.");
            return;
        }
        if (!formData.name?.trim()) {
            setError("Name is required.");
            return;
        }
        if (selectedEntityType === 'USER' && !formData.email?.trim()) {
            setError("Email is required for users.");
            return;
        }
        if (selectedEntityType === 'USER' && mode === 'create' && !formData.role) {
            setError("Role is required for new users.");
            return;
        }
        if (selectedEntityType === 'STUDENT' && mode === 'create' && formData.createProfile && !formData.email?.trim()) {
            setError("Email is required if creating a user profile for the student.");
            return;
        }


        setIsLoading(true);
        setError(null);
        setInvitationCode(null);
        
        const dataToSave = { ...formData };
        if (mode === 'create' && (!dataToSave.avatarUrl?.trim())) {
             dataToSave.avatarUrl = DEFAULT_AVATAR_PLACEHOLDER;
        } else if (mode === 'edit' && dataToSave.avatarUrl === '') { 
             dataToSave.avatarUrl = DEFAULT_AVATAR_PLACEHOLDER;
        }


        try {
            const result = await onSave(dataToSave, selectedEntityType, mode);
            if (result && result.entity) {
                setCreatedEntityHolder(result.entity);
                if (result.invitationCode) {
                    setInvitationCode(result.invitationCode);
                }
                if (mode === 'create') {
                    setStep(3); 
                } else {
                    onClose(); 
                }
            } else if (mode === 'edit' && result) { // Edit mode might just return entity if no invitation code
                 setCreatedEntityHolder(result.entity);
                 onClose();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred during save.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleManageLinks = () => {
        if (createdEntityHolder && selectedEntityType) {
            onOpenLinksModal(createdEntityHolder, selectedEntityType.toLowerCase() as 'user' | 'student' | 'class');
            onClose(); 
        }
    };
    
    const resetForCreateAnother = () => {
        setStep(1);
        setSelectedEntityType(null);
        setFormData({});
        setError(null);
        setInvitationCode(null);
        setCreatedEntityHolder(null);
    };

    const entityTypeOptions = [
        { type: 'USER' as EntityType, label: 'User (Admin, Teacher, Parent)', icon: UserPlusIcon },
        { type: 'STUDENT' as EntityType, label: 'Student', icon: AcademicCapIcon },
        { type: 'CLASS' as EntityType, label: 'Class', icon: RectangleStackIcon },
    ];

    const renderStepContent = () => {
        if (step === 1 && mode === 'create') { 
            return (
                <div className="space-y-3">
                    <h3 className="text-lg font-medium text-center text-neutral-dark">What do you want to create?</h3>
                    {entityTypeOptions.map(opt => (
                        <Button 
                            key={opt.type}
                            onClick={() => handleTypeSelect(opt.type)} 
                            variant="outline" 
                            fullWidth 
                            className="justify-start py-3 text-left"
                            disabled={isLoading || isLoadingExternally}
                        >
                           <opt.icon className="h-5 w-5 mr-3 text-primary"/> {opt.label}
                        </Button>
                    ))}
                </div>
            );
        }

        if (step === 2) { 
            return (
                <form onSubmit={handleSubmitProperties} className="space-y-4">
                    <Input label="Name" name="name" value={formData.name || ''} onChange={handleChange} required disabled={isLoading || isLoadingExternally} />
                    
                    {selectedEntityType === 'USER' && (
                        <>
                            <Input label="Email" name="email" type="email" value={formData.email || ''} onChange={handleChange} required disabled={isLoading || isLoadingExternally} />
                            {mode === 'create' ? (
                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-neutral-dark mb-1">Role</label>
                                    <select id="role" name="role" value={formData.role || UserRole.TEACHER} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md" disabled={isLoading || isLoadingExternally}>
                                        {[UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT].map(roleValue => ( // Exclude STUDENT_USER from direct creation here
                                            <option key={roleValue} value={roleValue}>{ROLE_DISPLAY_NAMES[roleValue]}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <Input label="Role" name="role_display" value={formData.role ? ROLE_DISPLAY_NAMES[formData.role] : ''} disabled />
                            )}
                        </>
                    )}

                    {selectedEntityType === 'STUDENT' && mode === 'create' && (
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center">
                                <input
                                    id="createProfile"
                                    name="createProfile"
                                    type="checkbox"
                                    checked={formData.createProfile || false}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                    disabled={isLoading || isLoadingExternally}
                                />
                                <label htmlFor="createProfile" className="ml-2 block text-sm text-neutral-dark">
                                    Create user profile for this student? (Allows login)
                                </label>
                            </div>
                            {formData.createProfile && (
                                <Input 
                                    label="Student Email (for profile login)" 
                                    name="email" 
                                    type="email" 
                                    value={formData.email || ''} 
                                    onChange={handleChange} 
                                    required={formData.createProfile} // Required only if checkbox is ticked
                                    placeholder="student.email@example.com"
                                    disabled={isLoading || isLoadingExternally}
                                />
                            )}
                        </div>
                    )}


                    {(selectedEntityType === 'USER' || selectedEntityType === 'STUDENT') && (
                        <Input label="Avatar URL (Optional)" name="avatarUrl" value={formData.avatarUrl || ''} onChange={handleChange} placeholder="Leave empty for default" disabled={isLoading || isLoadingExternally}/>
                    )}
                    {error && <p className="text-sm text-center text-danger p-2 bg-red-50 rounded-md">{error}</p>}
                    <div className="flex justify-end space-x-2 pt-3">
                        <Button type="button" variant="ghost" onClick={mode === 'create' && step === 2 ? () => setStep(1) : onClose} disabled={isLoading || isLoadingExternally}>
                            {mode === 'create' && step === 2 ? 'Back to Type' : 'Cancel'}
                        </Button>
                        <Button type="submit" isLoading={isLoading} disabled={isLoading || isLoadingExternally}>
                            {mode === 'create' ? 'Create Entity' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            );
        }
        if (step === 3 && mode === 'create' && createdEntityHolder) { 
            const entityTypeDisplay = selectedEntityType?.toLowerCase() || 'entity';
            const canManageLinks = !(selectedEntityType === 'USER' && (createdEntityHolder as User).role === UserRole.ADMIN);

            return (
                <div className="text-center space-y-4 py-4">
                    <CheckCircleIcon className="h-12 w-12 text-success mx-auto"/>
                    <h3 className="text-xl font-semibold text-neutral-dark">
                        {selectedEntityType} '{createdEntityHolder.name}' Created!
                    </h3>
                    {invitationCode && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm text-green-700">Invitation Code:</p>
                            <p className="text-lg font-mono text-green-800 tracking-wider">{invitationCode}</p>
                            <p className="text-xs text-gray-500 mt-1">Share this with the user for their first login.</p>
                        </div>
                    )}
                    <p className="text-sm text-gray-600">What would you like to do next?</p>
                    <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3">
                        {canManageLinks && (
                            <Button onClick={handleManageLinks} variant="primary" disabled={isLoadingExternally}>
                                Manage Links for {createdEntityHolder.name}
                            </Button>
                        )}
                        <Button onClick={resetForCreateAnother} variant="outline" disabled={isLoadingExternally}>
                            Create Another Entity
                        </Button>
                        <Button onClick={onClose} variant="ghost" disabled={isLoadingExternally}>Close</Button>
                    </div>
                </div>
            );
        }
        return null;
    };
    
    const getModalTitle = () => {
        if (mode === 'edit' && selectedEntityType) return `Edit ${selectedEntityType} Properties`;
        if (step === 1) return 'Create New Entity';
        if (step === 2 && selectedEntityType) return `Enter ${selectedEntityType} Details`;
        if (step === 3) return 'Entity Created';
        return 'Manage Entity';
    }

    return (
        <Modal isOpen={isOpen} onClose={isLoading ? ()=>{} : onClose} title={getModalTitle()}>
            <div className="p-1 sm:p-2 md:p-4 min-h-[200px]">
                {isLoadingExternally && !isLoading && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10"><p className="text-gray-600">Processing global update...</p></div>}
                 {renderStepContent()}
            </div>
        </Modal>
    );
};

export default CreateEntityWizardModal;