import axios from 'axios';

export async function hbarToEur(timestamp: string): Promise<number> {
  let time = new Date(timestamp).getTime()
  const response = await axios.get(
    `https://min-api.cryptocompare.com/data/pricehistorical?fsym=HBAR&tsyms=EUR&ts=${time}`
  );

  const eur = response.data.HBAR.EUR;
  return eur;
}

export async function eurToHbar(timestamp: string | number | Date): Promise<number> {
  let time = new Date(timestamp).getTime()
  const response = await axios.get(
    `https://min-api.cryptocompare.com/data/pricehistorical?fsym=EUR&tsyms=HBAR&ts=${time}`
  );
  
  const hbar = response.data.EUR.HBAR;
  return hbar;
}