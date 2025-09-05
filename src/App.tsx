import React, { useState, useEffect, useCallback } from 'react';
import './list.css';

const API_KEY = '6c0294d0';

interface Film {
    imdbID: string;
    Title: string;
    Year: string;
    Poster: string;
}

function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [films, setFilms] = useState<Film[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [typeFilter, setTypeFilter] = useState<'all' | 'movie' | 'series'>('all');



  // Фильтрация

  const fetchFilms = useCallback(async (page: number = 1, searchTermValue: string = '', type: string = 'all') => {
    if (searchTermValue.trim() === '') {
      setFilms([]);
      setTotalResults(0);
      setLoading(false);
      return;
    }
  
    setLoading(true);
    setError('');
    try {
      let url = `https://www.omdbapi.com/?apikey=${API_KEY}&page=${page}`;
  
      if (type !== 'all') {
        url += `&type=${type}`;
      }
  
      url += `&s=${encodeURIComponent(searchTermValue)}`;
  
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.Response === 'False') {
        setFilms([]);
        setError(data.Error);
        setTotalResults(0);
      } else {
        setFilms(data.Search);
        setTotalResults(parseInt(data.totalResults, 10));
      }
    } catch (err) {
      setError('Failed to fetch data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = event.target.value;
        setSearchTerm(newSearchTerm);
        setCurrentPage(1);
        // мгновенный поиск
        fetchFilms(1, newSearchTerm, typeFilter);
    };

    const handleTypeChange = (type: 'all' | 'movie' | 'series') => {
        setTypeFilter(type);
      };

    const handleNextPage = () => {
        setCurrentPage((prev) => prev + 1);
    };

    const handlePrevPage = () => {
        setCurrentPage((prev) => prev - 1);
    };


    useEffect(() => {
        // при изменении стр иль поиска - запрос
        if (searchTerm.trim() === '') {
            setFilms([]);
            setTotalResults(0);
            return;
          }
        fetchFilms(currentPage, searchTerm, typeFilter);
    }, [currentPage, searchTerm, typeFilter, fetchFilms]);

    const totalPages = Math.ceil(totalResults / 10);

    return (
        <div className="app-container">
            <h1>Поиск фильмов</h1>

            <div className="search-bar">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Введите название"
                />
            </div>

            {/* Фильтр */}
            <div className="filter-container" style={{ marginTop: '10px' }}>
            <button
        onClick={() => handleTypeChange('all')}
        className={typeFilter === 'all' ? 'active' : ''}
      >
        Все
      </button>
      <button
        onClick={() => handleTypeChange('movie')}
        className={typeFilter === 'movie' ? 'active' : ''}
      >
        Фильмы
      </button>
      <button
        onClick={() => handleTypeChange('series')}
        className={typeFilter === 'series' ? 'active' : ''}
      >
        Сериалы
      </button>

            </div>

            {loading && <p>Думаем...</p>}
            {error && <p className="error-message">{error}</p>}

            <div className="films-container">
                {films.length > 0 ? (
                    films.map((film) => (
                        <div key={film.imdbID} className="film-item">
                            <img
                                src={film.Poster}
                                alt={film.Title}
                                className="film-poster"
                            />
                            <div className="film-details">
                                <strong>{film.Title}</strong> ({film.Year})
                            </div>
                        </div>
                    ))
                ) : (
                    !loading && <p>Нет результатов.</p>
                )}
            </div>

            {totalResults > 0 && (
                <div className="pagination">
                    <button onClick={handlePrevPage} disabled={currentPage === 1}>
                        «
                    </button>
                    <span className="page-number">
                        {currentPage} из {totalPages}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >
                        »
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;