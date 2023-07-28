import { db } from "../database/database.connection.js";
import { schemaRentals } from "../schemas/rentals.schemas.js";
export async function getAllRentals(req, res) {
  try {
    const rentalData = await db.query(`SELECT 
    rentals.id, 
    rentals."customerId", 
    rentals."gameId", 
    rentals."rentDate", 
    rentals."daysRented", 
    rentals."returnDate", 
    rentals."originalPrice", 
    rentals."delayFee", 
    customers.name AS "nomeCliente", 
    games.name AS "nomeJogo"
  FROM 
    rentals 
    JOIN customers ON rentals."customerId" = customers.id 
    JOIN games ON rentals."gameId" = games.id;`);

    const rentals = rentalData.rows.map((row) => {
      const {
        id,
        customerId,
        gameId,
        rentDate,
        daysRented,
        returnDate,
        originalPrice,
        delayFee,
        clientName,
        gameName,
      } = row;

      const customer = { id: customerId, name: clientName };
      const game = { id: gameId, name: gameName };

      return {
        id,
        customerId,
        gameId,
        rentDate,
        daysRented,
        returnDate,
        originalPrice,
        delayFee,
        customer,
        game,
      };
    });
    res.send(rentals);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function newRental(req, res) {
  const { customerId, gameId, daysRented } = req.body;
  const rentDate = new Date();
  const game = await db.query(
    `SELECT "pricePerDay" FROM games WHERE id = $1;`,
    [gameId]
  );
  const pricePerDay = game.rows[0].pricePerDay;
  const originalPrice = daysRented * pricePerDay;
  const client = await db.query(`SELECT * FROM customers WHERE id = $1;`, [
    customerId,
  ]);
  const alreadyExists = await db.query(
    `SELECT * FROM rentals WHERE "customerId" = $1 AND "gameId" = $2 AND "daysRented" = $3;`,
    [customerId, gameId, daysRented]
  );
  try {
    const validation = schemaRentals.validate({
      customerId,
      gameId,
      daysRented,
    });

    if (validation.error) return res.sendStatus(403);

    if (game.rowCount === 0) return res.sendStatus(402);

    if (client.rowCount === 0) return res.sendStatus(401);

    if (alreadyExists.rowCount > 0) return res.sendStatus(409);

    if (daysRented <= 0) return res.send(400);
    const returnDate = null;
    const delayFee = null;

    await db.query(
      `INSERT INTO rentals ("customerId", "gameId", "daysRented", "rentDate", "originalPrice", "returnDate", "delayFee") 
      VALUES ($1, $2, $3, $4, $5, $6, $7);`,
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

export async function endRental(req, res) {
  const { id } = req.params;
  const returnDate = new Date().toISOString().slice(0, 10);

  try {
    const rental = await db.query(`SELECT * FROM rentals WHERE "id" = $1;`, [
      id,
    ]);
    if (rental.rowCount === 0) return res.sendStatus(404);

    const { rentDate, daysRented, gameId } = rental.rows[0];
    const { pricePerDay } = await db.query(
      `SELECT "pricePerDay" FROM games WHERE "id" = $1;`,
      [gameId]
    );

    const daysOverdue = Math.max(
      Math.floor(
        (Date.now() -
          new Date(rentDate).getTime() -
          daysRented * 24 * 60 * 60 * 1000) /
          (24 * 60 * 60 * 1000)
      ),
      0
    );
    const delayFee = daysOverdue * pricePerDay;
    await db.query(
      `UPDATE rentals SET "returnDate" = $1, "delayFee" = $2 WHERE "id" = $3;`,
      [returnDate, delayFee, id]
    );
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
}
