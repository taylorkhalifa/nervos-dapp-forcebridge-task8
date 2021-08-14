import Web3 from 'web3';
import * as GenerateMovieJSON from '../../../build/contracts/GenerateMovie.json';
import { GenerateMovie } from '../../types/GenerateMovie';

const DEFAULT_SEND_OPTIONS = {
    gas: 6000000
};

const MOVIE_CONTRACT_ADDRESS = '0xd18a9E9810367AAbE6696901B6B714909A63965E';

export class GenerateMovieWrapper {
    web3: Web3;

    contract: GenerateMovie;

    address: string;

    constructor(web3: Web3) {
        this.web3 = web3;
        this.address = MOVIE_CONTRACT_ADDRESS;
        this.contract = new web3.eth.Contract(GenerateMovieJSON.abi as any) as any;
        this.contract.options.address = MOVIE_CONTRACT_ADDRESS;
    }

    get isDeployed() {
        return Boolean(this.address);
    }

    async getTotalMovie(fromAddress: string) {
        const total = this.contract.methods
            .totalMovie()
            .call({ ...DEFAULT_SEND_OPTIONS, from: fromAddress });

        return total;
    }

    async getSingleMovie(_movieId: number, fromAddress: string) {
        const movie = this.contract.methods
            .movies(_movieId)
            .call({ ...DEFAULT_SEND_OPTIONS, from: fromAddress });
        return movie;
    }

    async getRandomNumberFromName(fullName: string, fromAddress: string) {
        const data = await this.contract.methods
            .getGeneratedMovie(fullName)
            .call({ from: fromAddress });

        return parseInt(data, 10);
    }

    async rateMovie(_movieId: number, _rate: number, fromAddress: string) {
        const tx = await this.contract.methods
            .rateMovie(_movieId, _rate)
            .send({ ...DEFAULT_SEND_OPTIONS, from: fromAddress });
        return tx;
    }

    async createMovie(name: string, rate: number, fromAddress: string) {
        const tx = await this.contract.methods.createMovie(name, rate).send({
            ...DEFAULT_SEND_OPTIONS,
            from: fromAddress
        });

        return tx;
    }
}
