const fs = require('fs');
const path = require('path');

const contractsPath = path.join(__dirname, '..', 'AI_Employee_500_Work_Contracts_v1.json');
let contracts = [];
if (fs.existsSync(contractsPath)) {
  const data = JSON.parse(fs.readFileSync(contractsPath, 'utf8'));
  contracts = Array.isArray(data) ? data : (data.contracts || data.rolepacks || []);
}

function getHomeAreaCode(id) {
  if (id >= 251 && id <= 260) return 'P01';

  if (id >= 1 && id <= 10) return 'A01';
  if (id >= 11 && id <= 18) return 'A02';
  if (id >= 19 && id <= 24) return 'A03';
  if (id >= 41 && id <= 50) return 'A03';
  if (id >= 51 && id <= 60) return 'A04';
  if (id >= 61 && id <= 67) return 'A05';
  if (id >= 68 && id <= 72) return 'A06';
  if (id >= 73 && id <= 86) return 'A07';
  if (id >= 25 && id <= 38) return 'A08';
  if (id === 39 || id === 40 || (id >= 87 && id <= 90)) return 'A09';
  if (id >= 91 && id <= 94) return 'A10';
  if (id >= 95 && id <= 108) return 'A11';
  if (id >= 109 && id <= 118) return 'A12';
  if (id >= 119 && id <= 128) return 'A13';
  if (id >= 129 && id <= 138) return 'A14';
  if (id >= 139 && id <= 148) return 'A15';
  if (id >= 149 && id <= 158) return 'A16';
  if (id >= 159 && id <= 168) return 'A17';
  if (id >= 169 && id <= 178) return 'A18';
  if (id >= 179 && id <= 188) return 'A19';
  if (id >= 189 && id <= 196) return 'A20';
  if (id >= 197 && id <= 200) return 'A21';
  if (id >= 201 && id <= 206) return 'A22';
  if (id >= 207 && id <= 222) return 'A23';
  if (id >= 223 && id <= 232) return 'A24';
  if (id >= 233 && id <= 244) return 'A25';
  if (id >= 245 && id <= 250) return 'A26';
  if (id >= 261 && id <= 264) return 'A26';
  if (id >= 265 && id <= 272) return 'A27';
  if (id >= 273 && id <= 276) return 'A28';

  if (id >= 277 && id <= 286) return 'S01';
  if (id >= 287 && id <= 294) return 'S02';
  if (id >= 295 && id <= 306) return 'S03';
  if (id >= 307 && id <= 322) return 'S04';
  if (id >= 323 && id <= 336) return 'S05';
  if (id >= 337 && id <= 350) return 'S06';
  if (id >= 351 && id <= 366) return 'S07';
  if (id >= 367 && id <= 380) return 'S08';
  if (id >= 381 && id <= 394) return 'S09';
  if (id >= 395 && id <= 406) return 'S10';
  if (id >= 407 && id <= 418) return 'S11';
  if (id >= 419 && id <= 434) return 'S12';
  if (id >= 435 && id <= 442) return 'S13';
  if (id >= 443 && id <= 450) return 'S14';
  if (id >= 451 && id <= 458) return 'S15';
  if (id >= 459 && id <= 466) return 'S16';
  if (id >= 467 && id <= 476) return 'S17';
  if (id >= 477 && id <= 486) return 'S18';
  if (id >= 487 && id <= 494) return 'S19';
  if (id >= 495 && id <= 500) return 'S20';

  return 'A01';
}

function getMembershipType(id) {
  if (id >= 251 && id <= 260) return 'INTERNAL_SUPPORT';
  if (id % 12 === 0) return 'CAPABILITY';
  if (id % 15 === 0) return 'SPECIALIZATION';
  if (id % 18 === 0) return 'TASK_PACK';
  if (id % 20 === 0) return 'MERGED_ROLE';
  return 'PRIMARY_EMPLOYEE';
}

function getSemanticCategory(type) {
  switch (type) {
    case 'PRIMARY_EMPLOYEE': return 'KEEP';
    case 'CAPABILITY': return 'CAPABILITY';
    case 'SPECIALIZATION': return 'SPECIALIZATION';
    case 'TASK_PACK': return 'TASK PACK';
    case 'INTERNAL_SUPPORT': return 'INTERNAL ONLY';
    case 'MERGED_ROLE': return 'MERGE';
    default: return 'KEEP';
  }
}

const memberships = [];
for (let id = 1; id <= 500; id++) {
  const homeCode = getHomeAreaCode(id);
  const contract = Array.isArray(contracts) ? (contracts.find(c => c.rolepack_id === id) || {}) : {};
  const title = contract.rolepack_title || contract.title || `AI Employee #${id}`;
  const key = contract.rolepack_key || contract.key || `rolepack_${id}`;
  const memType = getMembershipType(id);
  const semanticCat = getSemanticCategory(memType);

  let relatedCodes = [];
  if (homeCode === 'A08') relatedCodes = ['A07', 'A10'];
  else if (homeCode === 'A03') relatedCodes = ['A04', 'A05'];
  else if (homeCode === 'A04') relatedCodes = ['A03', 'A05'];
  else if (homeCode === 'A12') relatedCodes = ['A13', 'A14'];
  else if (homeCode.startsWith('S')) relatedCodes = ['A01', 'A03', 'A16'];

  memberships.push({
    commercial_area_id: `area-${homeCode.toLowerCase()}`,
    commercial_area_code: homeCode,
    rolepack_id: id,
    rolepack_key: key,
    rolepack_title: title,
    membership_type: memType,
    semantic_category: semanticCat,
    is_home_area: true,
    related_commercial_area_codes: relatedCodes,
    display_in_catalog: memType !== 'INTERNAL_SUPPORT' && memType !== 'MERGED_ROLE',
    included_by_default: true
  });
}

const outputPath = path.join(__dirname, '..', 'packages', 'shared', 'src', 'abwsem', 'data', 'commercial_area_membership_500_v2.json');
fs.writeFileSync(outputPath, JSON.stringify(memberships, null, 2), 'utf8');
console.log(`Successfully generated ${memberships.length} memberships in ${outputPath}`);
