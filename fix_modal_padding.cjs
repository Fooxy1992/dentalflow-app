const fs = require('fs');

const filesToFix = [
  'src/components/appointments/AppointmentsCenter.tsx',
  'src/components/patients/PatientRecordsCenter.tsx',
  'src/components/dentists/DentistsTeamCenter.tsx',
  'src/components/financial/FinancialRevenueCenter.tsx',
  'src/components/services/ClinicServicesCenter.tsx',
  'src/components/ClinicDashboard.tsx'
];

for (const file of filesToFix) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Replace strict p-8, p-6, etc on modals with responsive padding
    content = content.replace(/className=\"bg-white rounded-[^\"]+ max-w-[a-z]+ w-full p-8/g, function(match){
      return match.replace("p-8", "p-4 sm:p-8 max-h-[90vh] overflow-y-auto");
    });
    
    content = content.replace(/className=\"bg-white rounded-[^\"]+ max-w-[a-z]+ w-full p-6/g, function(match){
      return match.replace("p-6", "p-4 sm:p-6 max-h-[90vh] overflow-y-auto");
    });

    content = content.replace(/className=\"bg-white rounded-[^\"]+ w-full max-w-[a-z0-9xl]+ border/g, function(match){
      return match + " max-h-[90vh] overflow-y-auto";
    });

    // Also look for fixed panels like the one in DentistsTeamCenter.tsx
    content = content.replace(/className=\"fixed right-0 top-0 bottom-0 max-w-[a-z]+ w-full bg-white z-50 shadow-2xl p-7/g, 'className="fixed right-0 top-0 bottom-0 max-w-lg w-full sm:w-8/12 md:w-full bg-white z-50 shadow-2xl p-4 sm:p-7');

    fs.writeFileSync(file, content, 'utf8');
  }
}
