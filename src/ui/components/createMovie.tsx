import React from 'react';

interface ICreateMovie {
    onMovieChange: (e: any) => void;
    movieName: string;

    createMovie: () => void;
}
function CreateMovie(props: ICreateMovie) {
    // const generateRatesArray = () => {
    //     const arr = [];
    //     for (let i = 1; i <= 10; i++) {
    //         arr.push(i);
    //     }
    //     return arr;
    // };
    return (
        <div className="create-movie">
            <h4>Write Movie Name</h4>
            <input
                placeholder="Movie name..."
                type="text"
                onChange={props.onMovieChange}
                value={props.movieName}
            />
            {/* <label for="cars">Choose a car:</label> */}

            {/* <select id="rates" className="mb-1" onChange={props.onRateChange}>
                {generateRatesArray().map((index: number) => (
                    <option key={index} value={index.toString()}>
                        {index}
                    </option>
                ))}
            </select> */}
            <br />
            {props.movieName?.length < 1 && (
                <small style={{ color: 'red' }}>Movie length should NOT be empty</small>
            )}
            <button className="mt-1" onClick={props.createMovie}>
                Create Movie
            </button>
        </div>
    );
}

export default CreateMovie;
