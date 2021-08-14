export const DEPLOYED_CKETH_ADDRESS = '0x57E5b107Acf6E78eD7e4d4b83FF76C041d3307b7';
export const SUDT_PROXY_CONTRACT_ADDRESS = '0x3Dbd71f6b4f4b10100C7e73f50d8Cd057ce0221D';
export const FORCE_BRIDGE_URL =
    'https://force-bridge-test.ckbapp.dev/bridge/Ethereum/Nervos?xchain-asset=0x0000000000000000000000000000000000000000';
export function format(number: string, ndecimals: number) {
    if (number.length > ndecimals) {
        return `${number.substring(0, number.length - ndecimals)}.${number
            .substring(number.length - ndecimals)
            .replace(/0+/, '')}`;
    }
    const nzeros = ndecimals - number.length;
    const newnumber = `0.${String('0').repeat(nzeros)}${number.replace(/0+/, '')}`;
    return newnumber;
}
