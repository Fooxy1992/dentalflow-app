const fs = require('fs');
const files = [
  'src/components/patients/PatientRecordsCenter.tsx',
  'src/components/dentists/DentistsTeamCenter.tsx',
  'src/components/financial/FinancialRevenueCenter.tsx',
  'src/components/services/ClinicServicesCenter.tsx',
  'src/components/appointments/AppointmentsCenter.tsx',
  'src/components/ClinicDashboard.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix grid-cols-2 md:grid-cols-4
    content = content.replace(/grid-cols-2 md:grid-cols-4/g, 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4');
    
    // Fix grid-cols-2 lg:grid-cols-5
    content = content.replace(/grid-cols-2 lg:grid-cols-5/g, 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5');
    
    // Fix grid-cols-2 md:grid-cols-3 lg:grid-cols-6
    content = content.replace(/grid-cols-2 md:grid-cols-3 lg:grid-cols-6/g, 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6');

    // Also fix standard layout flex rows that don't wrap properly or are missing flex-wrap on headers
    content = content.replace(/flex justify-between items-center z-50/g, 'flex justify-between items-center z-50 flex-col sm:flex-row gap-2 text-left sm:text-center');
    content = content.replace(/h-20 flex justify-between items-center/g, 'py-2 sm:h-20 flex flex-col sm:flex-row justify-between items-center gap-3');
    
    fs.writeFileSync(file, content, 'utf8');
  }
}
