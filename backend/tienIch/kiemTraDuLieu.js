// Bao boc Joi schema thanh middleware kiem tra du lieu dau vao
function kiemTraDuLieu(schema, nguon = 'body') {
  return (yeuCau, phanHoi, tiepTheo) => {
    const { error, value } = schema.validate(yeuCau[nguon], { abortEarly: false, stripUnknown: true });
    if (error) {
      return phanHoi.status(422).json({
        thanhCong: false,
        thongBao: 'Dữ liệu không hợp lệ',
        chiTiet: error.details.map((d) => d.message),
      });
    }
    yeuCau[nguon] = value;
    return tiepTheo();
  };
}

module.exports = kiemTraDuLieu;
