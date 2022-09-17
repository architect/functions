import arc from "../";

interface NoteTable {
  pk: string;
  title: string;
}

interface UserTable {
  pk: string;
  email: string;
}

interface MyTables {
  note: NoteTable;
  user: UserTable;
}

async function itIsPermissiveByDefault() {
  const db = await arc.tables();

  // Table names not checked if you don't provide a type
  // $ExpectType ArcTable<any>
  db.blah;

  // You can pass anything, just not *nothing*
  // $ExpectError
  db.blah.get();

  // $ExpectType any
  await db.blah.get({ garbage: "trash" });

  // $ExpectType string
  db.name('note');

  // $ExpectType { [x: string]: string; }
  db.reflect();

  // $ExpectType DynamoDB
  db._db;

  // $ExpectType DocumentClient
  db._doc;
}

async function itEnforcesTableNames() {
  const db = await arc.tables<MyTables>();

  // $ExpectError
  db.blah;
  // $ExpectType ArcTable<NoteTable>
  db.note;
  // $ExpectType ArcTable<UserTable>
  db.user;

  // $ExpectError
  db.name("wrong");
  // $ExpectType string
  db.name("note");

  // $ExpectError
  db.reflect().wrong;
  // $ExpectType string
  db.reflect().note;
}

async function itHasTypesForAllMethods() {
  const db = await arc.tables<MyTables>();

  // $ExpectError
  await db.note.delete({ garbage: "trash" });
  // $ExpectType {}
  await db.note.delete({ pk: "yay" });

  // $ExpectError
  await db.note.get({ garbage: "trash" });
  // $ExpectType NoteTable | undefined
  await db.note.get({ pk: "yay" });

  // $ExpectError
  await db.note.put({ garbage: "trash" });
  // $ExpectError
  await db.note.put({ pk: "yay" });
  // $ExpectType NoteTable
  await db.note.put({ pk: "yay", title: "finally" });

  // $ExpectError
  await db.note.query({ garbage: "trash" });
  // $ExpectType NoteTable[]
  (await db.note.query({})).Items;

  // $ExpectError
  await db.note.scan({ garbage: "trash" });
  // $ExpectType NoteTable[]
  (await db.note.scan({})).Items;

  // $ExpectError
  await db.note.update({ garbage: "trash" });
  // $ExpectError
  await db.note.update({ Key: { garbage: "trash" } });
  await db.note.update({ Key: { pk: "yay" } });
}
