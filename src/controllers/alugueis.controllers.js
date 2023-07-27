import { db } from "../database/database.connection.js";
import { schemaRentals } from "../schemas/rentals.schemas.js";

export async function getAllRentals(req, res) {
  try {
    const rentals = await db.query(`SELECT * FROM rentals;`);
    res.send(rentals.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function newRental(req, res) {
  const { customerId, gameId, daysRented } = req.body;
  const rentDate = new Date();
  const pricePerDay = game.rows[0].pricePerDay;
  const originalPrice = daysRented * pricePerDay;
  const game = await db.query(
    `SELECT "pricePerDay" FROM games WHERE "gameId" = $1;`,
    [gameId]
  );

  const client = await db.query(
    `SELECT * FROM customers WHERE customerId = $1;`,
    [customerId]
  );
  const alreadyExists = await db.query(
    `SELECT * FROM rentals WHERE "customerId" = $1 AND gameId = $2 AND daysRented = $3;`,
    [customerId, gameId, daysRented]
  );
  try {
    const validation = schemaRentals.validate({
      customerId,
      gameId,
      daysRented,
    });

    if (validation.error) return res.sendStatus(400);

    if (game.rowCount === 0) return res.sendStatus(400);

    if (client.rowCount === 0) return res.sendStatus(400);

    if (alreadyExists.rowCount > 0) return res.sendStatus(409);

    if (daysRented <= 0) return res.sendStatus(400);
    const returnDate = null;
    const delayFee = null;

    await db.query(
      `INSERT INTO rentals (customerId, gameId, daysRented, rentDate, originalPrice, returnDate, delayFee) VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [
        customerId,
        gameId,
        daysRented,
        rentDate,
        originalPrice,
        returnDate,
        delayFee,
      ]
    );
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
}
