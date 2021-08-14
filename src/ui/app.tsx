/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { ToastContainer, toast } from 'react-toastify';
import './style/app.scss';
import 'react-toastify/dist/ReactToastify.css';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import { AddressTranslator } from 'nervos-godwoken-integration';
import * as CompiledContractArtifact from '../../build/contracts/ERC20.json';
import { GenerateMovieWrapper } from '../lib/contracts/GenerateMovieWrapper';
import { CONFIG } from '../config';
import { IMovie } from '../types/Movie';
import Name from './components/name';
import CreateMovie from './components/createMovie';
import { DEPLOYED_CKETH_ADDRESS, format, SUDT_PROXY_CONTRACT_ADDRESS } from './utils';
import { FORCE_BRIDGE_URL } from './utils';

async function createWeb3() {
    // Modern dapp browsers...
    if ((window as any).ethereum) {
        const godwokenRpcUrl = CONFIG.WEB3_PROVIDER_URL;
        const providerConfig = {
            rollupTypeHash: CONFIG.ROLLUP_TYPE_HASH,
            ethAccountLockCodeHash: CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
            web3Url: godwokenRpcUrl
        };

        const provider = new PolyjuiceHttpProvider(godwokenRpcUrl, providerConfig);
        const web3 = new Web3(provider || Web3.givenProvider);

        try {
            // Request account access if needed
            await (window as any).ethereum.enable();
        } catch (error) {
            // User denied account access...
        }

        return web3;
    }

    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    return null;
}

