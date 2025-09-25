import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { JWT_SECRET, COOKIE_NAME } from './config.js';
import User from '../models/User.js';
import '../models/Cart.js'; // registrar el modelo Cart para populate('cart')

const cookieExtractor = (req) => {
  if (req?.cookies && req.cookies[COOKIE_NAME]) return req.cookies[COOKIE_NAME];
  return null;
};

export function inicializarPassport() {
  const opts = {
    jwtFromRequest: ExtractJwt.fromExtractors([
      ExtractJwt.fromAuthHeaderAsBearerToken(),
      cookieExtractor
    ]),
    secretOrKey: JWT_SECRET
  };

  passport.use('current', new JwtStrategy(opts, async (jwtPayload, done) => {
    try {
      const usuario = await User.findById(jwtPayload.uid).populate('cart').lean();
      if (!usuario) return done(null, false, { message: 'Usuario no encontrado' });
      delete usuario.password;
      return done(null, usuario);
    } catch (err) {
      return done(err);
    }
  }));
}

export default passport;
