import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma'; // Adjust the path based on your project structure

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  switch (method) {
    case 'PUT':
      try {
        const product = await prisma.product.update({
          where: { id: parseInt(id) },
          data: req.body,
        });
        res.status(200).json(product);
      } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Error updating product' });
      }
      break;

    case 'DELETE':
      try {
        await prisma.product.delete({
          where: { id: parseInt(id) },
        });
        res.status(204).end();
      } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Error deleting product' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
