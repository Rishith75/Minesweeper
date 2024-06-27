import React from 'react';

const Modal = ({ show, onClose, title, children }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <div className="modal-body">{children}</div>
        <button className="modal-play-again-button" onClick={onClose}>
          Play Again
        </button>
      </div>
    </div>
  );
};

export default Modal;
