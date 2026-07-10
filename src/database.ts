import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

const sqlite = new SQLiteConnection(CapacitorSQLite);
let db: SQLiteDBConnection | null = null;

export interface CobrancaEstrutura {
  id: number;
  nome_cliente: string;
  telefone: string;
  valor_parcela: number;
  data_pagamento: string;
  status: string;
}

export const iniciarBancoDeDados = async (): Promise<SQLiteDBConnection | null> => {
  try {
    if (db) {
      return db;
    }

    db = await sqlite.createConnection('cobrancas_db', false, 'no-encryption', 1, false);
    await db.open();

    const queryCriarTabela = `
      CREATE TABLE IF NOT EXISTS cobrancas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_cliente TEXT NOT NULL,
        telefone TEXT NOT NULL,
        valor_parcela REAL NOT NULL,
        data_pagamento TEXT NOT NULL, -- Salvar no formato YYYY-MM-DD
        status TEXT DEFAULT 'Pendente' -- Valores: 'Pendente' ou 'Pago'
      );
    `;
    await db.execute(queryCriarTabela);
    console.log('Banco de dados e tabela inicializados com sucesso!');
    
    return db;
  } catch (err) {
    console.error('Erro ao inicializar o banco de dados:', err);
    return null;
  }
};

export const salvarCobranca = async (nome: string, telefone: string, valor: number, data: string): Promise<void> => {
  const database = await iniciarBancoDeDados();
  if (!database) throw new Error("Não foi possível conectar ao banco de dados.");

  const sql = `INSERT INTO cobrancas (nome_cliente, telefone, valor_parcela, data_pagamento) VALUES (?, ?, ?, ?);`;
  await database.run(sql, [nome, telefone, valor, data]);
};

export const buscarTodosEmAberto = async (): Promise<CobrancaEstrutura[]> => {
  const database = await iniciarBancoDeDados();
  if (!database) throw new Error("Não foi possível conectar ao banco de dados.");

  const sql = `SELECT * FROM cobrancas WHERE status = 'Pendente' ORDER BY data_pagamento ASC;`;
  const resultado = await database.query(sql);
  
  return (resultado.values as CobrancaEstrutura[]) || [];
};

export const atualizarStatusCobranca = async (id: number, novoStatus: 'Pendente' | 'Pago'): Promise<void> => {
  const database = await iniciarBancoDeDados();
  if (!database) throw new Error("Não foi possível conectar ao banco de dados.");

  const sql = `UPDATE cobrancas SET status = ? WHERE id = ?;`;
  await database.run(sql, [novoStatus, id]);
};

export const atualizarDataCobranca = async (id: number, novaData: string): Promise<void> => {
  const database = await iniciarBancoDeDados();
  if (!database) throw new Error("Não foi possível conectar ao banco de dados.");

  const sql = `UPDATE cobrancas SET data_pagamento = ? WHERE id = ?;`;
  await database.run(sql, [novaData, id]);
};