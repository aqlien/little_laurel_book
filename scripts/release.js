const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const repository = 'aqlien/little_laurel_book';
const releaseTag = 'latest';
const distDirectory = path.join(__dirname, '..', 'dist');

function runGh(args) {
  try {
    execFileSync('gh', args, { stdio: 'inherit' });
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('GitHub CLI (gh) is not installed or is not on PATH.');
    }
    throw new Error('GitHub CLI command failed. Run "gh auth status" to verify authentication.');
  }
}

const metadataPath = path.join(distDirectory, 'latest.yml');
const metadata = fs.existsSync(metadataPath) ? fs.readFileSync(metadataPath, 'utf8') : '';
const installerName = metadata.match(/^path:\s*(.+)$/m)?.[1]?.trim();
const normalizeFileName = (fileName) => fileName.replace(/[ -]/g, '');
const resolveAssetPath = (fileName) => {
  const exactPath = path.join(distDirectory, fileName);
  if (fs.existsSync(exactPath)) {
    return exactPath;
  }

  const normalizedName = normalizeFileName(fileName);
  const matchingName = fs.readdirSync(distDirectory).find(
    (candidate) => normalizeFileName(candidate) === normalizedName,
  );
  return matchingName ? path.join(distDirectory, matchingName) : exactPath;
};
const assetNames = [
  'latest.yml',
  installerName,
  installerName ? `${installerName}.blockmap` : null,
].filter(Boolean);
const assets = assetNames.map(resolveAssetPath);

if (assets.some((asset) => !fs.existsSync(asset))) {
  throw new Error('The dist folder must contain latest.yml and a Windows installer.');
}

const releaseExists = (() => {
  try {
    execFileSync('gh', ['release', 'view', releaseTag, '--repo', repository], { stdio: 'ignore' });
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('GitHub CLI (gh) is not installed or is not on PATH.');
    }
    return false;
  }
})();

if (releaseExists) {
  runGh(['release', 'upload', releaseTag, ...assets, '--clobber', '--repo', repository]);
} else {
  runGh([
    'release',
    'create',
    releaseTag,
    ...assets,
    '--title',
    'Address Book latest',
    '--notes',
    'Automated Address Book release.',
    '--repo',
    repository,
  ]);
}
