import dayjs from "dayjs";
import { db } from "../database/database.connection.js";
import { schemaCustomers } from "../schemas/customers.schemas.js";

export async function newCustomer(req, res) {
  const { name, phone, cpf, birthday } = req.body;
  try {
    const validation = schemaCustomers.validate({ name, phone, cpf, birthday });
    if (validation.error) return res.sendStatus(400);

    const alreadyExists = await db.query(
      `SELECT * FROM customers WHERE cpf = $1;`,
      [cpf]
    );
    if (alreadyExists.rowCount > 0) return res.sendStatus(409);

    await db.query(
      `INSERT INTO customers (name, phone,cpf,birthday) VALUES ($1, $2, $3, $4);`,
      [name, phone, cpf, birthday]
    );
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function getCustomers(req, res) {
  try {
    const customers = await db.query(`SELECT * FROM customers;`);
    const formattedCustomers = customers.rows.map((customer) => {
      const formattedBirthday = dayjs(customer.birthday).format("YYYY-MM-DD");
      return {
        ...customer,
        birthday: formattedBirthday,
      };
    });
    res.send(formattedCustomers);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function getCustomersById(req, res) {
  const { id } = req.params;
  try {
    const customer = await db.query(`SELECT * FROM customers WHERE id = $1;`, [
      id,
    ]);
    if (customer.rowCount === 0) return res.sendStatus(404);

    res.send(customer.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function updateCustomer(req, res) {
  const { id } = req.params;
  const { name, phone, cpf, birthday } = req.body;
  try {
    const customer = await db.query(`SELECT * FROM customers WHERE id = $1;`, [
      id,
    ]);
    if (customer.rowCount === 0) return res.sendStatus(404);
    const validation = schemaCustomers.validate({ name, phone, cpf, birthday });
    if (validation.error) return res.sendStatus(400);
    const alreadyExists = await db.query(
      `SELECT * FROM customers WHERE cpf = $1 AND id <> $2;`,
      [cpf, id]
    );
    if (alreadyExists.rowCount > 0) return res.sendStatus(409);

    await db.query(
      `UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5;`,
      [name, phone, cpf, birthday, id]
    );
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
}
