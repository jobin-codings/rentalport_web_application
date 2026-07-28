import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ConfirmationModal({ isOpen, opts, onConfirm, onCancel }) {
  if (!isOpen || !opts) return null;

  const danger = opts.danger !== false;

  return (
    <div className="overlay active" style={{ zIndex: 200 }} onClick={onCancel}>
      <div className="modal" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-form">
          <div className="kind mono" style={{ fontSize: '.72rem', letterSpacing: '.12em', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: '6px' }}>
            {opts.kind || 'Confirmation'}
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '10px' }}>{opts.heading || 'Are you sure?'}</h2>
          <p style={{ fontSize: '.92rem', color: 'var(--steel-soft)', lineHeight: 1.6, margin: '0 0 24px' }}>
            {opts.body || ''}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-ghost" onClick={onCancel}>
              Go back
            </button>
            <button className={`btn ${danger ? 'btn-red' : 'btn-green'}`} onClick={onConfirm}>
              {danger ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
              {opts.confirmLabel || 'Yes, continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
