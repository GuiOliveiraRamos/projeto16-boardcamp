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
        rentDate: new Date(rentDate).toISOString().slice(0, 10),
        daysRented,
        returnDate: new Date(returnDate).toISOString().slice(0, 10),
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
  try {
    const rentDate = new Date().toISOString().slice(0, 10);
    if (daysRented <= 0) return res.send(400);

    const game = await db.query(`SELECT * FROM games WHERE id = $1;`, [gameId]);
    if (game.rowCount === 0) return res.sendStatus(400);

    const client = await db.query(`SELECT * FROM customers WHERE id = $1;`, [
      customerId,
    ]);
    if (client.rowCount === 0) return res.sendStatus(400);

    const alreadyExists = await db.query(
      `SELECT * FROM rentals WHERE "gameId" = $1 AND "returnDate" IS NULL;`,
      [gameId]
    );
    if (alreadyExists.rowCount > 0) return res.sendStatus(409);

    const validation = schemaRentals.validate({
      customerId,
      gameId,
      daysRented,
    });

    if (validation.error) return res.sendStatus(400);

    const pricePerDay = game.rows[0].pricePerDay;
    const originalPrice = daysRented * pricePerDay;

    await db.query(
      `INSERT INTO rentals ("id", "customerId","gameId", "rentDate", "daysRented", "returnDate","originalPrice", "delayFee") 
      VALUES (default, $1, $2, $3, $4, null, $5, null);`,
      [customerId, gameId, rentDate, daysRented, originalPrice]
    );
    res.sendStatus(201);
  } catch (err) {
    console.log("teste");
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

export async function deleteRentals(req, res) {
  const { id } = req.params;

  try {
    const rental = await db.query(`SELECT * FROM rentals WHERE id = $1;`, [id]);
    if (rental.rows.length < 1) return res.sendStatus(404);

    await db.query(`DELETE FROM rentals WHERE id = $1;`, [id]);
    res.sendStatus(200);
  } catch (err) {
    res.send(err.message);
  }
}
