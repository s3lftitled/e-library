import React, { useState } from 'react'
import { Bar } from 'react-chartjs-2'

const ChartComponent = ({ data }) => {
  const [selectedProgram, setSelectedProgram] = useState(Object.keys(data.daily.programCounts)[0])

  const { daily, weekly, monthly } = data

  const dailyVisitorData = { label: 'Daily', total: daily.totalUniqueVisitors }
  const weeklyVisitorData = { label: 'Weekly', total: weekly.totalUniqueVisitors }
  const monthlyVisitorData = { label: 'Monthly', total: monthly.totalUniqueVisitors }

  const visitorLabels = ['Daily', 'Weekly', 'Monthly']
  const visitorDatasets = [
    {
      label: "Total Visitors Count",
      data: [dailyVisitorData.total, weeklyVisitorData.total, monthlyVisitorData.total],
      backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
      borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
      borderWidth: 1,
    },
  ]

    const selectedProgramData = {
    daily: daily.programCounts[selectedProgram] || 0,
    weekly: weekly.programCounts[selectedProgram] || 0,
    monthly: monthly.programCounts[selectedProgram] || 0,
  }

  const programLabels = ['Daily', 'Weekly', 'Monthly']
  const programDatasets = [
    {
      label: selectedProgram,
      data: [selectedProgramData.daily, selectedProgramData.weekly, selectedProgramData.monthly],
      backgroundColor: 'rgba(255, 99, 132, 0.2)', // Adjust colors as needed
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
    },
  ]

  // Chart options
  const options = {
    scales: {
      y: {
        min: 0,
        max: 500
      },
    },
  }

  const handleProgramChange = (e) => {
    setSelectedProgram(e.target.value)
  }

  return (
    <div>
      <Bar data={{ labels: visitorLabels, datasets: visitorDatasets }} options={options} />

      <h2>Total Visitor By Program</h2>
      <select value={selectedProgram} onChange={handleProgramChange}>
        {Object.keys(daily.programCounts).map((program) => (
          <option key={program} value={program}>
            {program}
          </option>
        ))}
      </select>
      <Bar data={{ labels: programLabels, datasets: programDatasets }} options={options} />
    </div>
  )
}

export default ChartComponent;
