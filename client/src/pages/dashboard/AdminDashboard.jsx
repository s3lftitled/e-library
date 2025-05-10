import React, { useEffect, useState } from 'react';
import usePrivateApi from "../../../hooks/usePrivateApi";
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { ProfileSection } from '../../components/ProfileSection/ProfileSection';
import { ArrowLeft, BarChart3, PieChart, Users, Calendar, Moon, Sun } from 'lucide-react';
import './AdminDashboard.css'


// Register Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const AdminDashboard = () => {
  const [elibraryStats, setElibraryStats] = useState([]);
  const [totalUserCount, setTotalUserCount] = useState(null);
  const [activeChart, setActiveChart] = useState('doughnut');
  const [visitorData, setVisitorData] = useState(null);
  const [showProfileSection, setShowProfileSection] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const navigate = useNavigate();
  const privateAxios = usePrivateApi();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const storedDarkMode = localStorage.getItem('isDarkMode');
    return storedDarkMode ? JSON.parse(storedDarkMode) : false;
  });

  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    // Apply dark mode to body
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch pie chart data
      const statsResponse = await privateAxios.get('/admin-dashboard/get-statistics');
      setElibraryStats(statsResponse.data.elibraryStats);
      setTotalUserCount(statsResponse.data.totalCount);
      
      // Fetch visitor data
      const visitorResponse = await privateAxios.get('/admin-dashboard/api/visitors');
      setVisitorData(visitorResponse.data);
      
      // Set default selected program
      if (visitorResponse.data && Object.keys(visitorResponse.data.monthly.programCounts).length > 0) {
        setSelectedProgram(Object.keys(visitorResponse.data.monthly.programCounts)[0]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Extract labels and data for doughnut chart
  const doughnutLabels = elibraryStats.map(stat => stat.program);
  const doughnutData = elibraryStats.map(stat => stat.percentage);

  // Background colors with transparency for charts
  const backgroundColors = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(199, 199, 199, 0.7)',
    'rgba(83, 102, 255, 0.7)',
    'rgba(78, 113, 51, 0.7)',
    'rgba(40, 180, 99, 0.7)',
    'rgba(220, 100, 150, 0.7)',
    'rgba(120, 150, 220, 0.7)',
  ];

  // Chart data for doughnut chart
  const doughnutChartData = {
    labels: doughnutLabels,
    datasets: [
      {
        data: doughnutData,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  // Chart options for doughnut chart
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: isDarkMode ? '#fff' : '#333',
          font: {
            family: "'Poppins', sans-serif",
            size: 12,
          },
          boxWidth: 15,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: isDarkMode ? '#fff' : '#333',
        bodyColor: isDarkMode ? '#eee' : '#555',
        padding: 15,
        cornerRadius: 10,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.formattedValue || '';
            const count = elibraryStats[context.dataIndex]?.count || '';
            return `${label}: ${value}%, Count: ${count}`;
          },
        },
      },
    },
    cutout: '65%',
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 2000,
    },
  };

  // Chart data for bar chart
  const getBarChartData = () => {
    if (!visitorData || !selectedProgram) return null;

    const { daily, weekly, monthly } = visitorData;
    
    const selectedProgramData = {
      daily: daily.programCounts[selectedProgram] || 0,
      weekly: weekly.programCounts[selectedProgram] || 0,
      monthly: monthly.programCounts[selectedProgram] || 0,
    };

    return {
      labels: ['Daily', 'Weekly', 'Monthly'],
      datasets: [
        {
          label: 'Total Visitors',
          data: [
            daily.totalUniqueVisitors, 
            weekly.totalUniqueVisitors, 
            monthly.totalUniqueVisitors
          ],
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          borderRadius: 8,
          barThickness: 25,
        },
        {
          label: selectedProgram,
          data: [
            selectedProgramData.daily, 
            selectedProgramData.weekly, 
            selectedProgramData.monthly
          ],
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          borderRadius: 8,
          barThickness: 25,
        }
      ]
    };
  };

  // Chart options for bar chart
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDarkMode ? '#ccc' : '#333',
          font: {
            family: "'Poppins', sans-serif",
          },
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDarkMode ? '#ccc' : '#333',
          font: {
            family: "'Poppins', sans-serif",
          },
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDarkMode ? '#fff' : '#333',
          font: {
            family: "'Poppins', sans-serif",
            size: 12,
          },
          boxWidth: 15,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: isDarkMode ? '#fff' : '#333',
        bodyColor: isDarkMode ? '#eee' : '#555',
        padding: 12,
        cornerRadius: 6,
      },
    },
    animation: {
      duration: 2000,
    },
  };

  const handleProgramChange = (e) => {
    setSelectedProgram(e.target.value);
  };

  const navigateToHome = () => {
    navigate('/');
  };

  // Render different charts based on active tab
  const renderChart = () => {
    switch (activeChart) {
      case 'doughnut':
        return <Doughnut data={doughnutChartData} options={doughnutOptions} />;
      case 'bar':
        return visitorData && selectedProgram ? 
          <Bar data={getBarChartData()} options={barOptions} /> : 
          <div className="loading">Loading data...</div>;
      default:
        return <Doughnut data={doughnutChartData} options={doughnutOptions} />;
    }
  };

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <header className="dashboard-header">
        <div className="header-left">
          <button className="back-button" onClick={navigateToHome}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="dashboard-title">Admin Dashboard</h1>
        </div>
        <div className="header-center">
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <h3>{totalUserCount || 0}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <h3>{visitorData?.daily?.totalUniqueVisitors || 0}</h3>
              <p>Today's Visits</p>
            </div>
          </div>
        </div>
        <div className="header-right">
          <button className="theme-toggle" onClick={handleToggleDarkMode}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {showProfileSection && (
        <ProfileSection 
          showProfileSection={showProfileSection}
          setShowProfileSection={setShowProfileSection}
          isDarkMode={isDarkMode}
        />
      )}

      <main className="dashboard-main">
        <div className="chart-tabs">
          <button 
            className={`chart-tab ${activeChart === 'doughnut' ? 'active' : ''}`} 
            onClick={() => setActiveChart('doughnut')}
          >
            <PieChart size={18} />
            <span>User Distribution</span>
          </button>
          <button 
            className={`chart-tab ${activeChart === 'bar' ? 'active' : ''}`} 
            onClick={() => setActiveChart('bar')}
          >
            <BarChart3 size={18} />
            <span>Visitor Stats</span>
          </button>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h2 className="chart-title">
              {activeChart === 'doughnut' && 'User Distribution By Program'}
              {activeChart === 'bar' && 'Visitor Statistics'}
            </h2>
            
            {activeChart === 'bar' && visitorData && (
              <div className="chart-controls">
                <label htmlFor="program-select">Select Program:</label>
                <select 
                  id="program-select"
                  value={selectedProgram || ''}
                  onChange={handleProgramChange}
                  className="program-select"
                >
                  {visitorData && Object.keys(visitorData.monthly.programCounts).map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="chart-wrapper">
            {renderChart()}
          </div>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>© 2025 E-Library System | Admin Dashboard</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;