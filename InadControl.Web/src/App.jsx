import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Users,
  LayoutDashboard,
  WalletCards,
  Settings,
  Edit2,
  Trash2,
  Filter,
  ArrowDown,
  ArrowUp,
  X,
  Loader2,
  AlertTriangle,
  TrendingUp,
  FileText,
  CheckCircle
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5278/api';

// COMPONENTE: Menu Lateral
const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'clientes', icon: Users, label: 'Clientes' },
    { id: 'cobrancas', icon: WalletCards, label: 'Cobranças' },
    { id: 'configuracoes', icon: Settings, label: 'Configurações' }
  ];

  return (
    <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col hidden md:flex shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <div className="flex items-center gap-2 text-xl font-bold text-white">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <span className="text-white">IC</span>
          </div>
          <span>Inad<span className="text-purple-500">Control</span></span>
        </div>
      </div>
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${isActive
                ? 'bg-purple-600/10 text-purple-400 font-medium border border-purple-500/20'
                : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

// COMPONENTE TELA: Dashboard
const DashboardPage = ({ clients }) => {
  const totalClientes = clients.length;
  const clientesRiscoAlto = clients.filter(c => c.classificacaoRisco === 'Alto').length;

  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Total de Clientes</h3>
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Users size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-white">{totalClientes}</p>
          <p className="text-sm text-emerald-400 flex items-center gap-1 mt-2">
            <TrendingUp size={16} /> Atualizado
          </p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Clientes em Risco Alto</h3>
            <div className="p-2 bg-red-500/20 rounded-lg text-red-400"><AlertTriangle size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-white">{clientesRiscoAlto}</p>
          <p className="text-sm text-gray-400 mt-2">Requerem atenção</p>
        </div>
      </div>
    </div>
  );
};

// COMPONENTE TELA: Cobranças (TOTALMENTE INTEGRADO À API)
const CobrancasPage = ({ clients, triggerUpdate }) => {
  const [faturas, setFaturas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [localError, setLocalError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [sortOrder, setSortOrder] = useState('Mais Recente');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    clienteId: '',
    tipoDocumento: '',
    numeroDocumento: '',
    valor: '',
    vencimento: '',
    status: 'Pendente',
    observacao: ''
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [faturaToDelete, setFaturaToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. GET: Buscar Cobranças
  const fetchFaturas = useCallback(async () => {
    try {
      await Promise.resolve();
      setIsLoading(true);
      setLocalError(null);
      const response = await fetch(`${API_BASE_URL}/Cobrancas`);
      if (!response.ok) throw new Error('Falha ao carregar as cobranças.');
      const data = await response.json();
      setFaturas(data);
    } catch (err) {
      console.error(err);
      setLocalError("Não foi possível carregar as cobranças da API.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    fetchFaturas();
  }, [fetchFaturas]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paga': return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs">Paga</span>;
      case 'Pendente': return <span className="px-2.5 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full text-xs">Pendente</span>;
      case 'Atrasada': return <span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs">Atrasada</span>;
      default: return <span className="px-2.5 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-full text-xs">{status}</span>;
    }
  };

  // --- FILTROS E ORDENAÇÃO ---
  const processedFaturas = faturas.filter(fatura => {
    const clienteMatches = fatura.clienteNome?.toLowerCase().includes(searchTerm.toLowerCase());
    const docMatches = fatura.numeroDocumento?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = clienteMatches || docMatches; // Removemos a busca por ID
    const matchesStatus = statusFilter === 'Todos' || fatura.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const dateA = new Date(a.dataVencimento).getTime();
    const dateB = new Date(b.dataVencimento).getTime();
    return sortOrder === 'Mais Recente' ? dateB - dateA : dateA - dateB;
  });

  const handleNovaCobranca = () => {
    setFormData({
      id: null,
      clienteId: clients.length > 0 ? clients[0].id : '',
      tipoDocumento: '',
      numeroDocumento: '',
      valor: '',
      vencimento: '',
      status: 'Pendente',
      observacao: ''
    });
    setLocalError(null);
    setIsModalOpen(true);
  };

  const handleEditCobranca = (fatura) => {
    setFormData({
      id: fatura.id,
      clienteId: fatura.clienteId || (clients.length > 0 ? clients[0].id : ''),
      tipoDocumento: fatura.tipoDocumento || '',
      numeroDocumento: fatura.numeroDocumento || '',
      valor: fatura.valor,
      vencimento: fatura.dataVencimento.split('T')[0],
      status: fatura.status,
      observacao: fatura.observacao || ''
    });
    setLocalError(null);
    setIsModalOpen(true);
  };

  // BOTÃO RÁPIDO: Marcar como pago
  const handleMarcarComoPago = async (fatura) => {
    try {
      setLocalError(null);
      const payload = {
        id: fatura.id,
        clienteId: fatura.clienteId,
        tipoDocumento: fatura.tipoDocumento,
        numeroDocumento: fatura.numeroDocumento,
        valor: fatura.valor,
        dataVencimento: fatura.dataVencimento,
        status: 'Paga',
        observacao: fatura.observacao
      };

      const response = await fetch(`${API_BASE_URL}/Cobrancas/${fatura.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Falha ao atualizar o status para Pago');

      fetchFaturas();
      if (triggerUpdate) triggerUpdate();
    } catch (err) {
      console.error(err);
      setLocalError("Erro ao marcar cobrança como paga.");
    }
  };

  // 2. POST e PUT: Salvar Fatura
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);

    const isEditing = formData.id !== null;
    const url = isEditing ? `${API_BASE_URL}/Cobrancas/${formData.id}` : `${API_BASE_URL}/Cobrancas`;
    const method = isEditing ? 'PUT' : 'POST';

    const payload = {
      clienteId: parseInt(formData.clienteId),
      tipoDocumento: formData.tipoDocumento || null,
      numeroDocumento: formData.numeroDocumento || null,
      valor: parseFloat(formData.valor),
      dataVencimento: new Date(formData.vencimento).toISOString(),
      status: formData.status,
      observacao: formData.observacao || null
    };

    if (isEditing) {
      payload.id = formData.id;
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Falha ao ${isEditing ? 'editar' : 'gerar'} a fatura`);

      setIsModalOpen(false);
      fetchFaturas();
      if (triggerUpdate) triggerUpdate();
    } catch (err) {
      console.error(err);
      setLocalError(`Erro ao ${isEditing ? 'editar' : 'cadastrar'} cobrança. Verifique a API.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (fatura) => {
    setFaturaToDelete(fatura);
    setIsDeleteModalOpen(true);
  };

  // 3. DELETE
  const confirmDelete = async () => {
    setIsDeleting(true);
    setLocalError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/Cobrancas/${faturaToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Falha ao excluir');

      setIsDeleteModalOpen(false);
      setFaturaToDelete(null);
      fetchFaturas();
      if (triggerUpdate) triggerUpdate();
    } catch (err) {
      console.error(err);
      setLocalError("Erro ao excluir a cobrança.");
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-8 relative">
      {localError && (
        <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3"><AlertTriangle size={20} /><p>{localError}</p></div>
          <button onClick={() => setLocalError(null)}><X size={18} /></button>
        </div>
      )}

      {/* BARRA DE FERRAMENTAS (SEARCH E FILTROS) */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto flex-1">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={18} className="text-gray-500" /></div>
            <input type="text" placeholder="Buscar por cliente ou Nº do doc..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="relative w-full sm:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Filter size={18} className="text-gray-500" /></div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg pl-10 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer">
              <option value="Todos">Todos os Status</option>
              <option value="Pendente">Pendente</option>
              <option value="Paga">Paga</option>
              <option value="Atrasada">Atrasada</option>
            </select>
          </div>
          <button onClick={() => setSortOrder(sortOrder === 'Mais Recente' ? 'Mais Antiga' : 'Mais Recente')} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-100 rounded-lg transition-colors whitespace-nowrap">
            {sortOrder === 'Mais Recente' ? <ArrowDown size={18} /> : <ArrowUp size={18} />}
            <span className="hidden sm:inline">{sortOrder}</span>
          </button>
        </div>
        <button onClick={handleNovaCobranca} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-purple-600/20 shrink-0">
          <Plus size={20} /> Nova Cobrança
        </button>
      </div>

      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden min-h-[400px] flex flex-col relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-gray-900/50 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader2 size={40} className="text-purple-500 animate-spin mb-4" />
            <p className="text-gray-400 font-medium">A carregar faturas...</p>
          </div>
        )}
        {!isLoading && (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800/80 border-b border-gray-700 text-sm font-medium text-gray-400">
                  <th className="py-4 px-6 font-medium">Tipo</th>
                  <th className="py-4 px-6 font-medium">Cliente</th>
                  <th className="py-4 px-6 font-medium">Nº Doc</th>
                  <th className="py-4 px-6 font-medium">Valor</th>
                  <th className="py-4 px-6 font-medium">Vencimento</th>
                  <th className="py-4 px-6 font-medium">Status</th>
                  <th className="py-4 px-6 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {processedFaturas.length > 0 ? processedFaturas.map((fatura) => (
                  <tr key={fatura.id} className="hover:bg-gray-800/80 group transition-colors">
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md text-xs font-medium">
                        {fatura.tipoDocumento || 'Sem doc.'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-200">{fatura.clienteNome}</span>
                        {fatura.observacao && (
                          <div className="flex items-start gap-1 mt-1 text-gray-500">
                            <FileText size={12} className="mt-0.5 shrink-0" />
                            <span className="text-xs line-clamp-2" title={fatura.observacao}>{fatura.observacao}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-300">{fatura.numeroDocumento || '-'}</td>
                    <td className="py-4 px-6 text-sm text-emerald-400 font-medium">R$ {Number(fatura.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="py-4 px-6 text-sm text-gray-400">{new Date(fatura.dataVencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                    <td className="py-4 px-6">{getStatusBadge(fatura.status)}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                        {/* BOTÃO RÁPIDO: Marcar como pago */}
                        {fatura.status !== 'Paga' && (
                          <button
                            onClick={() => handleMarcarComoPago(fatura)}
                            className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded-lg transition-colors"
                            title="Marcar como Paga"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}

                        <button onClick={() => handleEditCobranca(fatura)} className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors" title="Editar"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteClick(fatura)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Excluir"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="7" className="py-12 text-center text-gray-500">Nenhuma fatura corresponde aos filtros.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="bg-gray-800/50 border-t border-gray-700/50 px-6 py-4 flex items-center justify-between text-sm text-gray-400 mt-auto">
          <span>Mostrando {processedFaturas.length} faturas</span>
        </div>
      </div>

      {/* Modal Nova/Editar Cobrança */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">{formData.id ? 'Editar Cobrança' : 'Nova Cobrança'}</h2>
              <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="p-6 space-y-4">

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Cliente <span className="text-red-400">*</span></label>
                  <select required value={formData.clienteId} onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })} className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none">
                    <option value="" disabled>Selecione um cliente...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300">Tipo de Documento</label>
                    <select value={formData.tipoDocumento} onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value, numeroDocumento: e.target.value === '' ? '' : formData.numeroDocumento })} className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none">
                      <option value="">Sem Documento</option>
                      <option value="Fatura">Fatura</option>
                      <option value="Nota de Serviço">Nota de Serviço</option>
                      <option value="Nota Fiscal">Nota Fiscal</option>
                      <option value="DACTE">DACTE</option>
                      <option value="Recibo">Recibo</option>
                      <option value="Boleto">Boleto</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300">Número do Documento</label>
                    <input
                      type="text"
                      value={formData.numeroDocumento}
                      onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
                      disabled={!formData.tipoDocumento}
                      placeholder={!formData.tipoDocumento ? "Selecione o tipo 1º" : "Ex: 12345"}
                      className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300">Valor (R$) <span className="text-red-400">*</span></label>
                    <input type="number" step="0.01" required value={formData.valor} onChange={(e) => setFormData({ ...formData, valor: e.target.value })} placeholder="0.00" className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300">Vencimento <span className="text-red-400">*</span></label>
                    <input type="date" required value={formData.vencimento} onChange={(e) => setFormData({ ...formData, vencimento: e.target.value })} className="w-full bg-gray-950 border border-gray-800 text-gray-400 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 [color-scheme:dark]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none">
                    <option value="Pendente">Pendente</option>
                    <option value="Paga">Paga</option>
                    <option value="Atrasada">Atrasada</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Observações (Opcional)</label>
                  <textarea value={formData.observacao} onChange={(e) => setFormData({ ...formData, observacao: e.target.value })} placeholder="Notas adicionais..." rows={2} className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2">
                  {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> A Guardar...</> : (formData.id ? 'Salvar Alterações' : 'Gerar Fatura')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Excluir */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-red-500/20 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} className="text-red-500" /></div>
            <h2 className="text-xl font-semibold text-white mb-2">Excluir Fatura?</h2>
            <p className="text-gray-400 mb-8 text-sm">Certeza que deseja excluir a fatura?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg">Cancelar</button>
              <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg flex justify-center items-center gap-2">
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// COMPONENTE TELA: Gestão de Clientes (CRUD Completo)
const ClientesPage = ({ clients, isLoading, triggerUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('Todos');
  const [sortOrder, setSortOrder] = useState('A-Z');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [formData, setFormData] = useState({ id: null, nome: '', email: '', documento: '', telefone: '' });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const processedClients = clients.filter(client => {
    const nomeMatches = client.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    const docMatches = client.documento?.includes(searchTerm);
    const emailMatches = client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nomeMatches || docMatches || emailMatches;
    const matchesRisk = riskFilter === 'Todos' || client.classificacaoRisco === riskFilter;
    return matchesSearch && matchesRisk;
  }).sort((a, b) => {
    const nomeA = a.nome || '';
    const nomeB = b.nome || '';
    return sortOrder === 'A-Z' ? nomeA.localeCompare(nomeB) : nomeB.localeCompare(nomeA);
  });

  const getRiskBadgeColor = (risk) => {
    switch (risk) {
      case 'Baixo': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Médio': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Alto': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const handleNewClient = () => {
    setFormData({ id: null, nome: '', email: '', documento: '', telefone: '' });
    setLocalError(null);
    setIsModalOpen(true);
  };

  const handleEditClient = (client) => {
    setFormData({
      id: client.id,
      nome: client.nome || '',
      email: client.email || '',
      documento: client.documento || '',
      telefone: client.telefone || ''
    });
    setLocalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);

    const isEditing = formData.id !== null;
    const url = isEditing ? `${API_BASE_URL}/Clientes/${formData.id}` : `${API_BASE_URL}/Clientes`;
    const method = isEditing ? 'PUT' : 'POST';

    const payload = { ...formData };
    if (!isEditing) delete payload.id;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Falha ao salvar o cliente');
      setIsModalOpen(false);
      triggerUpdate();
    } catch (err) {
      console.error(err);
      setLocalError(`Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} o cliente. Verifique a API.`);
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (client) => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    setLocalError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/Clientes/${clientToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Falha ao excluir o cliente');
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
      triggerUpdate();
    } catch (err) {
      console.error(err);
      setLocalError("Erro ao excluir o cliente. Ele pode estar vinculado a alguma cobrança.");
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-8">
      {localError && (
        <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3"><AlertTriangle size={20} /><p>{localError}</p></div>
          <button onClick={() => setLocalError(null)}><X size={18} /></button>
        </div>
      )}

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto flex-1">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={18} className="text-gray-500" /></div>
            <input type="text" placeholder="Buscar por nome, documento..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="relative w-full sm:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Filter size={18} className="text-gray-500" /></div>
            <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg pl-10 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer">
              <option value="Todos">Todos os Riscos</option>
              <option value="Baixo">Risco Baixo</option>
              <option value="Médio">Risco Médio</option>
              <option value="Alto">Risco Alto</option>
            </select>
          </div>
          <button onClick={() => setSortOrder(sortOrder === 'A-Z' ? 'Z-A' : 'A-Z')} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-100 rounded-lg transition-colors">
            {sortOrder === 'A-Z' ? <ArrowDown size={18} /> : <ArrowUp size={18} />}
            <span className="hidden sm:inline">{sortOrder === 'A-Z' ? 'A - Z' : 'Z - A'}</span>
          </button>
        </div>
        <button onClick={handleNewClient} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-purple-600/20 shrink-0">
          <Plus size={20} /> Novo Cliente
        </button>
      </div>

      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden shadow-sm relative min-h-[400px] flex flex-col">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-gray-900/50 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader2 size={40} className="text-purple-500 animate-spin mb-4" />
            <p className="text-gray-400 font-medium">A carregar...</p>
          </div>
        )}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800/80 border-b border-gray-700 text-sm font-medium text-gray-400">
                <th className="py-4 px-6 font-medium">ID</th>
                <th className="py-4 px-6 font-medium">Cliente</th>
                <th className="py-4 px-6 font-medium">Documento</th>
                <th className="py-4 px-6 font-medium">Telefone</th>
                <th className="py-4 px-6 font-medium">Classificação de Risco</th>
                <th className="py-4 px-6 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {!isLoading && processedClients.length > 0 ? (
                processedClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-800/80 transition-colors group">
                    <td className="py-4 px-6 text-sm text-gray-500">#{client.id?.toString().padStart(3, '0') || 'N/A'}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col"><span className="font-medium text-gray-200">{client.nome}</span><span className="text-sm text-gray-500">{client.email}</span></div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-300">{client.documento || '-'}</td>
                    <td className="py-4 px-6 text-sm text-gray-300">{client.telefone || '-'}</td>
                    <td className="py-4 px-6">
                      {client.classificacaoRisco ? <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getRiskBadgeColor(client.classificacaoRisco)}`}>{client.classificacaoRisco}</span> : <span className="text-gray-500 text-sm">-</span>}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditClient(client)} className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteClick(client)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (!isLoading && (
                <tr><td colSpan="6" className="py-12 text-center text-gray-500">Nenhum cliente encontrado.</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-800/50 border-t border-gray-700/50 px-6 py-4 flex items-center justify-between text-sm text-gray-400 mt-auto">
          <span>Mostrando {processedClients.length} clientes</span>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">{formData.id ? 'Editar Cliente' : 'Novo Cliente'}</h2>
              <button onClick={() => !isSubmitting && setIsModalOpen(false)} disabled={isSubmitting} className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="p-6 space-y-4">
                <div className="space-y-1.5"><label className="text-sm font-medium text-gray-300">Nome Completo <span className="text-red-400">*</span></label><input type="text" required name="nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} disabled={isSubmitting} className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                <div className="space-y-1.5"><label className="text-sm font-medium text-gray-300">Email <span className="text-red-400">*</span></label><input type="email" required name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={isSubmitting} className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                <div className="space-y-1.5"><label className="text-sm font-medium text-gray-300">Documento (Opcional)</label><input type="text" name="documento" value={formData.documento} onChange={(e) => setFormData({ ...formData, documento: e.target.value })} disabled={isSubmitting} className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                <div className="space-y-1.5"><label className="text-sm font-medium text-gray-300">Telefone (Opcional)</label><input type="text" name="telefone" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} disabled={isSubmitting} className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
              </div>
              <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-70">{isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Salvando</> : 'Salvar Cliente'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-red-500/20 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} className="text-red-500" /></div>
            <h2 className="text-xl font-semibold text-white mb-2">Excluir Cliente?</h2>
            <p className="text-gray-400 mb-8 text-sm">Certeza que deseja excluir <span className="text-white font-medium">{clientToDelete?.nome}</span>?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg">Cancelar</button>
              <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 flex justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">{isDeleting ? <Loader2 size={16} className="animate-spin" /> : 'Excluir'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// COMPONENTE RAIZ: O Maestro
export default function App() {
  const [activeTab, setActiveTab] = useState('cobrancas');
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchClients = useCallback(async () => {
    try {
      await Promise.resolve();
      setIsLoading(true);
      setGlobalError(null);
      const response = await fetch(`${API_BASE_URL}/Clientes`);
      if (!response.ok) throw new Error(`Erro: ${response.status}`);
      const data = await response.json();
      setClients(data);
    } catch (err) {
      console.error(err);
      setGlobalError("Não foi possível carregar os clientes. Verifique se a API está a rodar.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    fetchClients();
  }, [fetchClients, refreshTrigger]);

  const triggerUpdate = () => setRefreshTrigger(prev => prev + 1);

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Visão Geral';
      case 'clientes': return 'Gestão de Clientes';
      case 'cobrancas': return 'Controle de Cobranças';
      case 'configuracoes': return 'Configurações do Sistema';
      default: return '';
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans relative">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-2xl font-semibold text-white">{getHeaderTitle()}</h1>
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm font-medium">AL</div>
          </div>
        </header>

        {globalError && (
          <div className="m-8 mb-0 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3"><AlertTriangle size={20} /><p>{globalError}</p></div>
          </div>
        )}

        {/* Sistema de Roteamento */}
        {activeTab === 'dashboard' && <DashboardPage clients={clients} />}
        {activeTab === 'cobrancas' && <CobrancasPage clients={clients} triggerUpdate={triggerUpdate} />}
        {activeTab === 'clientes' && <ClientesPage clients={clients} isLoading={isLoading} triggerUpdate={triggerUpdate} />}
        {activeTab === 'configuracoes' && <div className="p-8"><p className="text-gray-400">Página em construção...</p></div>}
      </main>
    </div>
  );
}