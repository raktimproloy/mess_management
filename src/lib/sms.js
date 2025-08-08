const SMS_API_URL = 'http://bulksmsbd.net/api/smsapi';
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
 * @param {number} dueAmount - Due amount
 * @param {string} dueDate - Due date
 * @returns {string} - Formatted rent reminder message
 */
export function generateRentReminderMessage(studentName, dueAmount, dueDate) {
  const formattedAmount = new Intl.NumberFormat('en-IN').format(dueAmount);
  
  return `⏰ Rent Reminder

Dear ${studentName},

📅 Your rent is due on: ${dueDate}
💰 Due Amount: ৳${formattedAmount}

Please make your payment to avoid any inconvenience.

💳 Payment Methods:
• Cash
• Mobile Banking (Bkash/Nagad/Rocket)

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
