import { db } from "../database/database.connection.js";
import { schemaGames } from "../schemas/games.schemas.js";

export async function newGame(req, res) {
  const { name, image, stockTotal, pricePerDay } = req.body;
  try {
    const validation = schemaGames.validate({
      name,
      stockTotal,
      pricePerDay,
    });
    if (validation.error) {
      return res.sendStatus(400);
    }
    const alreadyExists = await db.query(
      `SELECT * FROM games WHERE name = $1;`,
      [name]
    );
    if (alreadyExists.rowCount > 0) {
      return res.sendStatus(409);
    }
    await db.query(
      `INSERT INTO games (name, image, "stockTotal", "pricePerDay")
      VALUES ($1, $2, $3, $4);`,
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
