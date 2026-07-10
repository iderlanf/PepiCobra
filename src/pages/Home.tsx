import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonItem, IonInput, IonButton, IonList, IonCard
} from '@ionic/react'; 
import { Contacts } from '@capacitor-community/contacts';
import { AppLauncher } from '@capacitor/app-launcher';
import { iniciarBancoDeDados, salvarCobranca, buscarTodosEmAberto, atualizarStatusCobranca, atualizarDataCobranca, CobrancaEstrutura } from '../database';
import { exportarBackup, importarBackupPeloConteudo } from '../backup';

import logoImg from '../assets/logo.png';

const Home: React.FC = () => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [valor, setValor] = useState<number>(0);
  const [dataPagamento, setDataPagamento] = useState('');
  const [emAberto, setEmAberto] = useState<CobrancaEstrutura[]>([]);

  const carregarDadosEmAberto = useCallback(async () => {
    const lista = await buscarTodosEmAberto();
    setEmAberto(lista);
  }, []);

  const inicializar = useCallback(async () => {
    await iniciarBancoDeDados();
    await carregarDadosEmAberto();
  }, [carregarDadosEmAberto]);

  useEffect(() => {
    inicializar();
  }, [inicializar]);

  const puxarContatoAgenda = async () => {
    try {
      const permissao = await Contacts.requestPermissions();
      if (permissao.contacts === 'granted') {
        const resultado = await Contacts.pickContact({
          projection: { name: true, phones: true }
        });
        if (resultado && resultado.contact) {
          const contatoSelecionado = resultado.contact;
          const nomeCompleto = `${contatoSelecionado.name?.given ?? ''} ${contatoSelecionado.name?.family ?? ''}`.trim() || 
                               contatoSelecionado.name?.display || 'Contato Sem Nome';
          setNome(nomeCompleto);

          let numeroRaw = '';
          if (contatoSelecionado.phones && contatoSelecionado.phones.length > 0) {
            numeroRaw = contatoSelecionado.phones[0].number || '';
          }
          const apenasNumeros = numeroRaw.replace(/\D/g, '');
          if (!apenasNumeros) {
            alert('Este contato selecionado não possui nenhum número de telefone salvo.');
            return;
          }
          setTelefone(apenasNumeros.length <= 11 ? '55' + apenasNumeros : apenasNumeros);
        }
      } else {
        alert('Permissão de contatos negada.');
      }
    } catch (error) {
      console.error('Erro ao escolher contato:', error);
    }
  };

  const cadastrar = async () => {
    if (!nome || !telefone || !valor || !dataPagamento) return alert('Por favor, preencha todos os campos.');
    await salvarCobranca(nome, telefone, valor, dataPagamento);
    alert('Cobrança cadastrada com sucesso!');
    setNome(''); setTelefone(''); setValor(0); setDataPagamento('');
    await carregarDadosEmAberto();
  };

  const confirmarPago = async (id: number) => {
    await atualizarStatusCobranca(id, 'Pago');
    alert('Status atualizado para Pago!');
    await carregarDadosEmAberto();
  };

  const editarDataVencimento = async (id: number, novaData: string) => {
    if (!novaData) return;
    try {
      await atualizarDataCobranca(id, novaData);
      alert('Vencimento alterado com sucesso!');
      await carregarDadosEmAberto();
    } catch {
      alert('Erro ao alterar a data.');
    }
  };

  const enviarWhatsApp = async (cliente: CobrancaEstrutura) => {
    const valorBr = cliente.valor_parcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const [ano, mes, dia] = cliente.data_pagamento.split('-');
    
const msg = `Olá, *${cliente.nome_cliente}*! Passando para lembrar que a sua parcela no valor de *${valorBr}* venceu em ${dia}/${mes}/${ano}.\n\nPara sua comodidade, você pode efetuar o pagamento via PIX:\n\n**Chave CNPJ:* 26341659000103\n**Favorecida:* PERPÉTUO SOCORRO\n\nCaso já tenha efetuado o pagamento, por favor desconsidere esta mensagem. Obrigada!`;    
    let telefoneFinal = cliente.telefone.replace(/\D/g, '');
    
    if (telefoneFinal.length === 13 || telefoneFinal.length === 14) {
      telefoneFinal = '55' + telefoneFinal;
    }

    const urlWhatsApp = `whatsapp://send?phone=${telefoneFinal}&text=${encodeURIComponent(msg)}`;
    try {
      await AppLauncher.openUrl({ url: urlWhatsApp });
    } catch { 
      window.open(`https://wa.me{telefoneFinal}?text=${encodeURIComponent(msg)}`, '_system');
    }
  };



  const restaurarBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = async (evento) => {
      if (evento.target?.result) {
        await importarBackupPeloConteudo(evento.target.result as string);
        await carregarDadosEmAberto();
      }
    };
    leitor.readAsText(arquivo);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Pepi Store - Cobranças</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        
        {/* Logo Centralizada */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0' }}>
          <img 
            src={logoImg} 
            alt="Logo Pepi Store" 
            style={{ width: '120px', height: '120px', borderRadius: '15px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }} 
          />
        </div>

        {/* Formulário de Cadastro */}
        <h3 style={{ color: 'var(--ion-color-primary)', fontWeight: 'bold' }}>Nova Cobrança</h3>
        <IonButton expand="block" color="secondary" onClick={puxarContatoAgenda}>Buscar na Agenda</IonButton>
        
        <IonItem><IonInput label="Nome" value={nome} readonly={true} /></IonItem>
        
        <IonItem>
          <IonInput 
            label="Telefone" 
            value={telefone} 
            onIonInput={(e: CustomEvent) => setTelefone((e.target as HTMLInputElement).value ?? '')} 
          />
        </IonItem>
        
        <IonItem>
          <IonInput 
            label="Valor" 
            type="number" 
            value={valor} 
            onIonInput={(e: CustomEvent) => setValor(parseFloat((e.target as HTMLInputElement).value ?? '0') || 0)} 
          />
        </IonItem>
        
        <IonItem>
          <IonInput 
            label="Vencimento" 
            type="date" 
            value={dataPagamento} 
            onIonChange={(e: CustomEvent) => setDataPagamento((e.target as HTMLInputElement).value ?? '')} 
          />
        </IonItem>
        
        <IonButton expand="block" color="primary" onClick={cadastrar}>Salvar Cobrança</IonButton>

        {/* Sistema de Backup */}
        <h3 style={{ color: 'var(--ion-color-primary)', fontWeight: 'bold' }}>Sistema de Backup</h3>
        <IonButton expand="block" color="success" onClick={exportarBackup}>Salvar Backup</IonButton>
        <input type="file" accept=".json" onChange={restaurarBackup} style={{ marginTop: '10px', width: '100%' }} />

        {/* Lista de Vencimentos */}
        <h3 style={{ color: 'var(--ion-color-primary)', fontWeight: 'bold' }}>Vencimentos em Aberto ({emAberto.length})</h3>
        <IonList>
          {emAberto.map(c => {
            const [ano, mes, dia] = c.data_pagamento.split('-');
            const dataExibicao = `${dia}/${mes}/${ano}`;

            return (
              <IonCard key={c.id} className="ion-padding" style={{ margin: '12px 0', borderLeft: '5px solid var(--ion-color-secondary)' }}>
                <h4 style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: 'var(--ion-color-primary)' }}>{c.nome_cliente}</h4>
                <p style={{ margin: '2px 0' }}>Valor: <strong>R$ {c.valor_parcela.toFixed(2).replace('.', ',')}</strong></p>
                <p style={{ margin: '2px 0', color: 'var(--ion-color-danger)' }}>Vencimento Atual: {dataExibicao}</p>
                
                <IonItem style={{ '--padding-start': '0px', marginTop: '5px' }}>
                  <IonInput 
                    label="Alterar data se adiar:" 
                    type="date" 
                    value={c.data_pagamento}
                    onIonChange={(e: CustomEvent) => editarDataVencimento(c.id, (e.target as HTMLInputElement).value ?? '')}
                  />
                </IonItem>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <IonButton size="small" color="success" onClick={() => confirmarPago(c.id)}>
                    Pago
                  </IonButton>
                  <IonButton size="small" color="secondary" onClick={() => enviarWhatsApp(c)}>
                    Enviar WhatsApp
                  </IonButton>
                </div>
              </IonCard>
            );
          })}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home;