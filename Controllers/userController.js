// userController.js
exports.getUserDashboard = (req, res) => {
  try {
    // Assuming req.user is populated by your auth middleware with decoded JWT info
    const user = req.user;

    if (!user) {
      return res.redirect('/login');
    }

    res.render('pages/home-dashboard', { user });
  } catch (error) {
    console.error("Error rendering user dashboard:", error);
    res.status(500).send('Server error');
  }
};
