/**
 * Quick script to reset a processed response for testing
 * Run with: node reset-response.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Redis = require('ioredis');

const PIPELINE_ID = '6952cef998ac836cbaf2673c';
const RESPONSE_ID = 'ACYDBNjqDCJ_L1youWT7rFwawagwVu9Qm8SOLovfCRX7dZYI_rB5dFCG32oYZBwIDA';
const FORM_NODE_ID = 'google-form-1767043693044';

async function resetResponse() {
  let mongoConnection;
  let redisClient;

  try {
    console.log('🔌 Connecting to MongoDB...');
    mongoConnection = await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🔌 Connecting to Redis...');
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
    console.log('✅ Connected to Redis');

    // Define the ProcessedResponse schema
    const ProcessedResponseSchema = new mongoose.Schema({
      pipelineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pipeline', required: true },
      formId: { type: String, required: true },
      responseId: { type: String, required: true },
      processedAt: { type: Date, default: Date.now },
    });

    const ProcessedResponse = mongoose.models.ProcessedResponse ||
      mongoose.model('ProcessedResponse', ProcessedResponseSchema);

    // 1. Delete the ProcessedResponse record
    console.log('\n🗑️  Deleting ProcessedResponse record...');
    const deleteResult = await ProcessedResponse.deleteMany({
      pipelineId: PIPELINE_ID,
      responseId: RESPONSE_ID,
    });
    console.log(`✅ Deleted ${deleteResult.deletedCount} record(s)`);

    // 2. Set Redis cache to old date (day before response)
    console.log('\n🕐 Setting Redis cache to old date...');
    const cacheKey = `forms-watcher:last-check:${PIPELINE_ID}:${FORM_NODE_ID}`;
    const oldDate = '2025-12-28T00:00:00.000Z'; // Day before the response (Dec 29)
    await redisClient.set(cacheKey, oldDate, 'EX', 86400); // 24h TTL
    console.log(`✅ Set cache key to: ${oldDate}`);

    // 3. Set any other cache keys for this pipeline to old date
    console.log('\n🔍 Checking for other cache keys...');
    const pattern = `forms-watcher:last-check:${PIPELINE_ID}:*`;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      console.log(`Found ${keys.length} cache key(s):`, keys);
      console.log('Setting all cache keys to old date...');
      let setCount = 0;
      for (const key of keys) {
        await redisClient.set(key, oldDate, 'EX', 86400);
        setCount++;
      }
      console.log(`✅ Set ${setCount} cache key(s) to old date`);
    } else {
      console.log('No other cache keys found');
    }

    console.log('\n✅ Reset completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Pipeline ID: ${PIPELINE_ID}`);
    console.log(`   Response ID: ${RESPONSE_ID}`);
    console.log(`   Deleted DB records: ${deleteResult.deletedCount}`);
    console.log(`   Cache set to date: ${oldDate}`);
    console.log('\n🎯 Next form watcher poll will reprocess this response!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    // Cleanup
    if (mongoConnection) {
      await mongoose.connection.close();
      console.log('\n🔌 MongoDB connection closed');
    }
    if (redisClient) {
      redisClient.disconnect();
      console.log('🔌 Redis connection closed');
    }
  }
}

resetResponse();
