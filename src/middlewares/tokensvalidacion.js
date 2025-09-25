import passport from 'passport';

export const passportCall = (estrategia) => (req, res, next) => {
  passport.authenticate(estrategia, { session: false }, (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      let mensaje = 'No autenticado';
      const msg = typeof info === 'string' ? info : info?.message;

      if (info?.name === 'TokenExpiredError' || msg?.toLowerCase?.().includes('expired')) {
        mensaje = 'Token expirado';
      } else if (msg) {
        mensaje = msg;
      }
      return res.status(401).json({ status: 'error', error: mensaje });
    }

    req.user = user;
    next();
  })(req, res, next);
};
