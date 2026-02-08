function errorHandler(err, req, res) {
  console.log(err);

  res.status(err.status || 500).json({ message: err.message || 'Server error' });
}

module.exports = errorHandler;
