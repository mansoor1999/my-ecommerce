import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { name, category, description, price, discount } = req.body;

    try {
      const product = await prisma.product.update({
        where: { id: parseInt(id as string) },
        data: {
          name,
          category,
          description,
          price: parseFloat(price),
          discount: parseFloat(discount),
        },
      });
      res.status(200).json(product);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ message: 'Error updating product' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.product.delete({
        where: { id: parseInt(id as string) },
      });
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Error deleting product' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
