import { useState } from "react";
import { Facebook, Mail, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

const TeamPage = () => {
  const [darkMode, setDarkMode] = useState(false);

  const teamMembers = [
    {
      name: "John Lino Demonteverde",
      role: "Lead Developer",
      bio: "With 2 years of MERN stack experience, John Lino leads our development initiatives with technical expertise and creative problem-solving skills.",
      image: "johnlino.jpg",
      email: "jjaviendemonteverde@gmail.com",
      facebook: "https://facebook.com/selftitleddd"
    },
    {
      name: "Jashua Obina",
      role: "Support Developer",
      bio: "Jashua contributes to both frontend and backend development with his MERN stack knowledge, providing valuable support to our development team.",
      image: "jashua.jpg",
      email: "jashua.obina@panpacificu.edu.ph",
      facebook: "https://www.facebook.com/its.kazehazeaae"
    },
    {
      name: "Jeania Radzny",
      role: "Designer / Frontend Developer",
      bio: "Jeania combines her design expertise with MERN stack development skills to create visually stunning and functional user interfaces.",
      image: "/api/placeholder/400/400",
      email: "jeania.radzny@panpacificu.edu.ph",
      facebook: "https://www.facebook.com/jeania.delrey"
    },
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`team-container ${darkMode ? "dark-mode" : ""}`}>
      <Link to="/auth" className={`back-to-login ${darkMode ? "dark-mode" : ""}`}>
        <LogIn size={20} />
        <span>Back to Login</span>
      </Link>
      
      <div className={`team-header ${darkMode ? "dark-mode" : ""}`}>
        <div className="team-header-content">
          <h1>Our Team</h1>
          <h4>Meet the talented developers bringing digital solutions to life with creativity and technical excellence.</h4>
        </div>
      </div>

      <div className="team-section">
        <div className="team-members">
          {teamMembers.map((member, index) => (
            <div key={index} className={`team-member-card ${darkMode ? "dark-mode" : ""}`}>
              <div className="member-image-container">
                <img src={member.image} alt={member.name} className="member-image" />
              </div>
              <div className="member-details">
                <h3 className="member-name">{member.name}</h3>
                <p className="member-role">{member.role}</p>
                <p className="member-bio">{member.bio}</p>
                <div className="member-social">
                  <a href={`mailto:${member.email}`} className="social-link" aria-label="Email">
                    <Mail size={18} />
                  </a>
                  <a href={member.facebook} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                    <Facebook size={18} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="checkbox-wrapper-51">
        <input 
          type="checkbox" 
          checked={darkMode}
          onChange={toggleDarkMode} 
          id="darkModeToggle" 
          className="hidden-toggle"
        />
        <label htmlFor="darkModeToggle" className="toggle">
          <span>
            <svg viewBox="0 0 24 24">
              <path d="M7 12.5c0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5.672-1.5 1.5-1.5 1.5.672 1.5 1.5z" />
              <path d="M9 11c1.33 0 2.71 1.94 3.5 1.94 1.33 0 1.41-1.92 2.5-1.92 1.38 0 2.5 1.5 2.5 3.34 0 1.77-1.36 4.78-6.5 5.96-5.14-1.18-6.5-4.19-6.5-5.96 0-1.84 1.12-3.34 2.5-3.34.5 0 .5.67 1 .67.5 0 .5-.67 1-.67z" />
            </svg>
          </span>
        </label>
      </div>

      <style jsx>{`
        .team-container {
          min-height: 100vh;
          margin: 0;
          padding: 0;
          font-family: "Lexend", sans-serif;
          background-image: url("/HOME_PAGE_BG.png");
          background-size: cover;
          background-attachment: fixed;
          position: relative;
          overflow-x: hidden;
        }

        .team-container.dark-mode {
          background-image: url('/HOME PAGE BGZ.png');
        }

        .back-to-login {
          position: fixed;
          top: 20px;
          left: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #4E7133;
          color: white;
          padding: 10px 15px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          z-index: 100;
        }

        .back-to-login:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
          background-color: #3d5828;
        }

        .back-to-login.dark-mode {
          background-color: #28292e;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }

        .back-to-login.dark-mode:hover {
          background-color: #1a1b1e;
        }

        .team-header {
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          background-color: #4E7133;
          background-image: linear-gradient(135deg, rgba(78, 113, 51, 0.95), rgba(78, 113, 51, 0.8));
          height: 250px;
          margin: 0;
          box-shadow: 0px 5px 25px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
          overflow: hidden;
          position: relative;
        }

        .team-header::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 40%, transparent 50%);
          transition: all 0.6s ease-in-out;
          transform: translateX(-100%);
        }

        .team-header:hover::before {
          transform: translateX(100%);
        }

        .team-header:hover {
          background-image: linear-gradient(135deg, rgba(12, 53, 158, 0.95), rgba(12, 53, 158, 0.8));
          transform: translateY(-5px);
        }

        .team-header.dark-mode {
          background-image: linear-gradient(135deg, rgba(24, 28, 36, 0.95), rgba(24, 28, 36, 0.8));
          box-shadow: 0px 5px 25px rgba(0, 0, 0, 0.4);
        }

        .team-header.dark-mode:hover {
          background-image: linear-gradient(135deg, rgba(40, 41, 46, 0.95), rgba(40, 41, 46, 0.8));
        }

        .team-header-content {
          text-align: center;
          max-width: 800px;
          padding: 0 20px;
          z-index: 1;
        }

        .team-header h1 {
          font-weight: 900;
          margin: 0 0 12px 0;
          font-size: 2.5rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          letter-spacing: 0.5px;
          opacity: 0;
          animation: fadeInUp 0.6s forwards;
          animation-delay: 0.2s;
        }

        .team-header h4 {
          line-height: 1.6;
          margin: 0;
          opacity: 0;
          animation: fadeInUp 0.6s forwards;
          animation-delay: 0.4s;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .team-section {
          max-width: 1400px;
          margin: 0 auto;
          padding: 50px 20px;
        }

        .team-members {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 30px;
          animation: fadeIn 0.8s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .team-member-card {
          display: flex;
          flex-direction: column;
          width: 300px;
          border-radius: 15px;
          background-color: #fff;
          box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
          transform: translateY(0);
        }

        .team-member-card:hover {
          transform: translateY(-10px);
          box-shadow: 0px 15px 30px rgba(0, 0, 0, 0.15);
        }

        .team-member-card::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, #4E7133, #6B9E49);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s ease;
        }

        .team-member-card:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        .team-member-card.dark-mode {
          background-color: #28292e;
          color: #fff;
          box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.3);
        }

        .team-member-card.dark-mode:hover {
          box-shadow: 0px 15px 30px rgba(0, 0, 0, 0.4);
        }

        .member-image-container {
          width: 100%;
          height: 300px;
          overflow: hidden;
        }

        .member-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .team-member-card:hover .member-image {
          transform: scale(1.05);
        }

        .member-details {
          padding: 20px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .member-name {
          margin: 0 0 5px 0;
          font-size: 1.3rem;
          font-weight: 700;
          color: #333;
        }

        .team-member-card.dark-mode .member-name {
          color: #fff;
        }

        .member-role {
          margin: 0 0 15px 0;
          font-size: 0.95rem;
          color: #4E7133;
          font-weight: 600;
        }

        .team-member-card.dark-mode .member-role {
          color: #6B9E49;
        }

        .member-bio {
          margin: 0 0 20px 0;
          font-size: 0.9rem;
          line-height: 1.5;
          color: #555;
          flex-grow: 1;
        }

        .team-member-card.dark-mode .member-bio {
          color: #ccc;
        }

        .member-social {
          display: flex;
          gap: 15px;
          margin-top: auto;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background-color: #f5f5f5;
          border-radius: 50%;
          color: #4E7133;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background-color: #4E7133;
          color: white;
          transform: translateY(-3px);
        }

        .team-member-card.dark-mode .social-link {
          background-color: #333;
          color: #6B9E49;
        }

        .team-member-card.dark-mode .social-link:hover {
          background-color: #6B9E49;
          color: #222;
        }

        .checkbox-wrapper-51 {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 1000;
        }

        .hidden-toggle {
          display: none;
        }

        .checkbox-wrapper-51 .toggle {
          position: relative;
          display: block;
          width: 60px;
          height: 32px;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transform: translate3d(0, 0, 0);
          border-radius: 50px;
          box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }

        .checkbox-wrapper-51 .toggle:before {
          content: "";
          position: relative;
          top: 1px;
          left: 1px;
          width: 58px;
          height: 30px;
          display: block;
          background: linear-gradient(90deg, #47a86f, #4E7133);
          border-radius: 50px;
          transition: background 0.3s ease;
        }

        .checkbox-wrapper-51 .toggle span {
          position: absolute;
          top: 0;
          left: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .checkbox-wrapper-51 .toggle span svg {
          width: 18px;
          height: 18px;
          fill: none;
        }

        .checkbox-wrapper-51 .toggle span svg path {
          stroke: #c8ccd4;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 24;
          stroke-dashoffset: 0;
          transition: all 0.5s linear;
        }

        .checkbox-wrapper-51 input[type="checkbox"]:checked + .toggle:before {
          background: linear-gradient(90deg, #2d3950, #181c24);
        }

        .checkbox-wrapper-51 input[type="checkbox"]:checked + .toggle span {
          transform: translateX(28px);
          background: #222;
        }

        .checkbox-wrapper-51 input[type="checkbox"]:checked + .toggle span path {
          stroke: #6b7280;
          stroke-dasharray: 25;
          stroke-dashoffset: 25;
        }

        @media screen and (max-width: 1200px) {
          .team-members {
            gap: 20px;
          }
          
          .team-member-card {
            width: 280px;
          }
        }

        @media screen and (max-width: 915px) {
          .team-header {
            height: 220px;
          }

          .team-header h1 {
            font-size: 2rem;
          }

          .team-header h4 {
            font-size: 1rem;
          }
          
          .team-member-card {
            width: 260px;
          }
          
          .member-image-container {
            height: 180px;
          }
        }

        @media screen and (max-width: 768px) {
          .team-header {
            height: 200px;
            padding: 20px;
          }

          .team-header h1 {
            font-size: 1.8rem;
          }

          .team-header h4 {
            font-size: 0.9rem;
          }
          
          .team-section {
            padding: 30px 15px;
          }
          
          .team-members {
            gap: 15px;
          }
          
          .team-member-card {
            width: 220px;
          }
          
          .member-image-container {
            height: 160px;
          }
          
          .member-details {
            padding: 15px;
          }
          
          .member-name {
            font-size: 1.1rem;
          }
          
          .member-role {
            font-size: 0.85rem;
          }
          
          .member-bio {
            font-size: 0.8rem;
          }
          
          .back-to-login {
            padding: 8px 12px;
            font-size: 0.9rem;
          }
        }

        @media screen and (max-width: 640px) {
          .team-members {
            flex-direction: column;
            align-items: center;
          }
          
          .team-member-card {
            width: 100%;
            max-width: 320px;
          }
          
          .member-image-container {
            height: 200px;
          }
        }

        @media screen and (max-width: 480px) {
          .team-header {
            height: 180px;
          }
          
          .team-header h1 {
            font-size: 1.5rem;
          }
          
          .team-header h4 {
            font-size: 0.8rem;
          }
          
          .team-section {
            padding: 20px 10px;
          }
          
          .checkbox-wrapper-51 {
            bottom: 20px;
            right: 20px;
          }
          
          .checkbox-wrapper-51 .toggle {
            width: 50px;
            height: 28px;
          }
          
          .checkbox-wrapper-51 .toggle:before {
            width: 48px;
            height: 26px;
          }
          
          .checkbox-wrapper-51 .toggle span {
            width: 28px;
            height: 28px;
          }
          
          .checkbox-wrapper-51 input[type="checkbox"]:checked + .toggle span {
            transform: translateX(22px);
          }
          
          .back-to-login {
            top: 15px;
            left: 15px;
            padding: 6px 10px;
            font-size: 0.8rem;
          }
          
          .back-to-login svg {
            width: 16px;
            height: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default TeamPage