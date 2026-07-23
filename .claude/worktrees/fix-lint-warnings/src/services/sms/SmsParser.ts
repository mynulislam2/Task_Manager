/**
 * Universal Word-based SMS Transaction Parser
 *
 * Detects ANY financial transaction from ANY bank/UPI/wallet/card globally.
 * No format-specific patterns — pure keyword + number detection.
 */

export interface SmsTransaction {
  amount: number;
  type: 'expense' | 'income';
  merchant?: string;
  description?: string;
  date: string;
  smsHash: string;
  smsBody: string;
}

// === AMOUNT DETECTION ===

// All known currency symbols and codes worldwide
const CURRENCY_SYMBOLS = /(?:Rs\.?\s*|INR\s*|₹\s*|\$\s*|€\s*|£\s*|¥\s*|₩\s*|₺\s*|₱\s*|₿\s*|₨\s*|zł\s*|Kč\s*|ден\s*|Ft\s*|kn\s*|kr\s*|₪\s*|₡\s*|₲\s*|₴\s*|₸\s*|₵\s*|៛\s*|₫\s*|ƒ\s*|﷼\s*|؋\s*|KSh\s*|R\s*|R$\s*|Tk\s*|BDT\s*|৳\s*)/i;

const CURRENCY_CODES = /\b(?:USD|EUR|GBP|JPY|CHF|CAD|AUD|NZD|INR|BDT|PKR|LKR|NPR|SGD|MYR|THB|PHP|IDR|VND|KRW|CNY|HKD|TWD|SAR|AED|QAR|OMR|KWD|BHD|EGP|TRY|RUB|ZAR|NGN|KES|GHS|XAF|XOF|MXN|BRL|ARS|CLP|COP|PEN|UYU|PYG|BOB|CRC|PAB|DOP|HNL|NIO|GTQ|SVC|TTD|JMD|BBD|BSD|BZD|KYD|XCD|FJD|PGK|SBD|TOP|WST|VUV|CVE|MZN|MGA|TZS|UGX|RWF|BIF|GNF|MLC|MRO|MRU|STD|STN|ERN|DJF|SOS|SCR|MUR|AWG|ANG|NOK|SEK|DKK|ISK|CZK|PLN|HUF|RON|BGN|HRK|RSD|ALL|MKD|BYN|GEL|AMD|AZN|UZS|KZT|MNT|ILS)\b/i;

// All prefixes: "amount of", "sum of", "value", "total" etc
const AMOUNT_PREFIX = /(?:amount\s+(?:of\s+)?|sum\s+(?:of\s+)?|value\s+(?:of\s+)?|total\s+(?:of\s+)?|a\.\s*m\.\s*(?:ou)?t\.?\s*:?\s*)/i;

// === DIRECTION / TYPE KEYWORDS ===

// MONEY OUT — every possible way to express spending
const DEBIT_WORDS = /\b(?:debited|debit|spent|spend|spending|paid|pay|payment|purchase|purchased|charges?|charged|sent|send|sending|transfer(?:red|ing)?\s+(?:to|out)|withdraw(?:al)?|withdrawn|used|bought|booking|swiped|atm|cash\s+out|paid\s+out|money\s+sent|funds?\s+transfer(?:red)?|outgoing|paid\s+to|payment\s+to|sent\s+to|transfer\s+to|moved|taken|removed|deducted|settled|cleared|processed|completed|successful|approved|authorised?|authorized)\b/i;

// MONEY IN — every possible way to express receiving money
const CREDIT_WORDS = /\b(?:credited|credit|received|receive|receiving|deposited|deposit|refund(?:ed)?|cashback|cash\s+back|salary|added|loaded|repayment|returned|incoming|reversal|reversed|cash\s+in|money\s+received|funds?\s+received|payment\s+received|paid\s+in|credited\s+with|added\s+to|earned|interest|dividend|coupon|bonus|reward|payroll|wage|income|transfer(?:red)?\s+(?:from|in)|paid\s+by|funded)\b/i;

