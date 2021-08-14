import React from 'react';
import '../style/name.scss';

interface IName {
    generateRandomNumber?: () => void;
    onNameChange: (e: any) => void;
    movieId?: number;
    loading?: boolean;
    name: string;
}
function Name(props: IName) {
    const { generateRandomNumber, movieId, loading, onNameChange, name } = props;

    const LoadingMovie = () => (
        <div className="movie-loading rotating-icon">
            <img
                alt="movie"
                src="https://freepikpsd.com/media/2019/11/film-reel-transparent-background-8-Transparent-Images.png"
            />
        </div>
    );
    return (
        <div className="name-wrapper mr-1">
            <h4>Write your name:</h4>
            <input
                placeholder="Write a name..."
                className="mb-1"
                type="text"
                onChange={onNameChange}
                value={name}
            />
            <button onClick={generateRandomNumber}>Find My Movie</button>
            {loading && <LoadingMovie />}
            {!loading && movieId && (
                <div className="number">
                    <h4>{movieId}</h4>
                </div>
            )}
        </div>
    );
}

export default Name;
