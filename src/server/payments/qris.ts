type QrisField = { tag: string; value: string };

export class QrisValidationError extends Error {}

export function calculateQrisCrc(value: string) {
  let crc = 0xffff;
  for (let index = 0; index < value.length; index++) {
    crc ^= value.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function parseQris(payload: string) {
  if (!payload.trim()) throw new QrisValidationError('QRIS string is required');
  const value = payload.trim();
  const fields: QrisField[] = [];
  let offset = 0;
  while (offset < value.length) {
    if (offset + 4 > value.length) throw new QrisValidationError('Invalid QRIS TLV header');
    const tag = value.slice(offset, offset + 2);
    const lengthText = value.slice(offset + 2, offset + 4);
    if (!/^\d{2}$/.test(tag) || !/^\d{2}$/.test(lengthText))
      throw new QrisValidationError('Invalid QRIS TLV field');
    const length = Number(lengthText);
    const fieldValue = value.slice(offset + 4, offset + 4 + length);
    if (fieldValue.length !== length)
      throw new QrisValidationError(`Truncated QRIS field ${tag}`);
    fields.push({ tag, value: fieldValue });
    offset += 4 + length;
  }
  return fields;
}

function serializeQris(fields: QrisField[]) {
  return fields.map(({ tag, value }) => {
    if (value.length > 99) throw new QrisValidationError(`QRIS field ${tag} is too long`);
    return `${tag}${String(value.length).padStart(2, '0')}${value}`;
  }).join('');
}

export function generateDynamicQris(payload: string, amount: number) {
  if (!Number.isSafeInteger(amount) || amount <= 0 || String(amount).length > 13)
    throw new QrisValidationError('Amount must be a positive integer');
  const source = payload.trim();
  const parsed = parseQris(source);
  const crcField = parsed.at(-1);
  if (parsed[0]?.tag !== '00' || parsed[0].value !== '01')
    throw new QrisValidationError('Invalid QRIS payload format');
  if (!parsed.some(({ tag }) => tag === '58'))
    throw new QrisValidationError('QRIS country code is missing');
  if (crcField?.tag !== '63' || crcField.value.length !== 4)
    throw new QrisValidationError('QRIS CRC field is missing');
  if (calculateQrisCrc(source.slice(0, -4)) !== crcField.value.toUpperCase())
    throw new QrisValidationError('Invalid QRIS CRC');

  const fields = parsed.filter(({ tag }) => tag !== '54' && tag !== '63');
  const initiationIndex = fields.findIndex(({ tag }) => tag === '01');
  if (initiationIndex >= 0) fields[initiationIndex] = { tag: '01', value: '12' };
  else fields.splice(1, 0, { tag: '01', value: '12' });
  fields.splice(fields.findIndex(({ tag }) => tag === '58'), 0, { tag: '54', value: String(amount) });
  const withoutCrc = `${serializeQris(fields)}6304`;
  return `${withoutCrc}${calculateQrisCrc(withoutCrc)}`;
}
