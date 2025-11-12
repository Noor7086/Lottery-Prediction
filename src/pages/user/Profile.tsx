import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { ProfileUpdateForm } from '../../types';

const Profile: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [loading, setLoading] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    setError: setProfileError,
    reset: resetProfile,
    watch: watchProfile
  } = useForm<ProfileUpdateForm>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      selectedLottery: user?.selectedLottery || ''
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    setError: setPasswordError,
    reset: resetPassword,
    watch: watchPassword
  } = useForm<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const newPassword = watchPassword('newPassword');

  // Update form when user changes
  useEffect(() => {
    if (user) {
      resetProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        selectedLottery: user.selectedLottery || ''
      });
    }
  }, [user, resetProfile]);

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleProfileUpdate = async (data: ProfileUpdateForm) => {
    setLoading(true);

    try {
      await updateProfile({ ...data, notificationsEnabled: true });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      const errorData = error.response?.data;
      const status = error.response?.status;

      // Handle validation errors (400, 422) - show below fields, NO toasts
      if ((status === 400 || status === 422) && errorData?.errors && Array.isArray(errorData.errors)) {
        errorData.errors.forEach((err: any) => {
          const fieldName = err.param || err.field || err.path;
          const errorMsg = err.msg || err.message || 'Validation error';
          
          if (fieldName && ['firstName', 'lastName', 'email', 'phone', 'selectedLottery'].includes(fieldName)) {
            setProfileError(fieldName as keyof ProfileUpdateForm, {
              type: 'server',
              message: errorMsg
            });
          }
        });
      } else if (errorData?.message) {
        // For non-validation errors, show toast
        if (errorData.message.includes('Email already in use')) {
          setProfileError('email', {
            type: 'server',
            message: 'Email already in use'
          });
        } else {
          toast.error(errorData.message);
        }
      } else {
        toast.error('Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    setLoading(true);

    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      });
      toast.success('Password updated successfully!');
      resetPassword();
    } catch (error: any) {
      const errorData = error.response?.data;
      const status = error.response?.status;

      // Handle validation errors (400, 422) - show below fields, NO toasts
      if ((status === 400 || status === 422) && errorData?.errors && Array.isArray(errorData.errors)) {
        errorData.errors.forEach((err: any) => {
          const fieldName = err.param || err.field || err.path;
          const errorMsg = err.msg || err.message || 'Validation error';
          
          if (fieldName && ['currentPassword', 'newPassword', 'confirmPassword'].includes(fieldName)) {
            setPasswordError(fieldName as 'currentPassword' | 'newPassword' | 'confirmPassword', {
              type: 'server',
              message: errorMsg
            });
          }
        });
      } else if (errorData?.message) {
        // For non-validation errors, show toast
        toast.error(errorData.message);
      } else {
        toast.error('Failed to update password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const lotteryTypes = [
    { value: 'gopher5', label: 'Gopher 5' },
    { value: 'pick3', label: 'Pick 3' },
    { value: 'lottoamerica', label: 'Lotto America' },
    { value: 'megamillion', label: 'Mega Million' },
    { value: 'powerball', label: 'Powerball' }
  ];

  return (
    <Container className="py-4" style={{ marginTop: '4rem' }}>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-5 fw-bold gradient-text mb-2">Profile Settings</h1>
              <p className="text-muted">Manage your account information and preferences</p>
            </div>
            <div className="d-flex align-items-center">
              <div className="avatar bg-gradient-primary text-white rounded-circle me-3 d-flex align-items-center justify-content-center" 
                   style={{ width: '60px', height: '60px' }}>
                <span className="fw-bold fs-4">{user?.firstName?.charAt(0)}</span>
              </div>
              <div>
                <h5 className="mb-1">{user?.firstName} {user?.lastName}</h5>
                <Badge bg={user?.isInTrial ? 'success' : 'primary'} className="small">
                  {user?.isInTrial ? 'Trial User' : 'Premium User'}
                </Badge>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Profile Information */}
        <Col lg={8}>
          <Card className="border-0 shadow-custom-md mb-4">
            <Card.Header className="bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-person me-2 text-primary"></i>
                  Personal Information
                </h5>
                <Button
                  variant={isEditing ? 'outline-secondary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <i className={`bi bi-${isEditing ? 'x' : 'pencil'} me-1`}></i>
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleProfileSubmit(handleProfileUpdate)}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">First Name</Form.Label>
                      <Form.Control
                        type="text"
                        {...registerProfile('firstName', {
                          required: 'First name is required',
                          minLength: {
                            value: 2,
                            message: 'First name must be at least 2 characters'
                          },
                          maxLength: {
                            value: 50,
                            message: 'First name must not exceed 50 characters'
                          }
                        })}
                        disabled={!isEditing}
                        className={`border-0 bg-light ${profileErrors.firstName ? 'is-invalid' : ''}`}
                      />
                      {profileErrors.firstName && (
                        <div className="invalid-feedback d-block">
                          {profileErrors.firstName.message}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        {...registerProfile('lastName', {
                          required: 'Last name is required',
                          minLength: {
                            value: 2,
                            message: 'Last name must be at least 2 characters'
                          },
                          maxLength: {
                            value: 50,
                            message: 'Last name must not exceed 50 characters'
                          }
                        })}
                        disabled={!isEditing}
                        className={`border-0 bg-light ${profileErrors.lastName ? 'is-invalid' : ''}`}
                      />
                      {profileErrors.lastName && (
                        <div className="invalid-feedback d-block">
                          {profileErrors.lastName.message}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        {...registerProfile('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        disabled={!isEditing}
                        className={`border-0 bg-light ${profileErrors.email ? 'is-invalid' : ''}`}
                      />
                      {profileErrors.email && (
                        <div className="invalid-feedback d-block">
                          {profileErrors.email.message}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        {...registerProfile('phone', {
                          required: 'Phone number is required',
                          pattern: {
                            value: /^\+?[\d\s\-\(\)]+$/,
                            message: 'Invalid phone number'
                          }
                        })}
                        disabled={!isEditing}
                        className={`border-0 bg-light ${profileErrors.phone ? 'is-invalid' : ''}`}
                      />
                      {profileErrors.phone && (
                        <div className="invalid-feedback d-block">
                          {profileErrors.phone.message}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium">Preferred Lottery</Form.Label>
                  <Form.Select
                    {...registerProfile('selectedLottery', {
                      required: 'Please select a lottery'
                    })}
                    disabled={!isEditing}
                    className={`border-0 bg-light ${profileErrors.selectedLottery ? 'is-invalid' : ''}`}
                  >
                    <option value="">Select a lottery</option>
                    {lotteryTypes.map((lottery) => (
                      <option key={lottery.value} value={lottery.value}>
                        {lottery.label}
                      </option>
                    ))}
                  </Form.Select>
                  {profileErrors.selectedLottery && (
                    <div className="invalid-feedback d-block">
                      {profileErrors.selectedLottery.message}
                    </div>
                  )}
                </Form.Group>
                {isEditing && (
                  <div className="d-flex gap-2">
                    <Button type="submit" variant="primary" disabled={loading}>
                      <i className="bi bi-check me-1"></i>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="outline-secondary" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>

          {/* Change Password */}
          <Card className="border-0 shadow-custom-md">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-shield-lock me-2 text-primary"></i>
                Change Password
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handlePasswordSubmit(handlePasswordUpdate)}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Current Password</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPasswords.currentPassword ? "text" : "password"}
                      {...registerPassword('currentPassword', {
                        required: 'Current password is required'
                      })}
                      className={`border-0 bg-light pe-5 ${passwordErrors.currentPassword ? 'is-invalid' : ''}`}
                    />
                    <button
                      type="button"
                      className="btn btn-link position-absolute end-0 top-50 translate-middle-y p-0 me-2 password-toggle-btn"
                      onClick={() => togglePasswordVisibility('currentPassword')}
                    >
                      <i className={`bi bi-${showPasswords.currentPassword ? 'eye' : 'eye-slash'}`}></i>
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <div className="invalid-feedback d-block">
                      {passwordErrors.currentPassword.message}
                    </div>
                  )}
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">New Password</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showPasswords.newPassword ? "text" : "password"}
                          {...registerPassword('newPassword', {
                            required: 'New password is required',
                            minLength: {
                              value: 6,
                              message: 'Password must be at least 6 characters'
                            },
                            pattern: {
                              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                              message: 'Password must contain uppercase, lowercase, and number'
                            }
                          })}
                          className={`border-0 bg-light pe-5 ${passwordErrors.newPassword ? 'is-invalid' : ''}`}
                        />
                        <button
                          type="button"
                          className="btn btn-link position-absolute end-0 top-50 translate-middle-y p-0 me-2 password-toggle-btn"
                          onClick={() => togglePasswordVisibility('newPassword')}
                        >
                          <i className={`bi bi-${showPasswords.newPassword ? 'eye' : 'eye-slash'}`}></i>
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <div className="invalid-feedback d-block">
                          {passwordErrors.newPassword.message}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">Confirm New Password</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showPasswords.confirmPassword ? "text" : "password"}
                          {...registerPassword('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (value) =>
                              value === newPassword || 'Passwords do not match'
                          })}
                          className={`border-0 bg-light pe-5 ${passwordErrors.confirmPassword ? 'is-invalid' : ''}`}
                        />
                        <button
                          type="button"
                          className="btn btn-link position-absolute end-0 top-50 translate-middle-y p-0 me-2 password-toggle-btn"
                          onClick={() => togglePasswordVisibility('confirmPassword')}
                        >
                          <i className={`bi bi-${showPasswords.confirmPassword ? 'eye' : 'eye-slash'}`}></i>
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <div className="invalid-feedback d-block">
                          {passwordErrors.confirmPassword.message}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                <Button type="submit" variant="primary" disabled={loading}>
                  <i className="bi bi-key me-1"></i>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Account Summary */}
        <Col lg={4}>
          <Card className="border-0 shadow-custom-md mb-4">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-info-circle me-2 text-primary"></i>
                Account Summary
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="mb-3">
                <small className="text-muted">Account Status</small>
                <div className="d-flex align-items-center mt-1">
                  <Badge bg={user?.isInTrial ? 'success' : 'primary'} className="me-2">
                    {user?.isInTrial ? 'Trial' : 'Active'}
                  </Badge>
                  <span className="small text-muted">
                    {user?.isInTrial ? 'Free trial active' : 'Premium subscription'}
                  </span>
                </div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Member Since</small>
                <div className="fw-medium">
                  {(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Role</small>
                <div className="d-flex align-items-center mt-1">
                  <Badge bg={user?.role === 'admin' ? 'danger' : 'secondary'} className="me-2">
                    {user?.role === 'admin' ? 'Admin' : 'User'}
                  </Badge>
                </div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Preferred Lottery</small>
                <div className="fw-medium">
                  {watchProfile('selectedLottery') ? 
                    lotteryTypes.find(l => l.value === watchProfile('selectedLottery'))?.label || 'Not selected' 
                    : 'Not selected'
                  }
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-custom-md">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-lightning me-2 text-primary"></i>
                Quick Actions
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="d-grid gap-2">
                <Button variant="outline-primary" size="sm">
                  <i className="bi bi-download me-2"></i>
                  Download Predictions
                </Button>
                <Button variant="outline-success" size="sm">
                  <i className="bi bi-bell me-2"></i>
                  Notification Settings
                </Button>
                <Button variant="outline-info" size="sm">
                  <i className="bi bi-question-circle me-2"></i>
                  Help & Support
                </Button>
                <Button variant="outline-danger" size="sm">
                  <i className="bi bi-trash me-2"></i>
                  Delete Account
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;

