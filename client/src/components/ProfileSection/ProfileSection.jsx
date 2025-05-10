import React, { useState, useEffect } from "react";
import useUserData from "../../../hooks/useUserData";
import { useNavigate } from "react-router-dom";
import usePrivateApi from "../../../hooks/usePrivateApi";
import Form from '../../components/UploadForm/Form';
import SuccessAlert from "../Alerts/SuccessAlert/SuccessAlerts";
import ErrorAlert from "../Alerts/ErrorAlert/ErrorAlerts";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Bookmark, LogOut, X, User, Lock, Briefcase } from "lucide-react";
import './ProfileSection.css'

export const ProfileSection = React.memo(({ showProfileSection, setShowProfileSection, isDarkMode }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [base64Image, setBase64Image] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const { user } = useUserData();
  const userID = localStorage.getItem("userID");
  const navigate = useNavigate();
  const privateAxios = usePrivateApi();

  const handleSubmission = async (e) => {
    e.preventDefault();

    try {
      const response = await privateAxios.post(`/users/profile/upload-image/${userID}`, {
        base64Image: base64Image
      }, { withCredentials: true });

      if (response.status === 200) {
        setSuccessMsg('Profile picture changed successfully. Refresh the page to see changes');
        setIsUploading(false);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Error uploading profile picture");
      console.error("Error uploading profile picture:", err);
    }
  };

  const openForm = () => setShowForm(true);
  const closeForm = () => setShowForm(false);

  const convertToBase64 = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        setBase64Image(reader.result);
      };

      reader.onerror = (error) => {
        console.error("Error reading file:", error);
      };
    }
  };

  const handleLogOut = async () => {
    try {
      const response = await privateAxios.delete(`auth/logout/${userID}`);

      if (response.status === 200) {
        localStorage.clear();
        navigate('/auth');
      }
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const navigateToDashboard = () => navigate('/admin-dashboard');
  
  const profileVariants = {
    hidden: { x: -400, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { x: -400, opacity: 0, transition: { duration: 0.3 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      {successMsg && <SuccessAlert message={successMsg} onClose={() => setSuccessMsg(null)} />}
      {errorMsg && <ErrorAlert message={errorMsg} onClose={() => setErrorMsg(null)} />}
      
      {!showProfileSection ? (
        <motion.div
          className="user-icon-container"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowProfileSection(true)}
        >
          <div className="user-icon-wrapper">
            <img 
              className="user-icon" 
              src={user.profilePic ? user.profilePic : "/pfp.avif?url"} 
              alt="user pfp" 
            />
            <div className="user-icon-overlay">
              <User size={16} />
            </div>
          </div>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div 
            className={`profile-section ${isDarkMode ? 'dark-mode' : ''}`}
            variants={profileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.button
              className="hide-profile-section"
              onClick={() => setShowProfileSection(false)}
              whileHover={{ scale: 1.1, backgroundColor: "#3a5a26" }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={18} />
            </motion.button>
            
            <div className="profile-content-container">
              <motion.div 
                className="user-details"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                <motion.div 
                  className="profile-header"
                  variants={itemVariants}
                >
                  <div className="profile-pic-container">
                    <motion.img
                      src={user?.profilePic || "/pfp.avif?url"}
                      alt="user's profile picture"
                      className="user-pic"
                      whileHover={{ scale: 1.05 }}
                    />
                    {!isUploading && (
                      <motion.button
                        className="change-pic-btn"
                        onClick={() => setIsUploading(true)}
                        whileHover={{ scale: 1.05, backgroundColor: "#3a5a26" }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Camera size={16} className="btn-icon" />
                        <span>Change Picture</span>
                      </motion.button>
                    )}
                  </div>

                  {isUploading && (
                    <motion.form 
                      className="upload-pic-form"
                      onSubmit={handleSubmission}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="file-input-container">
                        <input
                          type="file"
                          accept=".jpeg, .jpg, .png"
                          onChange={convertToBase64}
                          id="file-upload"
                          className="file-input"
                        />
                        <label htmlFor="file-upload" className="file-label">
                          <Camera size={16} className="btn-icon" />
                          <span>Select Image</span>
                        </label>
                      </div>
                      <div className="upload-btn-choices">
                        <motion.button 
                          type="submit"
                          whileHover={{ scale: 1.05, backgroundColor: "#3a5a26" }}
                          whileTap={{ scale: 0.95 }}
                          disabled={!base64Image}
                        >
                          Upload
                        </motion.button>
                        <motion.button 
                          type="button"
                          onClick={() => setIsUploading(false)}
                          whileHover={{ scale: 1.05, backgroundColor: "#3a5a26" }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </motion.form>
                  )}
                </motion.div>

                <motion.div 
                  className="user-info"
                  variants={itemVariants}
                >
                  <motion.h2 
                    key={user?._id} 
                    className="user-greeting"
                    variants={itemVariants}
                  >
                    Hello! {user?.username} 👋
                  </motion.h2>
                  
                  <motion.div className="user-metadata" variants={itemVariants}>
                    <div className="metadata-item">
                      <User size={16} className="metadata-icon" />
                      <h3 className="user-email">{user?.email}</h3>
                    </div>
                    
                    <div className="metadata-item">
                      <Briefcase size={16} className="metadata-icon" />
                      <h4 className="user-role">{user?.role}</h4>
                    </div>
                    
                    {user.departmentName && (
                      <div className="metadata-item">
                        <div className="metadata-icon department-icon" />
                        <h4 className="user-department">
                          <span>Department:</span> {user?.departmentName}
                        </h4>
                      </div>
                    )}
                    
                    {user.programName && (
                      <div className="metadata-item">
                        <div className="metadata-icon program-icon" />
                        <h4 className="user-department">
                          <span>Program:</span> {user?.programName}
                        </h4>
                      </div>
                    )}
                  </motion.div>
                </motion.div>

                <motion.div className={`separator-underline ${isDarkMode ? 'dark-mode' : ''}`} variants={itemVariants} />

                <motion.div className="user-content-section" variants={itemVariants}>
                  <motion.div 
                    className="nav-item" 
                    onClick={() => navigate('/bookshelf')}
                    whileHover={{ backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(78, 113, 51, 0.1)' }}
                  >
                    <Bookmark size={18} className="nav-icon" />
                    <h2>BOOKSHELF</h2>
                  </motion.div>
                  
                  {user.role === 'Librarian' && (
                    <motion.div 
                      className="nav-item" 
                      onClick={() => navigateToDashboard()}
                      whileHover={{ backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(78, 113, 51, 0.1)' }}
                    >
                      <Briefcase size={18} className="nav-icon" />
                      <h2>DASHBOARD</h2>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div className={`separator-underline ${isDarkMode ? 'dark-mode' : ''}`} variants={itemVariants} />
                
                <motion.div className="log-out-section" variants={itemVariants}>
                  <motion.a 
                    onClick={openForm}
                    whileHover={{ scale: 1.03 }}
                    className="change-password-link"
                  >
                    <Lock size={16} className="link-icon" />
                    <span>Change password?</span>
                  </motion.a>
                  
                  <motion.button 
                    onClick={() => handleLogOut()}
                    whileHover={{ scale: 1.05, backgroundColor: "#3a5a26" }}
                    whileTap={{ scale: 0.95 }}
                    className="logout-button"
                  >
                    <LogOut size={16} className="btn-icon" />
                    <span>LOG OUT</span>
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>
            
            {showForm && <Form onClose={closeForm} type="change-password" programID={null} />}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
});