async function addToWatchlist(movieID, title, posterUrl, description) {
    // converting the data into a js object
    const data = { movieID, title, posterUrl, description };

    try {
        // hitting the url
        const response = await fetch('/watchlist/add', {
            // wiht post mehod
            method: 'POST',
            // in json format
            headers: { 'Content-Type': 'application/json' },
            // converting the data into json format
            body: JSON.stringify(data)
        });

        // response from the server
        const result = await response.json();

        if (response.ok) {
            alert('Movie added to Watchlist!');
        } else {
            // Handle duplicate or other errors
            alert(result.message || 'Error adding movie to Watchlist.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding movie to Watchlist.');
    }
}


async function addToFavorites(movieID, title, posterUrl, description) {
    const data = { movieID , title, posterUrl, description };

    try {
        const response = await fetch('/favorites/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Movie added to Favorites!');
        } else {
            alert(result.message || 'Error adding movie to Favorites.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding movie to Favorites.');
    }
}

