const ExcelJS = require('exceljs')

// Initialize Excel workbook and worksheet
const workbook = new ExcelJS.Workbook()
const worksheet = workbook.addWorksheet('User Logins')
// Add headers to the Excel worksheet
worksheet.addRow(['Email', 'Timestamp'])

// Function to update the Excel file with user login information
const updateUserLoginsExcel = (email, timestamp) => {
  // Append login data to the Excel worksheet
  worksheet.addRow([email, timestamp])
  // Save the workbook with updated login data
  workbook.xlsx.writeFile('user_logins.xlsx')
}

module.exports = updateUserLoginsExcel
