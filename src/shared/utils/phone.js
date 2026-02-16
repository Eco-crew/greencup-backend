function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return '';

  const len = phoneNumber.length;

  if (len === 8) {
    return phoneNumber.replace(/(\d{4})(\d{4})/, '$1-$2');
  } else if (len === 9) {
    return phoneNumber.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
  } else if (len === 10) {
    if (phoneNumber.startsWith('02')) {
      return phoneNumber.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
    }
    return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  } else if (len === 11) {
    return phoneNumber.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }

  return phoneNumber;
}

module.exports = { formatPhoneNumber };
