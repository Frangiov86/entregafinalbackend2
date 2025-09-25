export const requireRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', error: 'No autenticado' });
    }
    if (!rolesPermitidos.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', error: 'El usuario no posee autorizacion' });
    }
    next();
  };
};

export const requireSelfOrRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', error: 'No autenticado' });
    }
    const esPropio = req.user._id?.toString?.() === req.params.id;
    const tieneRol = rolesPermitidos.includes(req.user.role);
    if (!esPropio && !tieneRol) {
      return res.status(403).json({ status: 'error', error: 'El usuario no posee autorizacion' });
    }
    next();
  };
};
