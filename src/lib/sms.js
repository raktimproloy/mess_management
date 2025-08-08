const SMS_API_URL = 'http://bulksmsbd.net/api/smsapi';
const SMS_API_URL_MANY = 'http://bulksmsbd.net/api/smsapimany';
const SMS_API_KEY = 'k5LYyZJmNjjbBbwWfhSI';
const SMS_SENDER_ID = '8809617611061';

/**
 * Send SMS using BulkSMSBD API
 * @param {string} number - Phone number to send SMS to
 * @param {string} message - Message content
 * @returns {Promise<Object>} - API response
 */
export async function sendSMS(number, message) {
  try {
    console.log(`📱 Sending SMS to: ${number}`);
    
    const response = await fetch(SMS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: SMS_API_KEY,
        type: 'text',
        number: number,
        senderid: SMS_SENDER_ID,
        message: message
      })
    });

    const result = await response.json();
    
    if (result.response_code === 1000) {
      console.log(`✅ SMS sent successfully to ${number}`);
      return {
        success: true,
        message: 'SMS sent successfully',
        data: result
      };
    } else {
      console.error(`❌ SMS failed for ${number}:`, result.error_message);
      return {
        success: false,
        message: result.error_message || 'SMS sending failed',
        data: result
      };
    }
  } catch (error) {
    console.error(`❌ SMS error for ${number}:`, error);
    return {
      success: false,
      message: 'Network error while sending SMS',
      error: error.message
    };
  }
}

/**
 * Send multiple SMS messages together using BulkSMSBD API
 * @param {Array} messages - Array of objects with 'to' and 'message' properties
 * @returns {Promise<Object>} - API response
 */
export async function sendBulkSMS(messages) {
  try {
    console.log(`📱 Sending bulk SMS to ${messages.length} recipients`);
    
    // Validate messages array
    if (!Array.isArray(messages) || messages.length === 0) {
      return {
        success: false,
        message: 'Messages array is empty or invalid'
      };
    }

    // Validate each message object
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg.to || !msg.message) {
        return {
          success: false,
          message: `Invalid message object at index ${i}. Must have 'to' and 'message' properties`
        };
      }
    }

    const response = await fetch(SMS_API_URL_MANY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: SMS_API_KEY,
        senderid: SMS_SENDER_ID,
        messages: messages
      })
    });

    const result = await response.json();
    
    if (result.response_code === 1000) {
      console.log(`✅ Bulk SMS sent successfully to ${messages.length} recipients`);
      return {
        success: true,
        message: 'Bulk SMS sent successfully',
        data: result,
        totalSent: messages.length
      };
    } else {
      console.error(`❌ Bulk SMS failed:`, result.error_message);
      return {
        success: false,
        message: result.error_message || 'Bulk SMS sending failed',
        data: result
      };
    }
  } catch (error) {
    console.error(`❌ Bulk SMS error:`, error);
    return {
      success: false,
      message: 'Network error while sending bulk SMS',
      error: error.message
    };
  }
}

/**
 * Send bulk SMS with message generation function
 * @param {Array} recipients - Array of recipient objects
 * @param {Function} messageGenerator - Function to generate message for each recipient
 * @returns {Promise<Object>} - API response
 */
export async function sendBulkSMSWithGenerator(recipients, messageGenerator) {
  try {
    console.log(`📱 Preparing bulk SMS for ${recipients.length} recipients`);
    
    // Generate messages for each recipient
    const messages = recipients.map(recipient => {
      const message = messageGenerator(recipient);
      return {
        to: recipient.phone || recipient.smsPhone,
        message: message
      };
    });

    // Filter out invalid messages
    const validMessages = messages.filter(msg => msg.to && msg.message);
    
    if (validMessages.length === 0) {
      return {
        success: false,
        message: 'No valid messages to send'
      };
    }

    console.log(`📱 Sending ${validMessages.length} valid messages out of ${recipients.length} recipients`);
    
    return await sendBulkSMS(validMessages);
    
  } catch (error) {
    console.error(`❌ Bulk SMS with generator error:`, error);
    return {
      success: false,
      message: 'Error generating bulk SMS messages',
      error: error.message
    };
  }
}

/**
 * Generate welcome message for new student
 * @param {string} studentName - Student's name
 * @param {string} categoryTitle - Category title
 * @param {number} rentAmount - Rent amount
 * @returns {string} - Formatted welcome message
 */
