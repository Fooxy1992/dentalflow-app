const fs = require('fs');

const file = 'src/components/ClinicDashboard.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace strict grid-cols-2 with mobile friendly
  content = content.replace(/className="grid grid-cols-2 gap-(2|3|4)"/g, 'className="grid grid-cols-1 sm:grid-cols-2 gap-$1"');
  
  // Replace strict grid-cols-3 with mobile friendly
  content = content.replace(/className="grid grid-cols-3 gap-(2|3|4)"/g, 'className="grid grid-cols-1 sm:grid-cols-3 gap-$1"');
  
  // Also any other static grid grid-cols-2 
  content = content.replace(/className="grid grid-cols-2 mt/g, 'className="grid grid-cols-1 sm:grid-cols-2 mt');

  fs.writeFileSync(file, content, 'utf8');
}
