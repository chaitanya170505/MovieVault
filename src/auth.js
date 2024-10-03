import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import db from './db.js'; 

const router = express.Router();
const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;

router.use(express.json());
router.use(express.urlencoded({ extended: true }));


// Passport Local Strategy for authentication
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const query = "SELECT * FROM users WHERE username = $1";
        const result = await db.query(query, [username]);
        
        if (result.rows.length === 0) {
            return done(null, false, { message: 'Incorrect username.' });
        }

        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Serializing user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserializing user from session
passport.deserializeUser(async (id, done) => {
    try {
        const query = "SELECT * FROM users WHERE id = $1";
        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            return done(null, false);
        }

        const user = result.rows[0];
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Registration Route
router.post('/register', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.username;
  
    try {
      const checkResult = await db.query('SELECT * FROM users WHERE username = $1', [username]);
  
      if (checkResult.rows.length > 0) {
        res.redirect('/login');
      } else {
        bcrypt.hash(password, saltRounds, async (err, hash) => {
          if (err) {
            console.error('Error hashing password:', err);
          } else {
            const result = await db.query('INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING id', [email, username, hash]);
            const user = result.rows[0];
  
            const newUserId = result.rows[0].id;
  
            req.login(user, (err) => {
              if (err) {
                console.error('Error logging in user:', err);
                res.redirect('register');
              } else {
                  console.log("success");
                  res.redirect("/");
              }
            });
          } 
        });
      }
    } catch (err) {
      console.error(err);
    }
});

// Login Route
router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/', // success
        failureRedirect: '/login',  //failure
        failureFlash: true        // flash messages  
    })
);

// Export the router
export { router as authRouter};

