import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { iniciarBancoDeDados } from './database'; // 1. CORRIGIDO: Importando a função para obter a conexão

interface Cobranca {
  id?: number;
  nome_cliente: string;
  telefone: string;
  valor_parcela: number;
  data_pagamento: string;
  status: string;
}

export const exportarBackup = async () => {
  try {
    const db = await iniciarBancoDeDados();
    if (!db) throw new Error("Banco de dados não inicializado");

    const resultado = await db.query("SELECT * FROM cobrancas;");
    const dadosJson = JSON.stringify(resultado.values);

    const nomeArquivo = `backup_cobrancas_${Date.now()}.json`;
    await Filesystem.writeFile({
      path: nomeArquivo,
      data: dadosJson,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });

    alert(`Backup salvo com sucesso na pasta Documentos como: ${nomeArquivo}`);
  } catch (error: unknown) { // 2. CORRIGIDO: Tipado como 'unknown' (padrão do TS moderno)
    const mensagemErro = error instanceof Error ? error.message : String(error);
    console.error("Erro ao salvar backup:", mensagemErro);
  }
};

export const importarBackupPeloConteudo = async (textoJson: string) => {
  try {
    const db = await iniciarBancoDeDados();
    if (!db) throw new Error("Banco de dados não inicializado");

    const listaCobrancas = JSON.parse(textoJson) as Cobranca[];

    if (!Array.isArray(listaCobrancas)) {
      throw new Error("O arquivo de backup não contém uma lista válida.");
    }

    await db.execute("DELETE FROM cobrancas;");

    for (const cobranca of listaCobrancas) {
      await db.run(
        `INSERT INTO cobrancas (id, nome_cliente, telefone, valor_parcela, data_pagamento, status) VALUES (?, ?, ?, ?, ?, ?);`,
        [cobranca.id, cobranca.nome_cliente, cobranca.telefone, cobranca.valor_parcela, cobranca.data_pagamento, cobranca.status]
      );
    }
    alert("Backup restaurado com sucesso!");
  } catch (error: unknown) {
    const mensagemErro = error instanceof Error ? error.message : String(error);
    alert("Falha ao ler o arquivo de backup: " + mensagemErro);
  }
};