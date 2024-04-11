

function getSpotifyData () {
    const token = localStorage.getItem('spotify_access_token')
    const query = 'Nirvana'; 
    const searchType = 'artist'; // Could be 'album', 'track', 'playlist', etc.

    fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${searchType}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data); // Process search results here
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
// getSpotifyData()