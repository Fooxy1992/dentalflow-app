const fs = require('fs');

const extractComponents = [
  'src/components/patients/PatientRecordsCenter.tsx',
  'src/components/dentists/DentistsTeamCenter.tsx',
  'src/components/financial/FinancialRevenueCenter.tsx',
  'src/components/services/ClinicServicesCenter.tsx',
  'src/components/appointments/AppointmentsCenter.tsx',
  'src/components/ClinicDashboard.tsx',
  'src/components/PublicLanding.tsx'
];

for (const file of extractComponents) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Make flex-wrap and gap-2 for items-center inside headers that are typically single line.
    content = content.replace(/flex justify-between items-center border-b/g, 'flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-3 border-b');
    content = content.replace(/flex justify-between items-end pb/g, 'flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 pb');
    content = content.replace(/flex justify-between items-center mb/g, 'flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-3 mb');

    // Make table wrappers overflow-x-auto consistently 
    content = content.replace(/<div className="overflow-hidden">[\s\n]*<table/g, '<div className="overflow-x-auto"><table');
    content = content.replace(/<div className="bg-white rounded-[^"]+">[\s\n]*<table/g, '<div className="bg-white overflow-x-auto"><table');
    content = content.replace(/<div className="bg-white p-0">[\s\n]*<table/g, '<div className="bg-white overflow-x-auto p-0"><table');

    // General flex wrapping
    content = content.replace(/"flex items-center gap-3"/g, '"flex flex-wrap items-center gap-3"');
    content = content.replace(/"flex items-center justify-between"/g, '"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"');

    // ClinicDashboard modal headers
    content = content.replace(/className="flex justify-between mb-1/g, 'className="flex flex-col sm:flex-row justify-between mb-1');

    fs.writeFileSync(file, content, 'utf8');
  }
}
