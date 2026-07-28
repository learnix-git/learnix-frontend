const fs = require('fs');
let code = fs.readFileSync('c:/Users/ASUS/Documents/learnix-frontend/app/find-posts/page.tsx', 'utf8');

code = code.replace(/const \[selectedUnit, setSelectedUnit\] = useState<Unit \| "">("");\r?\n/, '');

// Find UNIT_OPTIONS
code = code.replace(/const UNIT_OPTIONS[\s\S]*?\];\r?\n/, '');

// Remove selectedUnit !== "" ||
code = code.replace(/selectedUnit !== "" \|\|/g, '');

// Remove activeChip selectedUnit
code = code.replace(/selectedUnit !== "" && \{\s*label: UNIT_OPTIONS.find[\s\S]*?setCurrentPage\(1\); \},\s*\},\s*/g, '');

// Remove setSelectedUnit from clearAllFilters
code = code.replace(/setSelectedUnit\("");\r?\n/, '');

// Remove Unit filter UI section
code = code.replace(/\{\/\* Đơn vị tính \*\/\}(.|\n)*?\{\/\* Sidebar: Dropdown địa điểm \*\/\}/g, '{/* Sidebar: Dropdown địa điểm */}');

fs.writeFileSync('c:/Users/ASUS/Documents/learnix-frontend/app/find-posts/page.tsx', code);
