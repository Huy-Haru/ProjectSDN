const integer = { validator: Number.isInteger, message: '{PATH} phải là số nguyên' };
const optionalInteger = { validator: value => value == null || Number.isInteger(value), message: '{PATH} phải là số nguyên' };
function dateRange(schema) {
  schema.pre('validate', function() {
    if (this.startDate && this.endDate && this.endDate <= this.startDate) this.invalidate('endDate', 'Ngày kết thúc phải sau ngày bắt đầu');
  });
}
module.exports = { integer, optionalInteger, dateRange };
