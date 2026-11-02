// components/modals/formModals/EditStaffFormModal.jsx

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import EditStaffForm from "../../forms/staffForms/EditStaffForm";

const EditStaffFormModal = ({ isOpen, onClose, staff, onSaved }) => {
  return (
    <AnimatePresence>
      {isOpen && staff && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl relative flex flex-col max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit Profile
                </h2>
                <p className="text-sm text-gray-500">
                  {staff.first_name} {staff.last_name}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <EditStaffForm staff={staff} onClose={onClose} onSaved={onSaved} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

EditStaffFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  staff: PropTypes.object,
  onSaved: PropTypes.func,
};

export default EditStaffFormModal;
