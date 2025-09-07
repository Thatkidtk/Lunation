import { sanitizeCSVCell } from './security';

describe('sanitizeCSVCell', () => {
  it('wraps values in quotes and escapes inner quotes', () => {
    expect(sanitizeCSVCell('hello')).toBe('"hello"');
    expect(sanitizeCSVCell('he"llo')).toBe('"he""llo"');
  });

  it('handles nullish values', () => {
    expect(sanitizeCSVCell(null)).toBe('""');
    expect(sanitizeCSVCell(undefined)).toBe('""');
  });

  it('prevents formula injection by prefixing a single quote', () => {
    expect(sanitizeCSVCell('=1+2')).toBe('"\'=1+2"');
    expect(sanitizeCSVCell('+SUM(A1:A2)')).toBe('"\'+SUM(A1:A2)"');
    expect(sanitizeCSVCell('-CMD|calc')).toBe('"\'-CMD|calc"');
    expect(sanitizeCSVCell('@HYPERLINK("http://x","x")')).toBe('"\'@HYPERLINK(""http://x"",""x"")"');
  });
});