// Neutral verbs that need context
const NEUTRAL_WORDS = /\b(?:transaction|transfer|payment|trf|tfr|movement|settlement|entry)\b/i;

// === IGNORE / SKIP PATTERNS ===

const IGNORE_WORDS = /\b(?:otp|one\s*time\s*pin|verification\s*code|login|password|reset|alert|updates?|offer|promo|promotional|discount|deal|save|sale|clearance|reward\s+points|points|win|winner|free|gratis|subscribed?|enrolled?|registered?|activated?|logged\s+in|logged\s+out|2fa|two.?factor|authentication|security|fraud\s+alert|suspicious|blocked|locked|expired|renewal|reminder|statement|ebill|bill\s+summary|minimum\s+amount|due\s+date|auto.?pay|scheduled|cancel|cancelled|cancellation|dispute|complaint|feedback|survey|invite|referral|upgrade|downgrade|trial|premium|vip|loyalty|coupon|voucher|promo.?code|offer.?code)\b/i;

// Future/conditional language — not a real transaction
const FUTURE_WORDS = /\b(?:will\s+be|is\s+scheduled|is\s+due|is\s+upcoming|expected|estimated|projected|proposed|planned|upcoming|coming\s+up|reminder|remind|auto.?pay\s+on|scheduled\s+on|due\s+on|on\s+\d{2}\/\d{2})\b/i;

// Failed/reversed/cancelled — should NOT be treated as expense
const FAILED_WORDS = /\b(?:failed|unsuccessful|declined|rejected|not\s+processed|could\s+not|cannot\s+be|unable\s+to|error|issue|problem|timeout|cancelled|cancel)\b/i;

// Loan-related — not income, it's debt
const LOAN_WORDS = /\b(?:loan|borrow|borrowed|lending|finance|financing|mortgage|advance|credit\s+line|personal\s+loan|home\s+loan|car\s+loan|education\s+loan|business\s+loan|loan\s+approved|loan\s+disbursed|loan\s+sanctioned)\b/i;

// Investment/trade — not expense, it's asset conversion
const INVEST_WORDS = /\b(?:share|shares|stock|stocks|mutual\s+fund|mf|sip|equity|bond|bonds|etf|nfo|fpo|ipo|trade|traded|trading|bought|sold\s+shares|purchased\s+shares|invest|invested|investment|brokerage|demats|holding|portfolio|dividend\s+payout|unit\s+purchase|nav)\b/i;

// === MERCHANT DETECTION ===

