import { db } from "../database/database.connection.js";
import { schemaGames } from "../schemas/games.schemas.js";

export async function newGame(req, res) {
  const { name, image, stockTotal, pricePerDay } = req.body;
  try {
    const validation = schemaGames.validate(
      { name, image, stockTotal, pricePerDay },
      { abortEarly: false }
    );
    if (validation.error) return res.status(400);

    await db.query(
      "INSERT INTO games (name, image, 'stock_total', 'price_per_day') VALUES ($1, $2, $3, $4)",
      [name, image, stockTotal, pricePerDay]
    );
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function getGames(req, res) {
  try {
    const games = await db.query(`SELECT * FROM games;`);
    res.send(games.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
}
