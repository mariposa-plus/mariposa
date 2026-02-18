/**
 * Debug script to check email node configuration in MongoDB
 */
require('dotenv').config();
const mongoose = require('mongoose');

const PIPELINE_ID = '6952cef998ac836cbaf2673c';

async function checkEmailConfig() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const Pipeline = mongoose.model('Pipeline', new mongoose.Schema({}, { strict: false }));

    const pipeline = await Pipeline.findById(PIPELINE_ID);

    if (!pipeline) {
      console.log('❌ Pipeline not found');
      return;
    }

    console.log('📋 Pipeline:', pipeline.name);
    console.log('📊 Total nodes:', pipeline.nodes.length);
    console.log('');

    const emailNode = pipeline.nodes.find(n => n.type === 'email');

    if (!emailNode) {
      console.log('❌ No email node found in pipeline');
      return;
    }

    console.log('📧 Email Node Found');
    console.log('  Node ID:', emailNode.id);
    console.log('  Node Type:', emailNode.type);
    console.log('');

    console.log('📦 Node Data Structure:');
    console.log('  Has data:', !!emailNode.data);
    console.log('  Has data.config (legacy):', !!emailNode.data?.config);
    console.log('  Has data.fullConfig:', !!emailNode.data?.fullConfig);
    console.log('  Has data.fullConfig.component:', !!emailNode.data?.fullConfig?.component);
    console.log('');

    if (emailNode.data?.fullConfig?.component) {
      const component = emailNode.data.fullConfig.component;
      console.log('🔑 Component Config Keys:', Object.keys(component));
      console.log('');
      console.log('📧 Email Fields Present:');
      console.log('  provider:', component.provider);
      console.log('  fromAddress:', component.fromAddress);
      console.log('  fromName:', component.fromName);
      console.log('  toEmailTemplate:', component.toEmailTemplate, component.toEmailTemplate === undefined ? '❌ MISSING' : '✅');
      console.log('  subjectTemplate:', component.subjectTemplate);
      console.log('  bodyTemplate:', component.bodyTemplate);
      console.log('');
      console.log('📄 FULL Component Config:');
      console.log(JSON.stringify(component, null, 2));
    }

    if (emailNode.data?.config) {
      console.log('');
      console.log('🔍 Legacy config also present:');
      console.log(JSON.stringify(emailNode.data.config, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

checkEmailConfig();
