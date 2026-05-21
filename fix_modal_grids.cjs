const fs = require('fs');

const filesToFix = [
  'src/components/appointments/AppointmentsCenter.tsx',
  'src/components/patients/PatientRecordsCenter.tsx',
  'src/components/dentists/DentistsTeamCenter.tsx',
  'src/components/services/ClinicServicesCenter.tsx'
];

for (const file of filesToFix) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Replace strict grid-cols-2 with mobile friendly
    content = content.replace(/className="grid grid-cols-2 gap-(2|3|4)"/g, 'className="grid grid-cols-1 sm:grid-cols-2 gap-$1"');
    
    // Replace strict grid-cols-3 with mobile friendly
    content = content.replace(/className="grid grid-cols-3 gap-(2|3|4)"/g, 'className="grid grid-cols-1 md:grid-cols-3 gap-$1"');
    content = content.replace(/className="grid grid-cols-3 gap-(2|3|4) my-5/g, 'className="grid grid-cols-1 sm:grid-cols-3 gap-$1 my-5');

    // In ClinicServices there is: className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    content = content.replace(/className="grid grid-cols-2 lg:grid-cols-4 gap-4"/g, 'className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"');

    // In PatientRecordsCenter there is: className="flex-1 grid grid-cols-2 md:grid-cols-3
    content = content.replace(/className="flex-1 grid grid-cols-2 md:grid-cols-3/g, 'className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3');

    // ClinicServices form: lg:col-span-12 instead of fixed grid for inner form rows when modal is full screen? 
    content = content.replace(/className="grid grid-cols-1 sm:grid-cols-2 gap-4"/g, 'className="grid grid-cols-1 sm:grid-cols-2 gap-4"');
    
    // In PatientRecordsCenter: col-span-2 md:col-span-3 border-t border-dashed border-gray-100\/80 pt-4 grid grid-cols-2 gap-4
    content = content.replace(/grid-cols-2 gap-4"/g, 'grid-cols-1 sm:grid-cols-2 gap-4"');
    
    fs.writeFileSync(file, content, 'utf8');
  }
}
