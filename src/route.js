import express from 'express';
import {getMovie,searchMovie,getFavoritesByUserId,getWatchlistByUserId} from './functions.js';
import bodyParser from 'body-parser';
import db from './db.js'; 

const router = express.Router();

// Body parser code for converting form into JSON format
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


// Authentication method no need for import as passport is global now
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); 
    }
    res.redirect('/login'); 
}


// Home page routing
router.get('/', (req, res) => {
    res.render('home', { user: req.user }); 
});

// Home search route with API call
router.get('/homeSearch', async (req, res) => {
    const movieId = req.query.movieTitle;
    const movieData = await getMovie(movieId);
    res.render('homeSearch', { movie: movieData, user: req.user  });
});

// Route to search movies by title
router.get('/search_movie', async (req, res) => {
    let title = req.query.title.trim();
    try {
        const movieSearchData = await searchMovie(title);

        if (movieSearchData && movieSearchData.length > 0) {
            res.render('searchMovie', { movies: movieSearchData });
        } else {
            res.render('searchMovie', {
                movies: [],
                message: 'No movies found',
            });
        }
    } catch (err) {
        console.error('Error fetching movies:', err);
        res.render('searchMovie', {
            movies: [],
            message: 'Error fetching movies'
        });
    }
});


//get route for login and register pages
router.get('/login', (req, res) => {
    res.render('login'); 
});

router.get('/register', (req, res) => {
    res.render('register'); 
})


// Header routes 
// 1. Favorites (Protected)
router.get('/favorites', isAuthenticated, async (req, res) => {
    try {
        // Fetch favorites from the database for the authenticated user
        const userId = req.user.id; 
        const favorites = await getFavoritesByUserId(userId); 

        // Render the page 
        res.render('favorites', { user: req.user, favorites }); 
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.render('favorites', { user: req.user, favorites: [], message: 'Error fetching favorites' });
    }
});


// 2. Watchlist (Protected)
router.get('/watchlist', isAuthenticated, async (req, res) => {
    try {
        // Fetch watchlist movies from the database 
        const userId = req.user.id; 
        const watchlist = await getWatchlistByUserId(userId); 

        // Render the watchlist page
        res.render('watchlist', { user: req.user, watchlist }); 
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.render('watchlist', { user: req.user, watchlist: [], message: 'Error fetching watchlist' });
    }
});




//Watch list movie route
router.post('/watchlist/add', isAuthenticated, async (req, res) => {
    const userId=req.user.id;
    const { movieID, title, posterUrl, description } = req.body;

    // Checking if the movie is already in watchlist table
    const existingWatchlistItem = await db.query(
        'SELECT * FROM watchlist WHERE user_id = $1 AND movie_id = $2',
        [userId, movieID]
    );

    // if already exists then sending a message
    if (existingWatchlistItem.rows.length > 0) {
        return res.status(400).json({ message: 'Movie is already in your Watchlist.' });
    }

    // Inserting the new watchlist movie
    await db.query(
        'INSERT INTO watchlist (user_id, movie_id, title, plot, poster) VALUES ($1, $2, $3, $4, $5)',
        [userId, movieID, title, description, posterUrl]
    );

    return res.status(201).json({ message: 'Movie added to Watchlist!' });
});



// Route for favorites section
router.post('/favorites/add', isAuthenticated, async (req, res) => {
    const userId=req.user.id;
    const { movieID, title, posterUrl, description } = req.body;

    // Checking if the movie is already in favorites table
    const existingFavorite = await db.query(
        'SELECT * FROM favorites WHERE user_id = $1 AND movie_id = $2',
        [userId, movieID]
    );

    // if the movie is already present then send a message
    if (existingFavorite.rows.length > 0) {
        return res.status(400).json({ message: 'Movie is already in your Favorites.' });
    }

    // Inserting the new favorite movie
    await db.query(
        'INSERT INTO favorites (user_id, movie_id, title, plot, poster) VALUES ($1, $2, $3, $4, $5)',
        [userId, movieID, title, description, posterUrl]
    );

    return res.status(201).json({ message: 'Movie added to Favorites!' });
});


// route to remove from watchlist page
router.get('/watchlist/remove/:id', isAuthenticated, async (req, res) => {
    const movieId = req.params.id;
    const userId = req.user.id;

    try {
        await db.query(
            'DELETE FROM watchlist WHERE user_id = $1 AND movie_id = $2',
            [userId, movieId]
        );

        // Redirecting back to the referring page
        res.redirect(req.get('referer'));
    } catch (err) {
        console.error('Error removing movie from watchlist:', err);
        res.status(500).send('Server Error');
    }
});


// remove movie from the watch list page
router.get('/favorites/remove/:id', isAuthenticated, async (req, res) => {
    const movieId = req.params.id;
    const userId = req.user.id;

    try {
        // Removing the movie from the favorites table
        await db.query(
            'DELETE FROM favorites WHERE user_id = $1 AND movie_id = $2',
            [userId, movieId]
        );

        // Redirect back to the referring 
        res.redirect(req.get('referer'));
    } catch (err) {
        console.error('Error removing movie from favorites:', err);
        res.status(500).send('Server Error');
    }
});


// route for profile section
router.get('/profile', isAuthenticated, (req,res)=>{
    res.render('profile', {user: req.user});
})


// sign out route code
router.get('/auth/logout', (req, res, next) => {
    req.logout(function(err) { 
        if (err) { 
            return next(err); 
        }
        req.session.destroy((err) => {
            if (err) {
                console.log('Error destroying session:', err);
                return res.status(500).send('Error logging out.');
            }
            res.redirect('/login'); 
        });
    });
});


// edit profile route
router.post('/update-profile', async (req, res) => {
    const { username, usermail } = req.body; 
    const userId = req.user.id;

    try {
        // Update user details in the database
        const result = await db.query(
            'UPDATE users SET username = $1, email = $2 WHERE id = $3',
            [username, usermail, userId]
        );

        if (result.rowCount > 0) {
            // Successfully updated
            req.flash('success_msg', 'Profile updated successfully.');
            res.redirect('/profile'); 
        } else {

            req.flash('error_msg', 'User not found.');
            res.redirect('/profile'); 
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        req.flash('error_msg', 'An error occurred while updating your profile.');
        res.redirect('/profile'); 
    }
});


// Export the router
export default router;
