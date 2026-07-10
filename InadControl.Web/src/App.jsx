import { useState, useEffect } from 'react';
import {
  Search, Plus, Users, LayoutDashboard, WalletCards, Settings,
  Edit2, Trash2, Filter, ArrowDown, ArrowUp, X, Loader2, AlertTriangle,
  BarChart3, TrendingUp, TrendingDown, DollarSign
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5278/api';


// 🧩 COMPONENTE: Menu Lateral
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


// 🧩 COMPONENTE TELA: Dashboard
const DashboardPage = ({ clients }) => {
  // Cálculos reais baseados no banco de dados
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
            <TrendingUp size={16} /> +{Math.floor(totalClientes * 0.1)} este mês
          </p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Receita Esperada</h3>
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><DollarSign size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-white">R$ 45.230</p>
          <p className="text-sm text-emerald-400 flex items-center gap-1 mt-2">
            <TrendingUp size={16} /> +12.5% em relação a ontem
          </p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Inadimplência</h3>
            <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400"><BarChart3 size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-white">12.4%</p>
          <p className="text-sm text-red-400 flex items-center gap-1 mt-2">
            <TrendingDown size={16} /> Piorou 2% este mês
          </p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Clientes em Risco Alto</h3>
            <div className="p-2 bg-red-500/20 rounded-lg text-red-400"><AlertTriangle size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-white">{clientesRiscoAlto}</p>
          <p className="text-sm text-gray-400 mt-2">Requerem atenção imediata</p>
        </div>
      </div>
    </div>
  );
};


// 🧩 COMPONENTE TELA: Cobranças (Apenas visual por enquanto)
const CobrancasPage = () => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Últimas Faturas</h2>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <Plus size={18} /> Nova Cobrança
        </button>
      </div>
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800/80 border-b border-gray-700 text-sm font-medium text-gray-400">
              <th className="py-4 px-6">ID Fatura</th>
              <th className="py-4 px-6">Cliente</th>
              <th className="py-4 px-6">Valor</th>
              <th className="py-4 px-6">Vencimento</th>
              <th className="py-4 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            <tr className="hover:bg-gray-800/80">
              <td className="py-4 px-6 text-gray-400">#FAT-001</td>
              <td className="py-4 px-6 text-gray-200">Alexandre P Lopes</td>
              <td className="py-4 px-6 text-gray-300">R$ 1.500,00</td>
              <td className="py-4 px-6 text-gray-400">10/07/2026</td>
              <td className="py-4 px-6"><span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs">Paga</span></td>
            </tr>
            <tr className="hover:bg-gray-800/80">
              <td className="py-4 px-6 text-gray-400">#FAT-002</td>
              <td className="py-4 px-6 text-gray-200">Julio Cesar Ramos</td>
              <td className="py-4 px-6 text-gray-300">R$ 450,00</td>
              <td className="py-4 px-6 text-gray-400">15/07/2026</td>
              <td className="py-4 px-6"><span className="px-2.5 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full text-xs">Pendente</span></td>
            </tr>
            <tr className="hover:bg-gray-800/80">
              <td className="py-4 px-6 text-gray-400">#FAT-003</td>
              <td className="py-4 px-6 text-gray-200">Marcos Alves Pinheiro</td>
              <td className="py-4 px-6 text-gray-300">R$ 2.800,00</td>
              <td className="py-4 px-6 text-red-400">05/07/2026</td>
              <td className="py-4 px-6"><span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs">Atrasada</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};


