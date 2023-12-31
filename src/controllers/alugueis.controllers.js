import { db } from "../database/database.connection.js";
import { schemaRentals } from "../schemas/rentals.schemas.js";
export async function getAllRentals(req, res) {
  try {
    const rentalData = await db.query(`  SELECT 
    r.id,
    r."customerId",
    r."gameId",
    r."rentDate",
    r."daysRented",
    r."returnDate",
    r."originalPrice",
    r."delayFee",
    c.id AS "customer.id",
    c.name AS "customer.name",
    g.id AS "game.id",
    g.name AS "game.name"
FROM 
    rentals r
JOIN
    customers c ON r."customerId" = c.id
JOIN
    games g ON r."gameId" = g.id;
`);

    const rentals = rentalData.rows.map((rental) => ({
      id: rental.id,
      customerId: rental.customerId,
      gameId: rental.gameId,
      rentDate: rental.rentDate,
      daysRented: rental.daysRented,
      returnDate: rental.returnDate,
      originalPrice: rental.originalPrice,
      delayFee: rental.delayFee,
      customer: {
        id: rental["customer.id"],
        name: rental["customer.name"],
      },
      game: {
        id: rental["game.id"],
        name: rental["game.name"],
      },
    }));

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
    if (alreadyExists.rowCount > 0) return res.sendStatus(400);

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

    if (rental.rows[0].returnDate !== null) return res.sendStatus(400);

    const game = await db.query(`SELECT * FROM games WHERE id = $1`, [
      rental.rows[0].gameId,
    ]);

    const delayTime = Math.abs(
      new Date().getTime() - rental.rows[0].rentDate.getTime()
    );
    const delayDays = Math.floor(delayTime / (1000 * 60 * 60 * 24));
    let delayFee = null;

    if (delayDays > rental.rows[0].daysRented) {
      delayFee =
        (delayDays - rental.rows[0].daysRented) * game.rows[0].pricePerDay;
    }

    await db.query(
      `UPDATE rentals SET "delayFee" = $1, "returnDate" = $2 WHERE id = $3;`,
      [delayFee, returnDate, id]
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

    if (rental.rows.length === 0) return res.sendStatus(404);
    if (rental.rows[0].returnDate === null) return res.sendStatus(400);

    await db.query(`DELETE FROM rentals WHERE id = $1;`, [id]);

    res.sendStatus(200);
  } catch (err) {
    res.send(err.message);
  }
}
