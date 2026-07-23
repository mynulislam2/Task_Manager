import { Platform, PermissionsAndroid } from 'react-native';
import { parseSms, categorizeTransaction, SmsTransaction } from './SmsParser';

export interface SmsImportResult {
  imported: number;
  skipped: number;
  errors: number;
  transactions: SmsTransaction[];
  smsRead: number;
  smsError?: string;
}

/**
 * Request SMS reading permission on Android.
 */
export async function requestSmsPermission(): Promise<boolean | 'settings'> {
  if (Platform.OS !== 'android') return false;

  try {
    const permission = 'android.permission.READ_SMS';

    const hasIt = await PermissionsAndroid.check(permission);
    if (hasIt) return true;

    const result = await PermissionsAndroid.request(permission, {
      title: 'Enable SMS Import',
      message: 'FinTrack reads SMS to detect bank/UPI transactions and create expenses automatically.',
      buttonNeutral: 'Not Now',
      buttonNegative: 'Deny',
      buttonPositive: 'Allow',
    });

    if (result === PermissionsAndroid.RESULTS.GRANTED) return true;
    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      return 'settings';
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Check if SMS permission is already granted.
 */
export async function hasSmsPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
}

/**
 * Scan SMS inbox for bank/UPI transactions.
 * Returns parsed transactions that can be imported.
 */
export async function scanSmsForTransactions(): Promise<SmsImportResult> {
  const result: SmsImportResult = { imported: 0, skipped: 0, errors: 0, transactions: [], smsRead: 0 };

  if (Platform.OS !== 'android') {
    result.smsError = 'Only supported on Android';
    return result;
  }

  const hasPermission = await hasSmsPermission();
  if (!hasPermission) {
    result.smsError = 'SMS permission not granted';
    return result;
  }

  try {
    let SmsAndroid: any;
    try {
      SmsAndroid = require('react-native-get-sms-android');
    } catch {
      result.smsError = 'SMS library not available';
      return result;
    }

    const smsList = await new Promise<string>((resolve, reject) => {
      const filter = JSON.stringify({
        box: 'inbox',
        maxCount: 100,
      });

      SmsAndroid.list(
        filter,
        (fail: string) => reject(new Error(fail)),
        (_count: string, list: string) => resolve(list),
      );
    });

    const messages = JSON.parse(smsList);
    result.smsRead = messages.length;

    for (const msg of messages) {
      try {
        const transaction = parseSms(msg.body || '', msg.date || '');
        if (transaction) {
          transaction.description = categorizeTransaction(transaction.merchant);
          result.transactions.push(transaction);
          result.imported++;
        } else {
          result.skipped++;
        }
      } catch {
        result.errors++;
      }
    }
  } catch (err: any) {
    result.smsError = err?.message || 'Unknown error';
  }

  return result;
}
