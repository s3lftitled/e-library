import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';
import { Pie } from 'react-chartjs-2';
import ChartComponent from './BarChart';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './AdminDashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const [elibraryStats, setElibraryStats] = useState([]);
  const [totalUserCount, setTotalUserCount] = useState(null);
  const [showPieChart, setShowPieChart] = useState(true);
  const [visitorData, setVisitorData] = useState(null);

  useEffect(() => {
    fetchPieChartData();
    fetchBarChartData();
  }, []);

  const fetchPieChartData = async () => {
    try {
      const response = await api.get('/admin-dashboard/get-statistics')
      setElibraryStats(response.data.elibraryStats)
      setTotalUserCount(response.data.totalCount)
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchBarChartData = async () => {
    try {
      const response = await api.get('/admin-dashboard/api/visitors')
      console.log(response.data)
      setVisitorData(response.data)
    } catch (error) {
      console.error('Error fetching visitor data:', error);
    }
  }
  
  // Extract labels, percentages, and counts from elibraryStats
  const labels = elibraryStats.map(stat => stat.program)
  const percentages = elibraryStats.map(stat => stat.percentage)

  const pieChartData = {
    labels: labels,
    datasets: [
      {
        data: percentages,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#8A2BE2',
          '#32CD32',
          '#FFA500',
          '#00FFFF',
          '#FF4500',
          '#00BFFF',
          '#8B008B',
          '#228B22',
          '#4B0082',
          '#800000',
          '#D2691E',
          '#800080',
          '#2E8B57',
          '#9932CC',
          '#808000',
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#8A2BE2',
          '#32CD32',
          '#FFA500',
          '#00FFFF',
          '#FF4500',
          '#00BFFF',
          '#8B008B',
          '#228B22',
          '#4B0082',
          '#800000',
          '#D2691E',
          '#800080',
          '#2E8B57',
          '#9932CC',
          '#808000',
        ],
      },
    ],
  }

  // Define chart options for pie chart
  const pieChartOptions = {
    layout: {
      padding: {
        left: 60,
        right: 20,
        top: 0,
        bottom: 0,
      },
    },
    plugins: {
      legend: {
        position: 'left',
        labels: {
          color: '#4E7133',
          responsive: true,
          font: function (context) {
            var avgSize = Math.round((context.chart.height + context.chart.width) / 2);
            var size = Math.round(avgSize / 32);
            size = size > 12 ? 12 : size;
            return {
              size: size,
              weight: 'bold',
              family: 'Lexend',
            };
          },
        },
      },
      tooltip: {
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
    aspectRatio: 2,
    responsive: true,
    maintainAspectRatio: true,
    height: 300,
  };

  return (
    <>
     <div className="dashboard-container">
     <h2 className='stats-h2'>E-Library Stats</h2>
      <div className="stats-option">
        <button onClick={() => setShowPieChart(!showPieChart)}>Toggle Chart</button>
      </div>
      <div className="chart-container">
        {showPieChart ? (
          <>
            <h2>Total User Statistics</h2>
            <h3>Total Users: {totalUserCount}</h3>
            <Pie data={pieChartData} options={pieChartOptions} />
          </>
        ) : (
          <>
            <h2>Total Visitors</h2>
            <ChartComponent data={visitorData} />
          </>
        )}
      </div>
    </div>
    </>
  )
}

export default AdminDashboard;
