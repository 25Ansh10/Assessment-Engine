import React from 'react';
import './IdentityCard.css';
import { Check } from 'lucide-react';


const maskEmail = (email) => {
  if (!email || !email.includes('@')) return 'Awaiting Input';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return email;
  return local[0] + '•'.repeat(Math.min(local.length - 2, 5)) + local[local.length - 1] + '@' + domain;
};

const getInitials = (name, email) => {
  if (name && name !== 'Pool Candidate') {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }
  if (!email) return 'AE';
  const local = email.split('@')[0];
  const parts = local.split(/[._\-+]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
};

const TODAY = new Date().toLocaleDateString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric',
});

export default function IdentityCard({ 
  user, 
  type = 'REGISTRATION', 
  isVerified = true, 
  hideEdit = true,
  onEdit 
}) {
  const name = user?.name || 'Pool Candidate';
  const email = user?.email || '';
  const initials = getInitials(name, email);
  const maskedEmail = maskEmail(email);
  const candidateId = user?.id || 'AE-SR-000000';

  return (
    <div className="idc-wrap">
      <div className="idc-card">
        <div className="idc-header">
          <div className="idc-seal">
            <img src="/logo.png" alt="" width="32" height="32" />
          </div>
          <div className="idc-h-text">
            <p className="idc-inst">ArithExam Assessment Board</p>
            <h3 className="idc-title">{type} CARD</h3>
            <div className="idc-chip">DIGITAL IDENTITY</div>
          </div>
          {!hideEdit && (
            <div className="idc-actions">
              <button className="idc-edit-btn" onClick={onEdit}>
                EDIT
              </button>
            </div>
          )}
        </div>

        <div className="idc-body">
          <div className="idc-photo-box">
            {user?.photo ? (
              <img src={user.photo} alt="Candidate" className="idc-img" />
            ) : (
              <div className="idc-ava">{initials}</div>
            )}
            <div className="idc-stamp">CANDIDATE</div>
          </div>
          <div className="idc-fields">
            <div className="idc-row">
              <label>NAME</label>
              <strong className="idc-val-name">{name.toUpperCase()}</strong>
            </div>
            <div className="idc-row">
              <label>EMAIL</label>
              <span>{maskedEmail}</span>
            </div>
            <div className="idc-row">
              <label>CANDIDATE ID</label>
              <span className="idc-id-val">{candidateId}</span>
            </div>
          </div>
        </div>

        <div className="idc-footer">
          <div className="idc-f-left">
            <div className={`idc-status ${isVerified ? 'idc-status--verified' : ''}`}>
              {isVerified ? <span style={{display: 'flex', alignItems: 'center', gap: '3px'}}><Check size={12}/> VERIFIED</span> : 'PENDING'}
            </div>
            <div className="idc-meta">Status: ACTIVE</div>
          </div>
          <div className="idc-f-right">
            <div className="idc-security">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              SECURE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
