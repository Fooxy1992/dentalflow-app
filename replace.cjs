const fs = require('fs');
const files = [
  'src/components/PublicLanding.tsx',
  'src/components/ClinicDashboard.tsx',
  'src/components/appointments/AppointmentsCenter.tsx',
  'src/components/dentists/DentistsTeamCenter.tsx',
  'src/components/financial/FinancialRevenueCenter.tsx',
  'src/components/services/ClinicServicesCenter.tsx'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/pt-BR/g, 'pt-PT');
  content = content.replace(/R\$/g, '€');
  fs.writeFileSync(file, content, 'utf8');
}
