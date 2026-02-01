function ok(res, data = null) {
  return res.json({ success: true, data, error: null });
}

function fail(res, status, message) {
  return res.status(status).json({ success: false, data: null, error: message });
}

module.exports = { ok, fail };