// 🧩 COMPONENTE TELA: Gestão de Clientes (CRUD Completo)
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

  // Filtros
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

    // Remove o ID do payload se for um novo cadastro
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
      triggerUpdate(); // Atualiza a lista global

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
      triggerUpdate(); // Atualiza a lista global

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
        <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-3"><AlertTriangle size={20} /><p>{localError}</p></div>
          <button onClick={() => setLocalError(null)} className="hover:text-red-300"><X size={18} /></button>
        </div>
      )}

      {/* Barra de Ações */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto flex-1">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500" />
            </div>
            <input type="text" placeholder="Buscar por nome, documento..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="relative w-full sm:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={18} className="text-gray-500" />
            </div>
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
        <button onClick={handleNewClient} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors w-full xl:w-auto justify-center shadow-lg shadow-purple-600/20 shrink-0">
          <Plus size={20} /> Novo Cliente
        </button>
      </div>

      {/* Tabela */}
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
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-200">{client.nome}</span>
                        <span className="text-sm text-gray-500">{client.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-300">{client.documento || '-'}</td>
                    <td className="py-4 px-6 text-sm text-gray-300">{client.telefone || '-'}</td>
                    <td className="py-4 px-6">
                      {client.classificacaoRisco ? (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getRiskBadgeColor(client.classificacaoRisco)}`}>
                          {client.classificacaoRisco}
                        </span>
                      ) : <span className="text-gray-500 text-sm">-</span>}
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

      {/* Modal de Cadastro/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">{formData.id ? 'Editar Cliente' : 'Novo Cliente'}</h2>
              <button onClick={() => !isSubmitting && setIsModalOpen(false)} disabled={isSubmitting} className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Nome Completo <span className="text-red-400">*</span></label>
                  <input type="text" required name="nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} disabled={isSubmitting} className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Email <span className="text-red-400">*</span></label>
                  <input type="email" required name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={isSubmitting} className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Documento (Opcional)</label>
                  <input type="text" name="documento" value={formData.documento} onChange={(e) => setFormData({ ...formData, documento: e.target.value })} disabled={isSubmitting} className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Telefone (Opcional)</label>
                  <input type="text" name="telefone" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} disabled={isSubmitting} className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-70">
                  {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Salvando</> : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-red-500/20 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} className="text-red-500" /></div>
            <h2 className="text-xl font-semibold text-white mb-2">Excluir Cliente?</h2>
            <p className="text-gray-400 mb-8 text-sm">Certeza que deseja excluir <span className="text-white font-medium">{clientToDelete?.nome}</span>?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg">Cancelar</button>
              <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 flex justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// 🧩 COMPONENTE RAIZ: O Maestro que controla tudo
export default function App() {
  const [activeTab, setActiveTab] = useState('clientes'); // Começa na aba de clientes

  // Estado Global dos Clientes
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        // Pausa milimétrica para evitar o aviso de "Cascading Renders" do linter do React
        await Promise.resolve();

        setIsLoading(true);
        setGlobalError(null);
        const response = await fetch(`${API_BASE_URL}/Clientes`);
        if (!response.ok) throw new Error(`Erro: ${response.status}`);
        const data = await response.json();
        setClients(data);
      } catch (err) {
        console.error(err);
        setGlobalError("Não foi possível carregar os dados. Verifique a API.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [refreshTrigger]);

  const triggerUpdate = () => setRefreshTrigger(prev => prev + 1);

  // Define o título do Header dinamicamente
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
        {/* Header Superior */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-2xl font-semibold text-white">{getHeaderTitle()}</h1>
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm font-medium">
              AL
            </div>
          </div>
        </header>

        {/* Mensagem de Erro Global de Conexão */}
        {globalError && (
          <div className="m-8 mb-0 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3"><AlertTriangle size={20} /><p>{globalError}</p></div>
          </div>
        )}

        {/* Sistema de Roteamento Simples (Switch/Case) */}
        {activeTab === 'dashboard' && <DashboardPage clients={clients} />}
        {activeTab === 'cobrancas' && <CobrancasPage />}
        {activeTab === 'clientes' && (
          <ClientesPage
            clients={clients}
            isLoading={isLoading}
            triggerUpdate={triggerUpdate}
          />
        )}
        {activeTab === 'configuracoes' && (
          <div className="p-8"><p className="text-gray-400">Página de configurações em construção...</p></div>
        )}
      </main>
    </div>
  );
}