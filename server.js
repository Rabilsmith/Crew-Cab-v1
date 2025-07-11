const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

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
  next();
});

// WhatsApp Business webhook verification (GET)
app.get('/webhook', (req, res) => {
  console.log('🔍 WhatsApp webhook verification request');
  console.log('Query params:', req.query);
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  const VERIFY_TOKEN = 'crew_cab_webhook_token_2024';
  
  console.log('Mode:', mode);
  console.log('Token received:', token);
  console.log('Expected token:', VERIFY_TOKEN);
  console.log('Challenge:', challenge);

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully!');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    res.status(403).send('Forbidden');
  }
});

// WhatsApp Business webhook for incoming messages (POST)
app.post('/webhook', (req, res) => {
  console.log('📱 WhatsApp webhook message received');
  console.log('Headers:', req.headers);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  const body = req.body;
  
  // Verify this is a WhatsApp Business webhook
  if (body.object === 'whatsapp_business_account') {
    console.log('✅ WhatsApp Business Account webhook confirmed');
    
    // Process each entry
    body.entry?.forEach(entry => {
      console.log('Processing entry:', entry.id);
      
      // Process each change
      entry.changes?.forEach(change => {
        console.log('Processing change:', change.field);
        
        if (change.field === 'messages') {
          const value = change.value;
          console.log('Message value:', value);
          
          // Process messages
          value.messages?.forEach(message => {
            console.log('📨 New message:', message);
            
            const phoneNumber = message.from;
            const messageId = message.id;
            const timestamp = message.timestamp;
            
            // Handle different message types
            if (message.type === 'text') {
              const messageText = message.text.body;
              console.log(`📱 Text from ${phoneNumber}: ${messageText}`);
              
              // Process the message with your AI chatbot here
              processIncomingMessage(phoneNumber, messageText, messageId);
            } else if (message.type === 'image') {
              console.log(`📸 Image from ${phoneNumber}`);
              // Handle image messages (roster uploads)
            } else if (message.type === 'audio') {
              console.log(`🎤 Audio from ${phoneNumber}`);
              // Handle voice messages
            }
          });
          
          // Process message status updates
          value.statuses?.forEach(status => {
            console.log('📊 Message status update:', status);
          });
        }
      });
    });
    
    // Always respond with 200 OK
    res.status(200).send('EVENT_RECEIVED');
  } else {
    console.log('❌ Not a WhatsApp Business Account webhook');
    res.status(404).send('Not Found');
  }
});

// Process incoming messages
async function processIncomingMessage(phoneNumber, messageText, messageId) {
  console.log(`🤖 Processing message from ${phoneNumber}: ${messageText}`);
  
  try {
    // Simple response logic for testing
    let response = '';
    
    if (messageText.toLowerCase().includes('join driver')) {
      response = `🚗 *Welcome to Crew Cab Driver Network!*\n\nLet's get you started:\n\n1️⃣ What's your full name?\n2️⃣ What car do you drive?\n3️⃣ What's your license plate?\n\nReply with your details to continue.`;
    } else if (messageText.toLowerCase().includes('flight') || messageText.toLowerCase().includes('pickup')) {
      response = `✈️ *Crew Cab Booking*\n\nI can help you book a ride!\n\nWhere should we pick you up from?\n📍 (e.g., Marina, Downtown, Deira)`;
    } else if (messageText.toLowerCase().includes('help')) {
      response = `👋 *Welcome to Crew Cab!*\n\n🚗 For Drivers: Reply "join driver"\n✈️ For Crew: Tell me about your flight\n📋 For Support: Reply "support"\n\nHow can I help you today?`;
    } else {
      response = `👋 Hello! I'm your Crew Cab assistant.\n\n✈️ Need a ride? Tell me about your flight\n🚗 Want to drive? Reply "join driver"\n❓ Need help? Reply "help"`;
    }
    
    // In a real implementation, you would send the response back via WhatsApp API
    console.log(`🤖 Would send response: ${response}`);
    
    // Here you would call the WhatsApp Business API to send the response
    // await sendWhatsAppMessage(phoneNumber, response);
    
  } catch (error) {
    console.error('Error processing message:', error);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    webhook_ready: true,
    verify_token: 'crew_cab_webhook_token_2024'
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({
    message: 'WhatsApp Business Webhook Server',
    webhook_url: '/webhook',
    verify_token: 'crew_cab_webhook_token_2024',
    status: 'ready'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'Crew Cab WhatsApp Business Webhook',
    webhook_url: '/webhook',
    verify_token: 'crew_cab_webhook_token_2024',
    status: 'running',
    endpoints: {
      webhook_verification: 'GET /webhook',
      webhook_messages: 'POST /webhook',
      health_check: 'GET /health',
      test: 'GET /test'
    }
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('💥 Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 WhatsApp Business Webhook Server running on port ${PORT}`);
  console.log(`📍 Webhook URL: /webhook`);
  console.log(`🔑 Verify Token: crew_cab_webhook_token_2024`);
  console.log(`🏥 Health check: /health`);
  console.log(`✅ Ready for WhatsApp Business API integration`);
});