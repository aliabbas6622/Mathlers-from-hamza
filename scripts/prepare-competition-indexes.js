const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('Set MONGODB_URI before running this migration.');

async function ensureUniqueIndex(collection, key, groupKey, name) {
  const duplicates = await collection.aggregate([
    { $group: { _id: groupKey, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $limit: 1 },
  ]).toArray();
  if (duplicates.length) throw new Error(`${collection.collectionName} has duplicate records; resolve them before creating ${name}.`);
  await collection.dropIndex(name).catch((error) => {
    if (error.codeName !== 'IndexNotFound') throw error;
  });
  await collection.createIndex(key, { name, unique: true });
}

async function main() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  await ensureUniqueIndex(db.collection('enrollments'), { competition: 1, student: 1 }, { competition: '$competition', student: '$student' }, 'competition_1_student_1');
  await ensureUniqueIndex(db.collection('results'), { competition: 1, student: 1, type: 1 }, { competition: '$competition', student: '$student', type: '$type' }, 'competition_1_student_1_type_1');
  await ensureUniqueIndex(db.collection('competitionroundattempts'), { competition: 1, student: 1, round: 1 }, { competition: '$competition', student: '$student', round: '$round' }, 'competition_1_student_1_round_1');
  const duplicateAccessCodes = await db.collection('competitions').aggregate([
    { $match: { 'registration.accessCode': { $type: 'string', $ne: '' } } },
    { $group: { _id: { $toUpper: { $trim: { input: '$registration.accessCode' } } }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $limit: 1 },
  ]).toArray();
  if (duplicateAccessCodes.length) throw new Error('competitions has duplicate access codes; resolve them before creating the unique access-code index.');
  await db.collection('competitions').dropIndex('registration.accessCode_1').catch((error) => {
    if (error.codeName !== 'IndexNotFound') throw error;
  });
  await db.collection('competitions').createIndex({ 'registration.accessCode': 1 }, { name: 'registration.accessCode_1', unique: true, sparse: true });
  await db.collection('competitionroundattempts').createIndex({ competition: 1, round: 1, score: -1, timeTaken: 1 }, { name: 'competition_1_round_1_score_-1_timeTaken_1' });
  await mongoose.disconnect();
  console.log('Competition indexes are ready.');
}

main().catch(async (error) => {
  await mongoose.disconnect();
  console.error(error.message);
  process.exit(1);
});