export function App() {
    const [web3, setWeb3] = useState<Web3>(null);
    const [contract, setContract] = useState<GenerateMovieWrapper>();
    const [accounts, setAccounts] = useState<string[]>();
    const [l2Balance, setL2Balance] = useState<bigint>();

    const [polyjuiceAddress, setPolyjuiceAddress] = useState<string | undefined>();
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const toastId = React.useRef(null);

    const [movies, setMovies] = useState<IMovie[]>();
    const [typedName, setTypedName] = useState<string>();
    const [currentMovieId, setCurrentMovieId] = useState<number>();
    const [loadingMovie, setLoadingMovie] = useState<boolean>();
    const [typedMovie, setTypedMovie] = useState<string>();
    const [loadingAllMovies, setLoadingAllMovies] = useState<boolean>();
    const [layer2DepositAddress, setLayer2DepositAddress] = useState<string>();
    const [sudt, setSudt] = useState<number>();
    const [ckEth, setCketh] = useState<number>();

    useEffect(() => {
        if (accounts?.[0]) {
            const addressTranslator = new AddressTranslator();
            setPolyjuiceAddress(addressTranslator.ethAddressToGodwokenShortAddress(accounts?.[0]));
        } else {
            setPolyjuiceAddress(undefined);
        }
    }, [accounts?.[0]]);

    useEffect(() => {
        if (transactionInProgress && !toastId.current) {
            toastId.current = toast.info(
                'Transaction in progress. Confirm MetaMask signing dialog and please wait...',
                {
                    position: 'top-right',
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    closeButton: false
                }
            );
        } else if (!transactionInProgress && toastId.current) {
            toast.dismiss(toastId.current);
            toastId.current = null;
        }
    }, [transactionInProgress, toastId.current]);

    useEffect(() => {
        if (accounts && contract) {
            getAllMovies();
        }
    }, [accounts, contract]);

    useEffect(() => {
        if (currentMovieId) addBgGreen();
    }, [currentMovieId]);

    useEffect(() => {
        if (web3 && polyjuiceAddress && accounts) {
            getLayer2SudtAndCkethBalance();
        }
    }, [web3, polyjuiceAddress, accounts]);

    const account = accounts?.[0];

    const getLayer2SudtAndCkethBalance = async () => {
        const sudtContract = new web3.eth.Contract(
            CompiledContractArtifact.abi as any,
            SUDT_PROXY_CONTRACT_ADDRESS
        );

        const sudtBalance = Number(
            await sudtContract.methods.balanceOf(polyjuiceAddress).call({
                from: accounts?.[0]
            })
        );

        setSudt(sudtBalance);

        const ckethContract = new web3.eth.Contract(
            CompiledContractArtifact.abi as any,
            DEPLOYED_CKETH_ADDRESS
        );

        const ckEthBalance = Number(
            await ckethContract.methods.balanceOf(polyjuiceAddress).call({
                from: accounts?.[0]
            })
        );

        setCketh(ckEthBalance);
    };

    const getSingleMovie = async (_movieId: number) => {
        const movie = await contract.getSingleMovie(_movieId, accounts?.[0]);
        return movie;
    };

    const getAllMovies = async () => {
        setLoadingAllMovies(true);
        const _totalMovie = Number(await contract.getTotalMovie(accounts?.[0]));
        const _movies = [];

        for (let i = 1; i <= _totalMovie; i++) {
            const _movie = await getSingleMovie(i);
            const modifiedNewMovie = {
                id: Number(_movie.id),
                name: _movie.name,
                rate: Number(_movie.rate),
                rateSize: Number(_movie.rateSize)
            };

            _movies.push(modifiedNewMovie);
        }

        setMovies(_movies);
        setLoadingAllMovies(false);
    };
    const addBgGreen = () => {
        const element = document.getElementById(currentMovieId.toString());
        element.classList.add('bg-green');
    };

    const removeBgGreen = () => {
        if (currentMovieId) {
            const element = document.getElementById(currentMovieId.toString());
            element.classList.remove('bg-green');
        }
    };
    const generateRandomMovieId = async () => {
        setLoadingMovie(true);
        const movieId = Number(await contract.getRandomNumberFromName(typedName, accounts?.[0]));
        setCurrentMovieId(movieId === 0 ? 1 : movieId);
        toast('Successfully generated a new movie ID 🎥 ', { type: 'success' });
        removeBgGreen();
        setLoadingMovie(false);
    };

    const createMovie = async () => {
        try {
            setTransactionInProgress(true);
            await contract.createMovie(typedMovie, 10, account);
            toast('Successfully created new movie ', { type: 'success' });
            await getAllMovies();
        } catch (error) {
            console.error(error);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
        }
    };

    useEffect(() => {
        if (web3) {
            return;
        }

        (async () => {
            const _web3 = await createWeb3();
            setWeb3(_web3);

            const _accounts = [(window as any).ethereum.selectedAddress];
            setAccounts(_accounts);
            console.log({ _accounts });
            const _contract = new GenerateMovieWrapper(_web3);
            setContract(_contract);
            if (_accounts && _accounts[0]) {
                const _l2Balance = BigInt(await _web3.eth.getBalance(_accounts[0]));
                setL2Balance(_l2Balance);
            }
        })();
    });

    const getLayer2DepositAddress = async () => {
        const addressTranslator = new AddressTranslator();
        const depositAddress = await addressTranslator.getLayer2DepositAddress(web3, accounts?.[0]);
        setLayer2DepositAddress(depositAddress.addressString);
    };

    const LoadingIndicator = () => <span className="rotating-icon">⚙️</span>;

    return (
        <div className="application">
            <h1>Name to Movie Generator</h1>
            <div className="account-info">
                Your ETH address: <b>{accounts?.[0]}</b>
                <br />
                <br />
                Your Polyjuice address: <b>{polyjuiceAddress || ' - '}</b>
                <br />
                <br />
                Nervos Layer 2 balance:{' '}
                <b>{l2Balance ? (l2Balance / 10n ** 8n).toString() : <LoadingIndicator />} CKB</b>
                <br />
                <br />
                ckETH: <b>{ckEth ? format(ckEth.toString(), 18) : <LoadingIndicator />} ckETH</b>
                <br />
                <br />
                SUDT(ID:2267): <b>{sudt ? (sudt as number) : <LoadingIndicator />} MOVIE</b>
                <br />
                <br />
                <div className="deposit">
                    <h2>Deposit to Layer2</h2>
                    {!layer2DepositAddress && (
                        <button onClick={getLayer2DepositAddress}>
                            Show My Layer2 Deposit Address
                        </button>
                    )}

                    {layer2DepositAddress && (
                        <div className="deposit-address">
                            <p> {layer2DepositAddress}</p>
                            <br />
                            <ul>
                                <li>
                                    <small>Copy the address above</small>
                                </li>
                                <li>
                                    <small>Go to force bridge</small>
                                </li>
                                <li>
                                    <small>
                                        Paste the address as <b>Recipient</b>
                                    </small>
                                </li>
                            </ul>
                            <button onClick={() => window.open(FORCE_BRIDGE_URL, '_blank')}>
                                Deposit via Force Bridge
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <hr />
            <br />
            <h3>What is this DAPP?</h3>
            <p>
                Type your name and press <b>Find My Movie</b>. It will randomly generate a movie id
                according to your name. <br />
                You can also create a movie to show others by clicking <b>Create Movie</b>{' '}
            </p>
            <hr />
            <br />
            <br />
            <div className="content">
                <Name
                    name={typedName}
                    onNameChange={(e: any) => setTypedName(e.target.value)}
                    generateRandomNumber={generateRandomMovieId}
                    movieId={currentMovieId}
                    loading={loadingMovie}
                />
                <div className="vl"></div>

                <div className="movie">
                    <CreateMovie
                        onMovieChange={e => setTypedMovie(e.target.value)}
                        movieName={typedMovie}
                        createMovie={createMovie}
                    />
                    {loadingAllMovies && (
                        <div>
                            <LoadingIndicator /> <span>Loading movielist...</span>{' '}
                        </div>
                    )}
                    {!loadingAllMovies && (
                        <div className="show-movies">
                            {movies?.map((movie, i) => {
                                return (
                                    <div
                                        key={movie.id}
                                        className="single-movie"
                                        id={movie.id.toString()}
                                    >
                                        <p> {`${movie.id}-${movie.name}`}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}
