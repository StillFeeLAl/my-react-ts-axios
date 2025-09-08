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
    const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
    const [filmDetails, setFilmDetails] = useState<any>(null);

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
                setFilmDetails(data);
            } else {
                setFilms(data.Search);
                setTotalResults(parseInt(data.totalResults, 10));
                setFilmDetails(null);
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

    

    const handleFilmClick = async (film: Film) => {
        setSelectedFilm(film);
        try {
            const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${film.imdbID}&plot=full`);
            const data = await response.json();
            if (data.Response === 'True') {
              setFilmDetails(data);
            } else {
              setFilmDetails(null);
            }
          } catch (err) {}
    };


    return (
        <div className="app-container">

            <div className="search-bar">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Введите название"
                />
            </div>

            {/* Фильтры */}
            <div className="filter-container">
                <button
                    onClick={() => handleTypeChange('all')}
                    className={typeFilter === 'all' ? 'active' : 'inactive'}
                >
                    Все
                </button>
                <button
                    onClick={() => handleTypeChange('movie')}
                    className={typeFilter === 'movie' ? 'active' : 'inactive'}
                >
                    Фильмы
                </button>
                <button
                    onClick={() => handleTypeChange('series')}
                    className={typeFilter === 'series' ? 'active' : 'inactive'}
                >
                    Сериалы
                </button>
                {/* <button
                    onClick={() => handleTypeChange('episodes')}
                    className={typeFilter === 'episodes' ? 'active' : ''}
                >
                    Эпизоды
                </button>
                 Это можно добавить, но в нем ничего не отображается
                */}
            </div>
            {/* Фильтры КОНЕЦ*/}


            {loading && <p className='loading'>Думаем...</p>}

            <div className="films-container">
                {films.length > 0 ? (
                    films.map((film) => (
                        <div key={film.imdbID} className="film-item"
                        onClick={() => handleFilmClick(film)}>
                            <img
                                src={film.Poster}
                                alt={film.Title}
                                className="film-poster"
                            />
                            <div className="film-details">
                                <span className='film-title'>{film.Title}</span> <span className='film-year'>({film.Year})</span>
                            </div>
                        </div>
                    ))
                ) : (
                    !loading && <p className='loading'>Нет результатов.</p>
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

            {selectedFilm && (
                <div className="modal-overlay" onClick={() => setSelectedFilm(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button" onClick={() => setSelectedFilm(null)}>x</button>
                        <h2 className='film-name'>{selectedFilm.Title} ({selectedFilm.Year})</h2>

                        <div className="sides">
                        <div className="left-side">
                            <img src={selectedFilm.Poster} alt={selectedFilm.Title} />
                        </div>

                        <div className="right-side">

                            <div className='about'>
                                <p className='ans'>{filmDetails?.Plot ? filmDetails.Plot.slice(0, 500) + (filmDetails.Plot.length > 500 ? '...' : '') : 'Нет данных'}</p>
                            </div>

                            <div className='about'>
                                <p className='ques'>Type</p>
                                <p className='ans'>{filmDetails?.Type || 'Нет данных'}</p>
                            </div>

                            <div className='about'>
                                <p className='ques'>Release Date</p>
                                <p className='ans'>{filmDetails?.Released || 'Нет данных'}</p>
                            </div>

                            <div className='about'>
                                <p className='ques'>Run time</p>
                                <p className='ans'>{filmDetails?.Runtime || 'Нет данных'}</p>
                            </div>

                            <div className='about'>
                                <p className='ques'>Genres</p>
                                <p className='ans'>{filmDetails?.Genre || 'Нет данных'}</p>
                            </div>

                            <div className='about'>
                                <p className='ques'>Actors</p>
                                <p className='ans'>{filmDetails?.Actors || 'Нет данных'}</p>
                            </div>

                        </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;