const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Import services
const whatsappService = require('./services/whatsappService');

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// WhatsApp webhook endpoint (handles both GET and POST)
app.all('/webhook', async (req, res) => {
  try {
    console.log(`📱 Webhook ${req.method} request received`);
    await whatsappService.handleWebhook(req, res);
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Test WhatsApp connection
app.get('/test-whatsapp', async (req, res) => {
  try {
    console.log('🧪 Testing WhatsApp connection...');
    const result = await whatsappService.testConnection();
    res.json(result);
  } catch (error) {
    console.error('WhatsApp test error:', error);
    res.status(500).json({ error: 'WhatsApp test failed', details: error.message });
  }
});

// Send test message endpoint
app.post('/send-test-message', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        error: 'phoneNumber and message are required',
        example: {
          phoneNumber: '+447520643511',
          message: 'Test message from Crew Cab API'
        }
      });
    }
    
    console.log(`🧪 Sending test message to ${phoneNumber}: ${message}`);
    const result = await whatsappService.sendTestMessage(phoneNumber, message);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Test message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    webhook_ready: true,
    verify_token: 'crew_cab_webhook_token_2024',
    business_number: '+44 7520 643511',
    phone_number_id: process.env.META_PHONE_NUMBER_ID || '1116446593877934',
    has_access_token: !!process.env.META_ACCESS_TOKEN,
    endpoints: {
      webhook: '/webhook',
      test_whatsapp: '/test-whatsapp',
      send_test: '/send-test-message',
      health: '/health'
    },
    meta_api: {
      version: 'v19.0',
      endpoint: `https://graph.facebook.com/v19.0/${process.env.META_PHONE_NUMBER_ID || '1116446593877934'}/messages`
    }
  };
  
  console.log('🏥 Health check requested:', healthData);
  res.status(200).json(healthData);
});

// Test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Crew Cab WhatsApp Business API',
    webhook_url: '/webhook',
    verify_token: 'crew_cab_webhook_token_2024',
    business_number: '+44 7520 643511',
    phone_number_id: process.env.META_PHONE_NUMBER_ID || '1116446593877934',
    status: 'ready',
    test_commands: [
      'join driver',
      'I have a flight at 6 AM',
      'help',
      'status'
    ]
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'Crew Cab WhatsApp Business API',
    business_number: '+44 7520 643511',
    webhook_url: '/webhook',
    verify_token: 'crew_cab_webhook_token_2024',
    phone_number_id: process.env.META_PHONE_NUMBER_ID || '1116446593877934',
    status: 'running',
    endpoints: {
      webhook_verification: 'GET /webhook',
      webhook_messages: 'POST /webhook',
      health_check: 'GET /health',
      test_whatsapp: 'GET /test-whatsapp',
      send_test_message: 'POST /send-test-message'
    },
    ready_for_testing: true
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('💥 Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Crew Cab WhatsApp API Server running on port ${PORT}`);
  console.log(`📱 Business Number: +44 7520 643511`);
  console.log(`📍 Phone Number ID: ${process.env.META_PHONE_NUMBER_ID || '1116446593877934'}`);
  console.log(`🔑 Access Token: ${process.env.META_ACCESS_TOKEN ? 'Configured ✅' : 'Missing ❌'}`);
  console.log(`📍 Webhook URL: /webhook`);
  console.log(`🔑 Verify Token: crew_cab_webhook_token_2024`);
  console.log(`🏥 Health check: /health`);
  console.log(`✅ Ready for WhatsApp Business API integration`);
  console.log(`\n🔗 Public URL: https://crew-cab-v1-production.up.railway.app`);
  console.log(`📋 Meta Webhook URL: https://crew-cab-v1-production.up.railway.app/webhook`);
  console.log(`\n📱 Test Commands to send to +44 7520 643511:`);
  console.log(`   • "join driver" - Driver registration`);
  console.log(`   • "I have a flight at 6 AM" - Booking flow`);
  console.log(`   • "help" - Show all options`);
  console.log(`   • Upload roster image - Bulk booking`);
  console.log(`\n🧪 Test endpoints:`);
  console.log(`   • GET  /test-whatsapp - Test Meta API connection`);
  console.log(`   • POST /send-test-message - Send test message`);
  console.log(`   • GET  /health - System health check`);
});