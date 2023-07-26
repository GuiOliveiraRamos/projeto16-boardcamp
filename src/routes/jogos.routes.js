import { db } from "../database/database.connection";

export async function newGame(req, res) {
  const { name, image, stockTotal, pricePerDay } = req.body;

  await db.query(
    "INSERT INTO games (name, image, 'stock_total', 'price_per_day') VALUES ($1, $2, $3, $4)",
    [name, image, stockTotal, pricePerDay]
  );
  res.sendStatus(201);
}
