import { 
  Spirit,
} from 'sr2020-mm-event-engine';
import * as R from 'ramda';

import { pool } from "../pgPool";
import { 
  validateGenericRow, 
  validateGenericRows, 
} from "./validation";

export const getSpirits = async function(): Promise<unknown[]> {
  const { rows } = await pool.query('SELECT * FROM spirit');
  // console.log('raw spirits', JSON.stringify(rows));
  if(!validateGenericRows(rows)) {
    throw new Error(`Generic row check got validation error. ${JSON.stringify(validateGenericRows.errors)}`);
  }
  return rows.map(row => ({
    ...row.data,
    id: row.id,
  }));
}

export const postSpirit = async function(entity: Omit<Spirit, "id">): Promise<Spirit> {
  const { rows } = await pool.query('INSERT INTO spirit(data) VALUES($1) RETURNING id', [entity]);
  return {
    ...entity,
    id: rows[0].id
  };
}

export const putSpirit = async function(entity: Spirit): Promise<Spirit> {
  console.log("put", entity.id);
  // await pool.query('UPDATE spirit SET data = $1 WHERE id = $2', [R.omit(['id'], entity), entity.id]);
  const { queryText, values } = generatePutQuery([entity]);
  await pool.query(queryText, values);
  return entity;
}

function generatePutQuery(spirits: Spirit[]): {
  queryText: string,
  values: unknown[]
} {

  const valueSubstitutions = spirits.map((spirit, index) => {
    return `($${index * 2 + 1}::integer, $${index * 2 + 2}::jsonb)`
  }).join(', ')

  const values = spirits.reduce((acc: unknown[], spirit: Spirit) => {
    acc.push(spirit.id, R.omit(['id'], spirit));
    return acc;
  }, []);
  
  // Query example
  // UPDATE spirit
  // SET data = putSpirit.data
  // FROM (values
  //   (120, '{"name": "sdfs-1","state": {"status": "NotInGame"},"story": "","fraction": 1,"abilities": [],"timetable": [],"maxHitPoints": 10}'::jsonb),
  //   (121, '{"name": "sdfs-2","state": {"status": "NotInGame"},"story": "","fraction": 1,"abilities": [],"timetable": [],"maxHitPoints": 10}'::jsonb)  
  // ) AS putSpirit(id, data)
  // WHERE spirit.id = putSpirit.id;

  const queryText = `
    UPDATE spirit
    SET data = putSpirit.data
    FROM (values
      ${valueSubstitutions}
    ) AS putSpirit(id, data)
    WHERE spirit.id = putSpirit.id;`.split('\n').join(' ');

  // console.log(values);
  // console.log(queryText);

  return {
    queryText,
    values
  };
}

export const putMultipleSpirits = async function(entities: Spirit[]): Promise<Spirit[]> {
  console.log("put multiple", R.pluck('id', entities));
  const { queryText, values } = generatePutQuery(entities);
  await pool.query(queryText, values);
  return entities;
}

export const deleteSpirit = async function(id: number): Promise<unknown | null> {
  console.log("delete", id);
  const { rows } = await pool.query('DELETE FROM spirit WHERE id = $1 RETURNING id, data', [id]);
  const row: unknown | null = rows[0] ? rows[0] : null;
  if(row === null) {
    return row;
  }
  if (!validateGenericRow(row)) {
    throw new Error(`Generic row check got validation error. ${JSON.stringify(validateGenericRow.errors)}`);
  }
  return {
    ...row.data,
    id: row.id,
  };
}