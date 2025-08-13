// Configuration file for the application
export const CONFIG = {
  // Owner contact information
  OWNER: {
    PHONE: process.env.OWNER_PHONE || '01303644935',
    NAME: process.env.OWNER_NAME || 'Avilash Palace Owner'
  },
  
  // Support contact information
  SUPPORT: {
    PHONE: process.env.SUPPORT_PHONE || '01303644935',
    EMAIL: process.env.SUPPORT_EMAIL || 'info@avilashpalace.com',
    WEBSITE: process.env.SUPPORT_WEBSITE || 'https://avilash-palace.vercel.app/'
  },
  
  // Payment information
  PAYMENT: {
    BIKASH_NUMBER: process.env.BIKASH_NUMBER || '01303644935',
    PAYMENT_REQUEST_URL: process.env.PAYMENT_REQUEST_URL || 'https://avilash-palace.vercel.app/student/payment-requests'
  },
  
  // SMS configuration
  SMS: {
    API_KEY: process.env.SMS_API_KEY || 'k5LYyZJmNjjbBbwWfhSI',
    SENDER_ID: process.env.SMS_SENDER_ID || '8809617611061',
    API_URL: process.env.SMS_API_URL || 'http://bulksmsbd.net/api/smsapi',
    API_URL_MANY: process.env.SMS_API_URL_MANY || 'http://bulksmsbd.net/api/smsapimany'
  }
};
