import { useState } from 'react';
import { ShieldCheck, Clock, AlertTriangle, MonitorOff, ArrowRight, Mail, Phone, User, Lock } from 'lucide-react';
export default function IntroScreen({ onStart, onAdminClick }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [errors, setErrors] = useState({});
  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Enter a valid email address';
    }
    if (!contact.trim()) {
      errs.contact = 'Contact number is required';
    } else if (!/^\d{10}$/.test(contact.replace(/\s/g, ''))) {
      errs.contact = 'Enter a valid 10-digit number';
    }
    return errs;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onStart({ name: name.trim(), email: email.trim(), contact: contact.trim() });
    }
  };
  return (
    <div className="intro-screen">
      <button className="admin-login-btn" onClick={onAdminClick} title="Admin Login">
        <Lock size={14} /> Admin
      </button>
      <form className="glass-card intro-card" onSubmit={handleSubmit}>
        <div className="logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/logo2.jpg" alt="NITS Logo" className="brand-image-large" />
        </div>
        <p className="subtitle">
          Welcome to the NITS Assessment Portal.<br />
          Please fill in your details and review the rules before proceeding.
        </p>
        <div className="rules-box">
          <h3><ShieldCheck size={16} /> Exam Rules</h3>
          <ul>
            <li>
              <span className="rule-icon"><Clock size={11} /></span>
              <span>You have <strong style={{ color: 'var(--text-primary)' }}>30 minutes</strong> to answer 45 questions.</span>
            </li>
            <li>
              <span className="rule-icon"><MonitorOff size={11} /></span>
              <span>The exam runs in <strong style={{ color: 'var(--text-primary)' }}>fullscreen mode</strong>. Exiting fullscreen is a violation.</span>
            </li>
            <li>
              <span className="rule-icon"><AlertTriangle size={11} /></span>
              <span>Switching tabs, copy-pasting, or taking screenshots are <strong style={{ color: 'var(--accent-danger)' }}>strictly prohibited</strong>.</span>
            </li>
            <li>
              <span className="rule-icon"><AlertTriangle size={11} /></span>
              <span>All violations are <strong style={{ color: 'var(--accent-warning)' }}>tracked and reported</strong> to the administrator.</span>
            </li>
          </ul>
        </div>
        <div className="form-group">
          <label htmlFor="student-name"><User size={12} style={{ marginRight: 6 }} />Full Name</label>
          <input
            id="student-name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="student-email"><Mail size={12} style={{ marginRight: 6 }} />Email Address</label>
          <input
            id="student-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="student-contact"><Phone size={12} style={{ marginRight: 6 }} />Contact Number</label>
          <input
            id="student-contact"
            type="tel"
            placeholder="Enter 10-digit number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            autoComplete="off"
          />
          {errors.contact && <span className="field-error">{errors.contact}</span>}
        </div>
        <button type="submit" className="btn-primary" disabled={!name.trim() || !email.trim() || !contact.trim()}>
          Start Assessment <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}
