import crypto from 'crypto';

export function validateTelegramInitData(initData: string, botToken: string): any {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) return null;
    
    urlParams.delete('hash');
    const keys = Array.from(urlParams.keys()).sort();
    const dataCheckString = keys.map(key => `${key}=${urlParams.get(key)}`).join('\n');
    
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    
    if (calculatedHash === hash) {
      const userStr = urlParams.get('user');
      if (userStr) return JSON.parse(userStr);
    }
    return null;
  } catch (err) {
    console.error("Telegram validation error:", err);
    return null;
  }
}
console.log(validateTelegramInitData("", "fake_token"));
