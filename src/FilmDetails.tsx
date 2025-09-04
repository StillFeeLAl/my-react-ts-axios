import React, { useEffect, useState } from 'react';


export {}
interface Film {
    imdbID: string;
    Title: string;
    Year: string;
    Poster: string;
    Plot?: string;
    Genre?: string;
    Director?: string;
}

const API_KEY = '6c0294d0';

const FilmDetails: React.FC = () => {
    const [film, setFilm] = useState<Film | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const imdbID = new URLSearchParams(window.location.search).get('imdbID');

    useEffect(() => {
        if (imdbID) {
            fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}&plot=full`)
                .then(res => res.json())
                .then(data => {
                    if (data.Response === 'False') {
                        setError(data.Error);
                    } else {
                        setFilm(data);
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [imdbID]);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!film) return <p>Фильм не найден</p>;

    return (
        <div>
            <h2>{film.Title} ({film.Year})</h2>
            <img src={film.Poster} alt={film.Title} style={{ width: '300px' }} />
            <p><strong>Жанр:</strong> {film.Genre}</p>
            <p><strong>Режиссер:</strong> {film.Director}</p>
            <p><strong>Описание:</strong> {film.Plot}</p>
        </div>
    );
};

export default FilmDetails;