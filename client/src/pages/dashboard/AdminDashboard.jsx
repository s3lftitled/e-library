import React, { useEffect, useState } from 'react';
import api from '../../../utils/api'
import { Pie } from 'react-chartjs-2'
import './AdminDashboard.css'

export const AdminDashboard = () => {
  const [elibraryStats, setElibraryStats] = useState([])
  const [ totalUserCount, setTotalUserCount ] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/admin-dashboard/get-statistics')
        setElibraryStats(response.data.elibraryStats)
        setTotalUserCount(response.data.totalCount)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  // Extract labels, percentages, and counts from elibraryStats
  const labels = elibraryStats.map(stat => stat.program);
  const percentages = elibraryStats.map(stat => stat.percentage);

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
  };


  // Define chart options
  const chartOptions = {
    layout: {
      padding: {
        left: 10,
        right: 20,
        top: 0,
        bottom: 0,
      },
    },
    plugins: {
      legend: {
        position: 'left',
        labels: {
          color: "#4E7133",
          font: {
            family: "Lexend" ,
            weight: '900',
            size: '14'
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || ''
            const value = context.formattedValue || ''
            const count = elibraryStats[context.dataIndex]?.count || ''
            return `${label}: ${value}%, Count: ${count}`
          },
        },
      },
    },
    aspectRatio: 1.5, 
  }

  return (
    <div className="dashboard-container">
      <div></div>
      <div className="chart-container">
        <h2>Total User Statistics</h2>
        <Pie data={pieChartData} options={chartOptions} />
        <h3>Total User Count: {totalUserCount}</h3>
      </div>
    </div>
  )
}