export function generateWelcomeMessage(studentName, categoryTitle, rentAmount) {
  const formattedAmount = new Intl.NumberFormat('en-IN').format(rentAmount);
  
  return `🎓 Welcome to Avilash Palace Mess!

Dear ${studentName},

✅ Your registration has been completed successfully!
📋 Category: ${categoryTitle}
💰 Monthly Rent: ৳${formattedAmount}

📞 For any queries, contact us:
📱 Phone: 01912345678
📧 Email: info@avilashpalace.com

🏠 We hope you have a wonderful stay with us!

Best regards,
Avilash Palace Management
🏢 Mess Management System`;
}

/**
 * Generate payment confirmation message
 * @param {string} studentName - Student's name
 * @param {number} amount - Payment amount
 * @param {string} paymentMethod - Payment method
 * @returns {string} - Formatted payment confirmation message
 */
export function generatePaymentConfirmationMessage(studentName, amount, paymentMethod) {
  const formattedAmount = new Intl.NumberFormat('en-IN').format(amount);
  
  return `💳 Payment Confirmation

Dear ${studentName},

✅ Your payment has been received successfully!
💰 Amount: ৳${formattedAmount}
💳 Method: ${paymentMethod}
📅 Date: ${new Date().toLocaleDateString('en-IN')}

📊 Payment Status: CONFIRMED

Thank you for your payment!

Best regards,
Avilash Palace Management
🏢 Mess Management System`;
}

/**
 * Generate rent reminder message
 * @param {string} studentName - Student's name
 * @param {number} rentDue - Rent due amount
 * @param {number} externalDue - External due amount
 * @param {number} advanceDue - Advance due amount
 * @param {string} dueDate - Due date
 * @param {string} bikashNumber - Bikash number for payment
 * @param {number} previousDue - Previous due amount (optional)
 * @returns {string} - Formatted rent reminder message
 */
export function generateRentReminderMessage(studentName, rentDue, externalDue, advanceDue, dueDate, bikashNumber, previousDue = 0) {
  const totalDue = rentDue + externalDue + advanceDue + previousDue;
  const formattedTotal = new Intl.NumberFormat('en-IN').format(totalDue);
  const formattedRent = new Intl.NumberFormat('en-IN').format(rentDue);
  const formattedExternal = new Intl.NumberFormat('en-IN').format(externalDue);
  const formattedAdvance = new Intl.NumberFormat('en-IN').format(advanceDue);
  const formattedPrevious = new Intl.NumberFormat('en-IN').format(previousDue);
  
  let breakdownText = `📋 Due Breakdown:
• Rent: ৳${formattedRent}
• External: ৳${formattedExternal}
• Advance: ৳${formattedAdvance}`;

  // Add previous due if it exists
  if (previousDue > 0) {
    breakdownText += `\n• Previous Due: ৳${formattedPrevious}`;
  }
  
  return `⏰ Rent Reminder

Dear ${studentName},

📅 Your rent is due on: ${dueDate}
💰 Total Due Amount: ৳${formattedTotal}

${breakdownText}

💳 Payment Methods:
• Cash
• Mobile Banking (Bkash/Nagad/Rocket)

📱 Online Payment:
Bkash: ${bikashNumber}
🔗 Payment Request: https://avilashpalace.com/payment-request

📞 For assistance: 01912345678

Best regards,
Avilash Palace Management
🏢 Mess Management System`;
}

/**
 * Generate complaint status update message
 * @param {string} studentName - Student's name
 * @param {string} complaintTitle - Complaint title
 * @param {string} status - Complaint status
 * @returns {string} - Formatted complaint status message
 */
export function generateComplaintStatusMessage(studentName, complaintTitle, status) {
  const statusEmoji = {
    'pending': '⏳',
    'checking': '🔍',
    'solved': '✅',
    'canceled': '❌'
  };
  
  const statusText = {
    'pending': 'Pending',
    'checking': 'Under Review',
    'solved': 'Resolved',
    'canceled': 'Canceled'
  };
  
  return `📝 Complaint Status Update

Dear ${studentName},

${statusEmoji[status]} Your complaint has been updated:
📋 Title: ${complaintTitle}
🔄 Status: ${statusText[status]}

We are working to resolve your issue as soon as possible.

📞 For urgent matters: 01912345678

Best regards,
Avilash Palace Management
🏢 Mess Management System`;
}

/**
 * Generate general notification message
 * @param {string} studentName - Student's name
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @returns {string} - Formatted notification message
 */
export function generateNotificationMessage(studentName, title, message) {
  return `📢 Important Notice

Dear ${studentName},

📋 ${title}

${message}

📞 For queries: 01912345678

Best regards,
Avilash Palace Management
🏢 Mess Management System`;
}
