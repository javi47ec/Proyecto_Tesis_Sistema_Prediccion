import React from "react";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <button
          className="absolute top-2 right-2 text-red-500"
          onClick={onClose}
        >
          X
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
