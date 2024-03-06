const ROLES = {
  STUDENT: 'Student',
  STAFF: 'Staff',
  LIBRARIAN: 'Librarian',
}

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    console.log(req.user)
    const userRole = req.user?.role
    if (!userRole) {
      return res.status(403).json({ msg: 'Access denied. User role is undefined.' });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ msg: 'Access denied. Insufficient privileges.' })
    }

    next()
  }
}

module.exports = { checkRole, ROLES }
