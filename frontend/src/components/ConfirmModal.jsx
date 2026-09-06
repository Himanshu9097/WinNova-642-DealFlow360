import React from 'react';

export default function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
  onConfirm,
  onClose
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="modal fade show d-block" 
      tabIndex="-1" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(3px)', zIndex: 1055 }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-body p-4 text-center">
            <div 
              className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-3 bg-${confirmVariant}-subtle text-${confirmVariant}`}
              style={{ width: '60px', height: '60px' }}
            >
              <i className="fa fa-exclamation-triangle fs-3" style={{ color: '#d9534f' }}></i>
            </div>
            
            <h5 className="modal-title fw-bold mb-2 text-dark">{title}</h5>
            <p className="text-muted small mb-4">{message}</p>

            <div className="d-flex justify-content-center gap-2">
              <button 
                type="button" 
                className="btn btn-light px-4 py-2 fw-semibold rounded-pill"
                onClick={onClose}
                disabled={loading}
              >
                {cancelText}
              </button>
              <button 
                type="button" 
                className={`btn btn-${confirmVariant} px-4 py-2 fw-bold rounded-pill shadow-sm`}
                style={confirmVariant === 'danger' ? { backgroundColor: '#D6536D', borderColor: '#D6536D' } : {}}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? (
                  <span><i className="fa fa-spinner fa-spin me-1"></i> Processing...</span>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
