import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';

const Profile: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    selectedLottery: user?.selectedLottery || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Debug message state changes
  useEffect(() => {
    console.log('Message state changed:', message);
    if (message === null) {
      console.log('Message was set to null - checking call stack');
      console.trace('Message set to null');
    }
  }, [message]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await updateProfile({ ...formData, notificationsEnabled: true });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setLoading(false);
      return;
    }

    // Test error message display
    console.log('Starting password change...');
    console.log('Current password:', passwordData.currentPassword);
    console.log('New password:', passwordData.newPassword);

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Password change error:', error);
      console.error('Error message:', error.message);
      const errorText = error.message || 'Failed to update password. Please try again.';
      console.log('Setting error message:', errorText);
      const messageObj = { type: 'error' as const, text: errorText };
      console.log('Message object:', messageObj);
      setMessage(messageObj);
      
      // Check if message is still there after a short delay
      setTimeout(() => {
        console.log('Message after 100ms:', message);
      }, 100);
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

      {message && (
        <Alert variant={message.type === 'success' ? 'success' : 'danger'} className="mb-4">
          <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
          {message.text}
        </Alert>
      )}

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
              <Form onSubmit={handleProfileUpdate}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="border-0 bg-light"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="border-0 bg-light"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="border-0 bg-light"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="border-0 bg-light"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium">Preferred Lottery</Form.Label>
                  <Form.Select
                    name="selectedLottery"
                    value={formData.selectedLottery}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="border-0 bg-light"
                  >
                    <option value="">Select a lottery</option>
                    {lotteryTypes.map((lottery) => (
                      <option key={lottery.value} value={lottery.value}>
                        {lottery.label}
                      </option>
                    ))}
                  </Form.Select>
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
              <Form onSubmit={handlePasswordUpdate}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Current Password</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPasswords.currentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="border-0 bg-light pe-5"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-link position-absolute end-0 top-50 translate-middle-y p-0 me-2 password-toggle-btn"
                      onClick={() => togglePasswordVisibility('currentPassword')}
                    >
                      <i className={`bi bi-${showPasswords.currentPassword ? 'eye' : 'eye-slash'}`}></i>
                    </button>
                  </div>
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">New Password</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showPasswords.newPassword ? "text" : "password"}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="border-0 bg-light pe-5"
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-link position-absolute end-0 top-50 translate-middle-y p-0 me-2 password-toggle-btn"
                          onClick={() => togglePasswordVisibility('newPassword')}
                        >
                          <i className={`bi bi-${showPasswords.newPassword ? 'eye' : 'eye-slash'}`}></i>
                        </button>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">Confirm New Password</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showPasswords.confirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="border-0 bg-light pe-5"
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-link position-absolute end-0 top-50 translate-middle-y p-0 me-2 password-toggle-btn"
                          onClick={() => togglePasswordVisibility('confirmPassword')}
                        >
                          <i className={`bi bi-${showPasswords.confirmPassword ? 'eye' : 'eye-slash'}`}></i>
                        </button>
                      </div>
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
                  {formData.selectedLottery ? 
                    lotteryTypes.find(l => l.value === formData.selectedLottery)?.label || 'Not selected' 
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