// Keywords that signal a merchant name follows
const MERCHANT_PREFIX = /\b(?:at|from|to|for|via|by|towards|at\s+merchant|merchant|payee|beneficiary|vendor|seller|recipient)\s+([A-Za-z][A-Za-z\s.\-&']{1,40}?)(?:\s+(?:on|ref|via|upi|card|net|bank|account|date|time|$|\d{2,}))/i;

// === HELPER: hash for dedup ===

function hashBody(body: string): string {
  let h = 0;
  for (let i = 0; i < body.length; i++) {
    h = ((h << 5) - h + body.charCodeAt(i)) | 0;
  }
  return 'sms_' + Math.abs(h).toString(36);
}

// === AMOUNT EXTRACTION ===

function findAmount(body: string): number | null {
  const amounts: number[] = [];
  let m: RegExpExecArray | null;

  // 1. Currency symbol PREFIX + number: $50, Rs 1,000, €99.99, £50, ¥1000, etc
  const symPattern = new RegExp(CURRENCY_SYMBOLS.source + '\\s*([\\d -]+(?:[.,][\\d]{1,2})?)', 'gi');
  while ((m = symPattern.exec(body)) !== null) {
    const val = parseFlexibleAmt(m[m.length - 1]);
    if (val !== null) amounts.push(val);
  }

  // 2. Currency code PREFIX + number: USD 50, INR 1000, EUR 99.99
  const codePattern = new RegExp(CURRENCY_CODES.source + '\\s+([\\d -]+(?:[.,][\\d]{1,2})?)', 'gi');
  while ((m = codePattern.exec(body)) !== null) {
    const val = parseFlexibleAmt(m[m.length - 1]);
    if (val !== null) amounts.push(val);
  }

  // 3. Number SUFFIX + currency symbol: 50$, 1000€, 99.99€
  const suffixPattern = /(\d{1,}(?:[.,]\d{1,2})?)\s*(?:€|£|¥|₩|₺|₱|₨|zł|kr|Kč|ден|Ft|kn|₪|₡|₲|₴|₸|R$|R)\b/g;
  while ((m = suffixPattern.exec(body)) !== null) {
    const val = parseFlexibleAmt(m[1]);
    if (val !== null) amounts.push(val);
  }

  // 4. CR/DR suffix: "500.00 CR" (credit) or "500.00 DR" (debit)
  const crPattern = /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*\b(?:CR|DR|cr|dr)\b/g;
  while ((m = crPattern.exec(body)) !== null) {
    const val = parseFlexibleAmt(m[1]);
    if (val !== null) amounts.push(val);
  }

  // 5. +/- prefix: "+500.00" (credit) or "-500.00" (debit)
  const signPattern = /([+-])\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\b/g;
  while ((m = signPattern.exec(body)) !== null) {
    const val = parseFlexibleAmt(m[2]);
    if (val !== null) amounts.push(val);
  }

  // 6. "amount of X" / "sum of X" / "total X"
  const prefixPattern = new RegExp(AMOUNT_PREFIX.source + '([\\d -]+(?:[.,][\\d]{1,2})?)', 'gi');
  while ((m = prefixPattern.exec(body)) !== null) {
    const val = parseFlexibleAmt(m[m.length - 1]);
    if (val !== null) amounts.push(val);
  }

  // 7. European format: 1.234,56 (dot=separator, comma=decimal)
  const euroPattern = /\b(\d{1,3})\.(\d{3})[,](\d{2})\b/g;
  while ((m = euroPattern.exec(body)) !== null) {
    const val = parseInt(m[1]) * 1000 + parseInt(m[2]) + parseInt(m[3]) / 100;
    if (val > 0 && val < 999999999) amounts.push(val);
  }

  // 8. European format 2: 1 234,56 (space=separator, comma=decimal)
  const spacePattern = /\b(\d{1,3})\s(\d{3})[,](\d{2})\b/g;
  while ((m = spacePattern.exec(body)) !== null) {
    const val = parseInt(m[1]) * 1000 + parseInt(m[2]) + parseInt(m[3]) / 100;
    if (val > 0 && val < 999999999) amounts.push(val);
  }

  // 9. Naked numbers — ONLY if transaction keywords present
  if (DEBIT_WORDS.test(body) || CREDIT_WORDS.test(body)) {
    const numPattern = /\b(\d{1,3}(?:[.,]?\d{3})*(?:[.,]\d{2})?)\b/g;
    while ((m = numPattern.exec(body)) !== null) {
      const val = parseFlexibleAmt(m[1]);
      if (val !== null) amounts.push(val);
    }

    const decPattern = /\b(\d+[.]\d{2})\b/g;
    while ((m = decPattern.exec(body)) !== null) {
      const val = parseFloat(m[1]);
      if (val > 0 && val < 999999999) amounts.push(val);
    }
  }

  if (amounts.length === 0) return null;
  amounts.sort((a, b) => b - a);
  return amounts[0];
}

/** Parse flexible amount string handling both dot and comma decimals */
function parseFlexibleAmt(str: string): number | null {
  const cleaned = str.trim().replace(/\s+/g, ''); // remove spaces
  if (!cleaned || isNaN(parseFloat(cleaned))) return null;

  // If has both comma and dot: comma may be separator, dot is decimal
  if (cleaned.includes(',') && cleaned.includes('.')) {
    const lastDot = cleaned.lastIndexOf('.');
    const lastComma = cleaned.lastIndexOf(',');
    if (lastComma > lastDot) {
      // European: 1.234,56 → remove dots, replace comma with dot
      const num = parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
      if (num > 0 && num < 999999999) return num;
    }
    // US: 1,234.56 → remove commas
    const num = parseFloat(cleaned.replace(/,/g, ''));
    if (num > 0 && num < 999999999) return num;
  }

  // Only commas: remove them (1,234 → 1234)
  if (cleaned.includes(',') && !cleaned.includes('.')) {
    const num = parseFloat(cleaned.replace(/,/g, ''));
    if (num > 0 && num < 999999999) return num;
  }

  // Standard number
  const num = parseFloat(cleaned);
  if (num > 0 && num < 999999999) return num;
  return null;
}

// === TYPE DETECTION ===

function findType(body: string): 'expense' | 'income' | null {
  const bodyLower = body.toLowerCase();

  // CR/DR suffix: "500.00 CR" = credit, "500.00 DR" = debit
  if (/\b\d[\d,.]*\s+CR\b/i.test(body)) return 'income';
  if (/\b\d[\d,.]*\s+DR\b/i.test(body)) return 'expense';

  // +/- prefix: "+500" = credit, "-500" = debit
  if (/^[+]\s*\d/.test(body.trim())) return 'income';
  if (/^[-]\s*\d/.test(body.trim())) return 'expense';

  // Non-English: French
  if (/\b(?:débité|débiter|prélevé|payé|versé|achat|retrait|paiement)\b/i.test(bodyLower)) return 'expense';
  if (/\b(?:crédité|reçu|remboursé|versement|dépôt|salaire)\b/i.test(bodyLower)) return 'income';

  // Non-English: Spanish
  if (/\b(?:cobrado|pagado|cargo|retiro|compra|transferencia?\s+enviado|débito)\b/i.test(bodyLower)) return 'expense';
  if (/\b(?:abonado|recibido|depositado|reembolso|nómina|sueldo|ingreso|transferencia?\s+recibido)\b/i.test(bodyLower)) return 'income';

  // Non-English: Portuguese
  if (/\b(?:debitado|pago|compra|saque|transferência?\s+enviada|cobrado|gasto)\b/i.test(bodyLower)) return 'expense';
  if (/\b(?:creditado|recebido|depositado|reembolso|salário|estorno)\b/i.test(bodyLower)) return 'income';

  // Non-English: German
  if (/\b(?:abgebucht|belastet|bezahlt|ausgegeben|überweisung\s+gesendet|kauf|zahlung)\b/i.test(bodyLower)) return 'expense';
  if (/\b(?:gutschrift|erhalten|eingezahlt|rückerstattung|gehalt|lohn|einkommen)\b/i.test(bodyLower)) return 'income';

  // Non-English: Italian
  if (/\b(?:addebitato|pagato|speso|prelievo|bonifico\s+inviato|acquisto)\b/i.test(bodyLower)) return 'expense';
  if (/\b(?:accreditato|ricevuto|depositato|rimborso|stipendio|entrata)\b/i.test(bodyLower)) return 'income';

  // Non-English: Indonesian/Malay
  if (/\b(?:didebit|terbayar|pembayaran|belanja|tarik|transfer\s+keluar)\b/i.test(bodyLower)) return 'expense';
  if (/\b(?:dikredit|diterima|setoran|pengembalian|gaji|transfer\s+masuk)\b/i.test(bodyLower)) return 'income';

  // Non-English: Turkish
  if (/\b(?:borç|ödeme|harcama|çekim|gönderilen|satın)\b/i.test(bodyLower)) return 'expense';
  if (/\b(?:alacak|alındı|yatırılan|iade|maaş|gelir)\b/i.test(bodyLower)) return 'income';

  // Non-English: Arabic (transliterated)
  if (/\b(?:madhfo?o?f?|daf3|shira|saheb|sedad|tahwil)\b/i.test(bodyLower)) return 'expense';
  if (/\b(?:maqb?o?o?d?|mustalam|raje3|muraja3a|rawateb)\b/i.test(bodyLower)) return 'income';

  // Strong English signals
  if (/\b(?:paid\s+(?:to|for|at|via)|payment\s+(?:to|for|made|sent)|sent\s+(?:to|via)|transfer(?:red)?\s+(?:to|out)|debited|debit|withdraw|spent|purchased|purchase\s+(?:at|from|of)|charged|swiped|booking|bought|cash\s+out)\b/i.test(bodyLower)) return 'expense';
  if (/\b(?:received\s+(?:from|by|via)|credited\s+(?:by|from|with)|credited|salary|deposited|deposit|refund|cashback|credited\s+with|added\s+to|cash\s+in|add\s+money)\b/i.test(bodyLower)) return 'income';

  // Generic word counting
  const debitCount = (bodyLower.match(DEBIT_WORDS) || []).length;
  const creditCount = (bodyLower.match(CREDIT_WORDS) || []).length;
  const toCount = (bodyLower.match(/\b(?:to|paid\s+to|sent\s+to|transfer\s+to|payment\s+to)\b/g) || []).length;
  const fromCount = (bodyLower.match(/\b(?:from|received\s+from|credited\s+by|payment\s+from|transfer\s+from)\b/g) || []).length;

  if (debitCount > creditCount || toCount > fromCount) return 'expense';
  if (creditCount > debitCount || fromCount > toCount) return 'income';

  return null;
}

// === MERCHANT EXTRACTION ===

function findMerchant(body: string): string | undefined {
  // 1. "at/from/to/via MERCHANT" pattern
  const prefixMatch = MERCHANT_PREFIX.exec(body);
  if (prefixMatch) {
    const name = prefixMatch[1].trim().replace(/\s+/g, ' ');
    if (name.length > 0 && name.length < 45 && !/^(the|a|an|and|or|of|for|on|in|at|via|upi|card|bank|account|netbanking)$/i.test(name)) return name;
  }

  // 2. "MERCHANT: Your payment..." pattern
  const confirmMatch = body.match(/^([A-Z][A-Za-z\s.\-&']{1,35}?)\s*[-:]\s*(?:your\s+)?(?:payment|transaction|purchase|transfer|order|booking)/i);
  if (confirmMatch) {
    const name = confirmMatch[1].trim();
    if (name.length > 0 && name.length < 40) return name;
  }

  // 3. "Thank you for using MERCHANT" or "from MERCHANT"
  const thanksMatch = body.match(/(?:thank\s+you\s+(?:for\s+using|from)|greetings\s+from)\s+([A-Z][A-Za-z\s]{1,30}?)(?:\s+\.|$)/i);
  if (thanksMatch) {
    const name = thanksMatch[1].trim();
    if (name.length > 0 && name.length < 35) return name;
  }

  // 4. UPI reference: "VPAMERCHANT@..." or "merchant@upi"
  const upiMatch = body.match(/[A-Za-z]{3,}@[a-z]{3,}/i);
  if (upiMatch) {
    const name = upiMatch[0].split('@')[0];
    if (name.length > 2 && name.length < 30 && !/^(pay|send|receive|upi|bank)$/i.test(name)) return name;
  }

  // 5. Any capitalized word cluster at start (likely bank/company name)
  const startMatch = body.match(/^([A-Z][A-Z\s]{2,30}?)\s+(?:alert|notification|update|message|sms)/i);
  if (startMatch) {
    const name = startMatch[1].trim();
    if (name.length < 35) return name;
  }

  return undefined;
}

// === MAIN PARSER ===

export function parseSms(body: string, date: string): SmsTransaction | null {
  const cleaned = body.replace(/\n/g, ' ').trim();

  // Skip clearly non-transaction SMS
  const hasIgnore = IGNORE_WORDS.test(cleaned);
  const hasDebit = DEBIT_WORDS.test(cleaned);
  const hasCredit = CREDIT_WORDS.test(cleaned);
  const hasNeutral = NEUTRAL_WORDS.test(cleaned);
  const hasFuture = FUTURE_WORDS.test(cleaned);
  const hasFailed = FAILED_WORDS.test(cleaned);

  // If it ONLY has ignore words and no transaction words, skip
  if (hasIgnore && !hasDebit && !hasCredit && !hasNeutral) return null;

  // STRONG RULE: count ignore words vs transaction words
  // If more ignore/promo words than transaction words, skip (catches "Get 50% off purchase!")
  const ignoreMatches = (cleaned.match(IGNORE_WORDS) || []).length;
  const debitMatches = (cleaned.match(DEBIT_WORDS) || []).length;
  const creditMatches = (cleaned.match(CREDIT_WORDS) || []).length;
  const txMatches = debitMatches + creditMatches;
  if (ignoreMatches >= txMatches) return null;

  // Future/scheduled transactions — not real yet
  if (hasFuture && !hasDebit && !hasCredit) return null;

  // Failed/declined transactions — skip
  if (hasFailed) return null;

  // Loan approved/credited — looks like income but it's debt, skip
  if (LOAN_WORDS.test(cleaned)) return null;

  // Investment/trade — not expense, it's asset conversion, skip
  if (INVEST_WORDS.test(cleaned)) return null;

  // No transaction keywords at all? skip
  if (!hasDebit && !hasCredit && !hasNeutral) return null;

  // Find amount
  const amount = findAmount(cleaned);
  if (!amount || amount < 0.01) return null;

  // Skip very tiny amounts — likely fees, not transactions
  if (amount < 1) return null;

  // Determine type
  const type = findType(cleaned);
  if (!type) return null;

  // Find merchant
  const merchant = findMerchant(cleaned);

  return {
    amount: Math.round(amount * 100) / 100,
    type,
    merchant,
    date,
    smsHash: hashBody(cleaned),
    smsBody: cleaned.substring(0, 120),
  };
}

// === CATEGORIZATION ===

export function categorizeTransaction(merchant?: string): string {
  if (!merchant) return 'Other';
  const m = merchant.toLowerCase();
  if (/swiggy|zomato|uber.?eat|foodpanda|dining|restaurant|cafe|pizza|burger|kfc|mcdonald|starbucks|domino|subway|taco|chipotle|dunkin|krispy|cream|ice.?cream|bakery|grubhub|doordash|ubereats|deliveroo|justeat|food|kitchen|chef|meal|cook|dinner|lunch|breakfast/i.test(m)) return 'Food';
  if (/uber|ola|lyft|grab|gojek|taxi|metro|bus|train|fuel|petrol|diesel|parking|toll|gas|charging|ev|car.?wash|servicing|repair|garage|mechanic|auto|vehicle/i.test(m)) return 'Transport';
  if (/amazon|flipkart|myntra|ajio|meesho|walmart|target|ebay|alibaba|shopify|etsy|best.?buy|ikea|costco|wish|aliexpress|shein|zara|h.?m|nike|adidas|mall|store|retail|shop|marketplace|shopping|clothing|fashion/i.test(m)) return 'Shopping';
  if (/electricity|water|gas|broadband|internet|phone|recharge|bill|utility|verizon|att|t.?mobile|comcast|spectrum|tmobile|vodafone|airtel|jio|rent|lease|maintenance|society|emi|installment|subscription|membership|dues/i.test(m)) return 'Bills';
  if (/hospital|clinic|doctor|pharmacy|medicin|health|fitness|gym|apollo|practo|1mg|netmeds|healthier|curefit|cult|insurance|medical|dentist|eye|optic|diagnostic|test|lab|pathology|wellness|spa|salon|therapy/i.test(m)) return 'Health';
  if (/netflix|prime|hotstar|spotify|youtube|cinema|movie|game|playstation|xbox|steam|hulu|disney|hbomax|peacock|paramount|appletv|music|ticket|concert|event|entertain/i.test(m)) return 'Entertainment';
  if (/bkash|nagad|rocket|upay|pathao|cash\s+app|dutch.?bangla|dbbl|trust|islami|prime|south|bangla|surecash|mcash|okwallet|mycash/i.test(m)) return 'Other';
  if (/salary|wage|payroll|income|earning/i.test(m)) return 'Other';
  return 'Other';
}
