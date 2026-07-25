import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import {
  foundationIngredientExclusions,
  foundationIngredientNormalizations,
} from '../constants/ingredientNormalization.js';

const getOption = (optionName) => {
  const index = process.argv.indexOf(optionName);
  return index >= 0 ? process.argv[index + 1] : undefined;
};

const inputPath = getOption('--input');
const outputPath = getOption('--output');

if (!inputPath || !outputPath) {
  throw new Error(
    'Usage: node scripts/generateFoundationIngredientReview.js --input <food.csv> --output <review.csv>'
  );
}

const parseCsv = (csv, onRow) => {
  let field = '';
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];

    if (character === '"') {
      if (inQuotes && csv[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (character === ',' && !inQuotes) {
      row.push(field);
      field = '';
    } else if ((character === '\n' || character === '\r') && !inQuotes) {
      if (character === '\r' && csv[index + 1] === '\n') {
        index += 1;
      }

      row.push(field);
      if (row.some((value) => value.length > 0)) {
        onRow(row);
      }
      field = '';
      row = [];
    } else {
      field += character;
    }
  }

  row.push(field);
  if (row.some((value) => value.length > 0)) {
    onRow(row);
  }
};

const toNormalizedName = (value) =>
  value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const toCsvValue = (value) => `"${String(value).replaceAll('"', '""')}"`;

const categoryById = new Map();
const categoryCsv = await readFile(
  resolve(dirname(inputPath), 'food_category.csv'),
  'utf8'
);

let isCategoryHeader = true;
parseCsv(categoryCsv, (row) => {
  if (isCategoryHeader) {
    isCategoryHeader = false;
    return;
  }

  categoryById.set(row[0], row[2]);
});

const foodCsv = await readFile(resolve(inputPath), 'utf8');
const reviewRows = [];
let isFoodHeader = true;
let foundationFoodRecordCount = 0;
let approvedCount = 0;
let excludedCount = 0;
const foundationFoodsByDescription = new Map();

parseCsv(foodCsv, (row) => {
  if (isFoodHeader) {
    isFoodHeader = false;
    return;
  }

  const [fdcId, dataType, description, categoryId, publicationDate] = row;
  if (dataType !== 'foundation_food') {
    return;
  }

  foundationFoodRecordCount += 1;
  const existingFood = foundationFoodsByDescription.get(description);

  if (!existingFood || publicationDate > existingFood.publicationDate) {
    foundationFoodsByDescription.set(description, {
      fdcId,
      categoryId,
      description,
      publicationDate,
    });
  }
});

for (const food of foundationFoodsByDescription.values()) {
  const exclusion = foundationIngredientExclusions.find(({ pattern }) =>
    pattern.test(food.description)
  );
  const normalization = foundationIngredientNormalizations[food.description];
  const proposedDisplayName = normalization?.displayName ?? '';
  const aliases = normalization?.aliases.join(' | ') ?? '';
  const decision = exclusion
    ? 'exclude'
    : normalization && !normalization.reviewOnly
      ? 'approved'
      : 'review';
  const reason = exclusion
    ? exclusion.reason
    : normalization?.reviewOnly
      ? 'Matches a proposed normalization rule that still needs approval.'
      : normalization
        ? 'Matches an approved exact normalization rule.'
        : 'Needs a reviewed canonical display name before it can be seeded.';

  if (decision === 'exclude') {
    excludedCount += 1;
  } else if (decision === 'approved') {
    approvedCount += 1;
  }

  reviewRows.push([
    food.fdcId,
    categoryById.get(food.categoryId) ?? '',
    food.description,
    proposedDisplayName,
    proposedDisplayName ? toNormalizedName(proposedDisplayName) : '',
    aliases,
    decision,
    reason,
  ]);
}

reviewRows.sort(
  (left, right) =>
    left[1].localeCompare(right[1]) || left[2].localeCompare(right[2])
);

const header = [
  'fdc_id',
  'category',
  'source_description',
  'proposed_display_name',
  'normalized_name',
  'aliases',
  'decision',
  'reason',
];
const reviewCsv = [header, ...reviewRows]
  .map((row) => row.map(toCsvValue).join(','))
  .join('\n');

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${reviewCsv}\n`);

console.log(
  `Wrote ${foundationFoodsByDescription.size} distinct Foundation Food candidates from ${foundationFoodRecordCount} records to ${outputPath} (${approvedCount} approved, ${excludedCount} excluded, ${foundationFoodsByDescription.size - approvedCount - excludedCount} awaiting review).`
);
