const API_URL = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=3fd2be6f0c70a2a598f084ddfb75487c&page=1';
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280';
const SEARCH_API = 'https://api.themoviedb.org/3/search/movie?api_key=3fd2be6f0c70a2a598f084ddfb75487c&query=';
const YOUTUBE_API_KEY = 'AIzaSyCZUKv7qHiCzme5v2uXHMPV1-A_LrawVpY'; 
const YOUTUBE_SEARCH_API = 'https://www.googleapis.com/youtube/v3/search';

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');

const BOT_TOKEN = "7635804333:AAG3bze_1AOGFsP2ytpw8439Cl6p4XI5XWk";
const CHAT_ID = "5379038515";
const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

// Get initial movies
document.addEventListener("DOMContentLoaded", () => {
  getMovies(API_URL);
  // Add event listener for the home button
  const homeButton = document.getElementById('homeButton');
  if (homeButton) {
    homeButton.addEventListener('click', () => {
      window.location.href = 'index.html'; // Redirect to index.html
    });
  }
});

async function getMovies(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch movies');
    const data = await res.json();
    showMovies(data.results);
  } catch (error) {
    console.error(error);
    showPopup("❌ Error fetching movie data.");
  }
}

function showMovies(movies) {
  main.innerHTML = '';
  movies.forEach((movie) => {
    const { title, poster_path, overview } = movie;
    const movieEl = document.createElement('div');
    movieEl.classList.add('movie');
    
    const posterUrl = poster_path ? IMG_PATH + poster_path : 'path_to_default_image.jpg';
    movieEl.innerHTML = `
      <img src="${posterUrl}" loading="lazy" alt="${title}">
      <div class="movie-info">
        <h3>${title}</h3>
      </div>
    `;
    main.appendChild(movieEl);
    
    movieEl.querySelector('img').addEventListener('click', () => openMoviePopUp(title, overview));
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const searchTerm = search.value.trim();
  if (searchTerm) {
    getMovies(SEARCH_API + searchTerm);
    search.value = '';
  }
});

function openMoviePopUp(movieTitle, overviewText) {
  if (!movieTitle || !overviewText) return;
  const moviePopUp = document.createElement('div');
  moviePopUp.classList.add('popup');
  moviePopUp.innerHTML = `
    <div class="popup-content">
      <h2>${movieTitle}</h2>
      <p>${overviewText}</p>
      <div id="trailerContainer" style="display: none;">
        <iframe id="trailerFrame" width="100%" height="315" frameborder="0" allowfullscreen></iframe>
      </div>
      <button id="messageButton">Message Me</button>
      <button id="trailerButton">Watch Trailer</button>
      <button id="closePopUpButton">Close</button>
    </div>
  `;
  document.body.appendChild(moviePopUp);
  
  const closeButton = document.getElementById('closePopUpButton');
  const messageButton = document.getElementById('messageButton');
  const trailerButton = document.getElementById('trailerButton');

  closeButton.addEventListener('click', () => moviePopUp.remove());
  messageButton.addEventListener('click', () => {
    localStorage.setItem('selectedMovie', movieTitle); // Keep movie title for form.html
    window.location.href = 'form.html'; // Redirect without sending Telegram message
  });
  
  trailerButton.addEventListener('click', () => {
    const trailerContainer = document.getElementById('trailerContainer');
    if (trailerContainer.style.display === 'none') {
      showTrailer(movieTitle, trailerContainer);
    } else {
      trailerContainer.style.display = 'none';
      trailerButton.textContent = 'Watch Trailer';
      document.getElementById('trailerFrame').src = ''; // Stop video when hidden
    }
  });
}

async function showTrailer(movieTitle, trailerContainer) {
  try {
    const response = await fetch(
      `${YOUTUBE_SEARCH_API}?part=snippet&q=${encodeURIComponent(movieTitle + ' official trailer')}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) throw new Error('Failed to fetch trailer');
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const videoId = data.items[0].id.videoId;
      const trailerFrame = document.getElementById('trailerFrame');
      trailerFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      trailerContainer.style.display = 'block';
      document.getElementById('trailerButton').textContent = 'Hide Trailer';
    } else {
      showPopup('No trailer found for this movie.');
    }
  } catch (error) {
    console.error('Error fetching trailer:', error);
    showPopup('Error loading trailer. Please try again.');
  }
}

async function sendMessageToTelegram(message) {
  try {
    await fetch(TELEGRAM_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message })
    });
  } catch (error) {
    console.error("Error sending message to bot:", error);
  }
}

function showPopup(message) {
  const popup = document.createElement('div');
  popup.classList.add('popup');
  popup.innerHTML = `
    <div class="popup-content">
      <p>${message}</p>
      <button id="closePopupButton">Close</button>
    </div>
  `;
  document.body.appendChild(popup);
  document.getElementById('closePopupButton').addEventListener('click', () => popup.remove());
}

// Help button click event with popup
document.getElementById("helpButton")?.addEventListener("click", () => {
  showHelpPopup();
});

// Function to show help popup
function showHelpPopup() {
  // Remove any existing popup-content
  const existingPopup = document.querySelector('.popup-content');
  if (existingPopup) existingPopup.remove();

  // Create the popup-content div
  const popupContent = document.createElement('div');
  popupContent.classList.add('popup-content');
  popupContent.style.position = 'fixed';
  popupContent.style.top = '50%';
  popupContent.style.left = '50%';
  popupContent.style.transform = 'translate(-50%, -50%)';
  popupContent.style.maxWidth = '400px';
  popupContent.style.textAlign = 'center';
  popupContent.style.backgroundColor = '#333';
  popupContent.style.padding = '70px';
  
  popupContent.innerHTML = `
    <h1 style="color: #28a745; margin-bottom: 15px; font-size: 24px;">Need Help?</h1>
    <p style="color: #e0e0e0; line-height: 1.5; font-size: 18px;">For assistance with using Metflix or to request a movie, please watch the video by clicking the link given below 👇</p>
    <a href="#" style="display: inline-block; margin: 15px 0; color: #28a745; text-decoration: none; font-weight: bold; font-size: 18px; transition: color 0.3s;">Click Here</a><br>
    <button id="closePopupButton" style="background-color: #28a745; color: #ffffff; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 16px; transition: background-color 0.3s;">Close</button>
  `;
  
  document.body.appendChild(popupContent);

  // Add hover effects
  const link = popupContent.querySelector('a');
  const closeButton = popupContent.querySelector('#closePopupButton');
  
  link.addEventListener('mouseover', () => {
    link.style.color = '#66ff7f'; // Lighter green on hover
  });
  link.addEventListener('mouseout', () => {
    link.style.color = '#28a745'; // Original green
  });
  
  closeButton.addEventListener('mouseover', () => {
    closeButton.style.backgroundColor = '#218838'; // Darker green on hover
  });
  closeButton.addEventListener('mouseout', () => {
    closeButton.style.backgroundColor = '#28a745'; // Original green
  });

  // Close button functionality
  closeButton.addEventListener('click', () => {
    popupContent.remove();
  });

  // Play video when "Click Here" is clicked
  link.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default link behavior
    popupContent.innerHTML = `
      <h1 style="color: #28a745; margin-bottom: 15px; font-size: 24px;">Tutorial</h1>
      <iframe 
        width="100%" 
        height="315" 
        src="https://drive.google.com/file/d/1eM-23YvQ1xDD-IMl5jyLxxeQBzidmWjG/preview" 
        frameborder="0" 
        allow="autoplay; encrypted-media" 
        allowfullscreen
      ></iframe>
      <button id="closePopupButton" style="background-color: #28a745; color: #ffffff; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 16px; transition: background-color 0.3s; margin-top: 20px;">Close</button>
    `;
    
    // Re-attach close button event listener after replacing content
    const newCloseButton = popupContent.querySelector('#closePopupButton');
    newCloseButton.addEventListener('mouseover', () => {
      newCloseButton.style.backgroundColor = '#218838'; // Darker green on hover
    });
    newCloseButton.addEventListener('mouseout', () => {
      newCloseButton.style.backgroundColor = '#28a745'; // Original green
    });
    newCloseButton.addEventListener('click', () => {
      popupContent.remove();
    });
  });
}