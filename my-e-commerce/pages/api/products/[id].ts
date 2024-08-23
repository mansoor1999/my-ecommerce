import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';

interface DecodedToken {
  id: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { id } = req.query;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      // Verify JWT token and cast to DecodedToken
      const decoded = jwt.verify(token, SECRET_KEY) as DecodedToken;
      const userId = decoded.id;

      // Validate and convert ID
      if (typeof id !== 'string' || isNaN(Number(id))) {
        return res.status(400).json({ message: 'Invalid product ID' });
      }

      const productId = Number(id);

      // Check if the product exists and belongs to the user
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { userId: true }, // Select only the userId field
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (product.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this product' });
      }

      // Delete the product
      await prisma.product.delete({
        where: { id: productId },
      });

      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Error deleting product', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
