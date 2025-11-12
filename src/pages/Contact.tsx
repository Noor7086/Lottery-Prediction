import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ContactForm } from '../types';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';

const Contact: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError
  } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    try {
      setIsSubmitting(true);
      const response = await apiService.sendContactMessage(data);
      if (response.success) {
        toast.success(response.message || 'Message sent successfully! We\'ll get back to you soon.');
        reset();
      } else {
        toast.error(response.message || 'Failed to send message. Please try again.');
      }
    } catch (error: any) {
      // Extract and display specific validation errors
      const errorData = error.response?.data;
      const status = error.response?.status;
      
      // Handle validation errors (400, 422) - show below fields, NO toasts
      if ((status === 400 || status === 422) && errorData?.errors && Array.isArray(errorData.errors)) {
        // Map server validation errors to form fields
        errorData.errors.forEach((err: any) => {
          const fieldName = err.param || err.field || err.path;
          const errorMsg = err.msg || err.message || 'Validation error';
          
          // Map server field names to form field names if needed
          if (fieldName && ['name', 'email', 'subject', 'message'].includes(fieldName)) {
            setError(fieldName as keyof ContactForm, {
              type: 'server',
              message: errorMsg
            });
          }
        });
        // Don't show toast for validation errors - they're shown below fields
      } else if (status && status >= 500) {
        // Only show toast for server errors (500+)
        toast.error(errorData?.message || 'Server error. Please try again later.');
      } else if (!error.response) {
        // Network errors
        toast.error('Network error. Please check your connection.');
      }
      // For other errors (like 400 without errors array), don't show toast either
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5 mt-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold mb-3">Contact Us</h1>
            <p className="lead text-muted">
              Have questions? We're here to help!
            </p>
          </div>

          <div className="row g-5">
            {/* Contact Form */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-5">
                  <h3 className="mb-4">Send us a Message</h3>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="name" className="form-label">Name</label>
                          <input
                            type="text"
                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                            id="name"
                            {...register('name', { required: 'Name is required' })}
                            placeholder="Your full name"
                          />
                          {errors.name && (
                            <div className="invalid-feedback">{errors.name.message}</div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="email" className="form-label">Email</label>
                          <input
                            type="email"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            id="email"
                            {...register('email', {
                              required: 'Email is required',
                              pattern: {
                                value: /^\S+@\S+$/i,
                                message: 'Invalid email address'
                              }
                            })}
                            placeholder="your.email@example.com"
                          />
                          {errors.email && (
                            <div className="invalid-feedback">{errors.email.message}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="subject" className="form-label">Subject</label>
                      <input
                        type="text"
                        className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                        id="subject"
                        {...register('subject', { required: 'Subject is required' })}
                        placeholder="What's this about?"
                      />
                      {errors.subject && (
                        <div className="invalid-feedback">{errors.subject.message}</div>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="message" className="form-label">Message</label>
                      <textarea
                        className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                        id="message"
                        rows={6}
                        {...register('message', { required: 'Message is required' })}
                        placeholder="Tell us how we can help you..."
                      ></textarea>
                      {errors.message && (
                        <div className="invalid-feedback">{errors.message.message}</div>
                      )}
                    </div>
                    
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3">Get in Touch</h5>
                  <div className="mb-3">
                    <i className="bi bi-envelope text-primary me-2"></i>
                    <span>support@obyyo.com</span>
                  </div>
                  <div className="mb-3">
                    <i className="bi bi-telephone text-primary me-2"></i>
                    <span>Coming Soon</span>
                  </div>
                  <div className="mb-3">
                    <i className="bi bi-clock text-primary me-2"></i>
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3">Quick Links</h5>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <a href="/faq" className="text-decoration-none">
                        <i className="bi bi-question-circle me-2"></i>
                        FAQ
                      </a>
                    </li>
                    <li className="mb-2">
                      <a href="/how-it-works" className="text-decoration-none">
                        <i className="bi bi-info-circle me-2"></i>
                        How It Works
                      </a>
                    </li>
                    <li className="mb-2">
                      <a href="/responsible-play" className="text-decoration-none">
                        <i className="bi bi-shield-check me-2"></i>
                        Responsible Play
                      </a>
                    </li>
                    <li>
                      <a href="/avoid-scams" className="text-decoration-none">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Avoid Scams
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

