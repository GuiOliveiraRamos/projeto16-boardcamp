import { db } from "../database/database.connection";

export default async function getAllRentals(req, res) {
  try {
    const rentals = await db.query(`SELECT * FROM rentals;`);
    res.send(rentals.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
}
