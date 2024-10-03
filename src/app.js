import express from 'express'; 
import session from 'express-session';
import passport from 'passport';
import flash from 'connect-flash';
import { authRouter } from './auth.js'; 
import routes from './route.js'; 
import dotenv from 'dotenv';
dotenv.config();

const app=express();

// Initializing session middleware

app.use(session({
    secret: process.env.SESSION_SECRET || 'MyStrongSecret', 
    resave: false,
    saveUninitialized: true,
}));

// Initializing Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); 


app.set('view engine', 'ejs');

app.set('views', './views'); 

app.use(express.static('../public'));


app.use('/', authRouter); 
app.use('/', routes); 


app.use((req, res, next) => {
    res.status(404).send('Sorry, that route doesn’t exist.');
});

export default app;