const logout = (req, res) => {
    res.json({ auth: false, token: null })
}
module.exports = logout