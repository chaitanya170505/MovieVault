import axios from 'axios';
import db from './db.js'; 
import dotenv from 'dotenv';
dotenv.config(); 

const apiKey = process.env.API_KEY;

// Function to get movies by ID
async function getMovie(id) {
    try {
        const response = await axios.get(`http://www.omdbapi.com/?apikey=${apiKey}`, {
            params: { i: id }
        });
        console.log(response.data);
        return response.data;
    } catch (err) {
        console.error('Error:', err);
    }
}

// Function to search movies by title
async function searchMovie(title) {
    try {
        const encodedTitle = encodeURIComponent(title);
        const broadSearchUrl = `http://www.omdbapi.com/?apikey=${apiKey}&s=${encodedTitle}`;
        const broadSearchResponse = await axios.get(broadSearchUrl);

        console.log('Broad Search Response:', broadSearchResponse.data);

        if (broadSearchResponse.data && broadSearchResponse.data.Response === 'True') {
            return broadSearchResponse.data.Search;
        } else {
            return [];
        }
    } catch (err) {
        console.error('Error fetching movie data:', err);
        throw err;
    }
}


//function to retive the users favorite movies
async function getFavoritesByUserId(userId) {
    const query = 'SELECT * FROM favorites WHERE user_id = $1'; 
    const { rows } = await db.query(query, [userId]); 
    return rows;
}

// function to retrieve the users watch list movies
async function getWatchlistByUserId(userId) {
    const query = 'SELECT * FROM watchlist WHERE user_id = $1'; 
    const { rows } = await db.query(query, [userId]); 
    return rows;
}




export {getMovie,searchMovie,getFavoritesByUserId,getWatchlistByUserId};