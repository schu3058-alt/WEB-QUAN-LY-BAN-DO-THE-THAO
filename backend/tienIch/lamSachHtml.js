// Lam sach chuoi HTML dau vao de chong XSS (vi du: mo ta san pham, binh luan danh gia)
const sanitizeHtml = require('sanitize-html');

function lamSachHtml(chuoi) {
  if (typeof chuoi !== 'string') return chuoi;
  return sanitizeHtml(chuoi, {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    allowedAttributes: {},
  });
}

module.exports = lamSachHtml;
