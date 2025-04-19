import { useState, useEffect } from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard'
import { useDebounce } from "react-use";

const API_KEY = import.meta.env.VITE_TDMB_API_KEY
const API_URL = 'https://api.themoviedb.org/3'
const API_OPTION = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [moviesList, setMoviesList] = useState([])
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setisLoading] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  const fetchMovies = async (query = '') => {
    try {
      setisLoading(true);

      // Define endpoints for search, popular, and trending movies
      const searchEndpoint = `${API_URL}/search/movie?query=${encodeURIComponent(query)}`;
      const popularEndpoint = `${API_URL}/discover/movie?sort_by=popularity.desc`;
      const trendingEndpoint = `${API_URL}/trending/movie/day`;

      // Select the correct endpoint
      const movieEndpoint = query ? searchEndpoint : popularEndpoint;

      // Fetch movies and trending movies simultaneously
      const [movieResponse, trendingResponse] = await Promise.all([
        fetch(movieEndpoint, API_OPTION),
        fetch(trendingEndpoint, API_OPTION),
      ]);

      if (!movieResponse.ok || !trendingResponse.ok) {
        throw new Error("An error occurred. Please try again later.");
      }

      const movieData = await movieResponse.json();
      const trendingData = await trendingResponse.json();

      if (movieData.response === "False") {
        setErrorMessage(movieData.Error || "An error occurred. Please try again later.");
        setMoviesList([]);
        setTrendingMovies([]); // Ensure trending movies are also cleared on error
        return;
      }

      // Set the movie lists
      setMoviesList(movieData.results || []);
      setTrendingMovies(trendingData.results.slice(0, 5) || []); // Store only top 5 trending movies
      console.table(trendingData.results);

    } catch (error) {
      setErrorMessage("An error occurred. Please try again later.");
    } finally {
      setisLoading(false);
    }
  };


  useEffect(() => {
    fetchMovies(debouncedSearchTerm)
  }, [debouncedSearchTerm])

  useDebounce(() => {
    setDebouncedSearchTerm(searchTerm)
  }, 1000, [searchTerm])

  return (
    <>
      <main>
        <div className="pattern">
          <div className="wrapper">
            <header>
              <img src="./hero.png" alt="Hero Banner" />
              <h1>Find <span className='text-gradient'>Movies</span> you will Enjoy without the Hassle</h1>
              <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}></Search>
            </header>
            {(trendingMovies.length > 0 && (
              <section className='trending'>
                <h2>Trending Movies</h2>
                <ul>
                  {trendingMovies.map((movie, index) => (
                    <li key={movie.id}>
                      <p>{index + 1}</p>
                      <img src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`} alt={movie.title} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <section className='all-movies'>
              <h2 className=''>All Movies</h2>
              {isLoading ? <Spinner /> : errorMessage ? <p className='text-red-500'>{errorMessage}</p> : (
                <ul>
                  {
                    moviesList.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))
                  }

                </ul>
              )}
            </section>
          </div>
        </div>

      </main>
    </>
  )
}

export default App
