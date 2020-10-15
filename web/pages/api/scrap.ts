import { NextApiRequest, NextApiResponse } from 'next';
import { scrap } from '../../lib/scrap';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(await scrap());
}