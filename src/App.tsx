import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

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

    const fetchFilms = useCallback(async (page: number = 1, searchTermValue: string = '', type: string = 'all') => {
        setLoading(true);
        setError('');
        try {
            let url = `https://www.omdbapi.com/?apikey=${API_KEY}&page=${page}`;
            if (type !== 'all') {
                url += `&type=${type}`;
            }
            if (searchTermValue.trim() !== '') {
                url += `&s=${encodeURIComponent(searchTermValue)}`;
            } else {
                url += `&s=${type}`;
            }
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

    useEffect(() => {
        fetchFilms(1, '', 'all');
    }, []);

    // Обновляем при смене страницы\фильтра\поиска
    useEffect(() => {
        fetchFilms(currentPage, searchTerm, typeFilter);
    }, [currentPage, searchTerm, typeFilter, fetchFilms]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleTypeChange = (type: 'all' | 'movie' | 'series') => {
        setTypeFilter(type);
        setCurrentPage(1);
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(totalResults / 10)));
    };

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

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

            {/* Фильтры */}
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
            {/* Фильтры КОНЕЦ*/}


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

            {/* странички */}
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