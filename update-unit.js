const fs = require('fs');
let code = fs.readFileSync('c:/Users/ASUS/Documents/learnix-frontend/app/find-posts/page.tsx', 'utf8');

// Remove selectedUnit state
code = code.replace(/const \[selectedUnit, setSelectedUnit\] = useState<Unit \| "">("");\r?\n/g, '');
code = code.replace(/selectedUnit !== "" \|\|/g, '');
code = code.replace(/selectedUnit !== "" && \{\r?\n\s*label: UNIT_OPTIONS.find\(\(u\) => u.value === selectedUnit\)\?.label \?\? "",\r?\n\s*onRemove: \(\) => \{ setSelectedUnit\(""); setCurrentPage\(1\); \},\r?\n\s*\},\r?\n/g, '');
code = code.replace(/setSelectedUnit\("");\r?\n/g, '');

// Remove the Unit filter UI section
code = code.replace(/\/\* Đơn vị tính \*\/[\s\S]*?\/\* Sidebar: Dropdown địa điểm \*\//g, '/* Sidebar: Dropdown địa điểm */');

// Remove UnitOptions
code = code.replace(/const UNIT_OPTIONS[\s\S]*?\];\r?\n/g, '');
code = code.replace(/import type \{ Unit, /g, 'import type { ');
code = code.replace(/Unit, /g, '');

fs.writeFileSync('c:/Users/ASUS/Documents/learnix-frontend/app/find-posts/page.tsx', code);
console.log('Done');
