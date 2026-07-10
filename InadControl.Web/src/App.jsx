import { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5278/api';

export default function App() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('Todos');
  const [sortOrder, setSortOrder] = useState('A-Z');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpfCnpj: '',
    telefone: ''
  });

  // 1. Criamos um "Gatilho" para atualizar a tabela
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 2. Colocamos a função de busca DENTRO do useEffect
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/Clientes`);

        if (!response.ok) {
          throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setClients(data);

      } catch (err) {
        console.error("Erro ao buscar clientes:", err);
        setError("Não foi possível carregar os clientes. Verifique se a API está rodando no terminal com 'dotnet run'.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [refreshTrigger]); // Toda a vez que o refreshTrigger mudar, ele busca os dados novamente!

  const processedClients = clients.filter(client => {
    const nomeMatches = client.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    const docMatches = client.documento?.includes(searchTerm) || client.cpfCnpj?.includes(searchTerm);
    const emailMatches = client.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSearch = nomeMatches || docMatches || emailMatches;
    const matchesRisk = riskFilter === 'Todos' || client.classificacaoRisco === riskFilter;

    return matchesSearch && matchesRisk;
  }).sort((a, b) => {
    const nomeA = a.nome || '';
    const nomeB = b.nome || '';
    if (sortOrder === 'A-Z') {
      return nomeA.localeCompare(nomeB);
    } else {
      return nomeB.localeCompare(nomeA);
    }
  });

  const getRiskBadgeColor = (risk) => {
    switch (risk) {
      case 'Baixo': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Médio': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Alto': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/Clientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar o cliente');
      }

      setFormData({ nome: '', email: '', cpfCnpj: '', telefone: '' });
      setIsModalOpen(false);

      // 3. Em vez de chamar a função diretamente, nós "puxamos o gatilho"
      setRefreshTrigger(prev => prev + 1);

    } catch (err) {
      console.error("Erro ao salvar cliente:", err);
      alert("Erro ao salvar o cliente. Verifique se a API está rodando.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans relative">
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
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-purple-600/10 text-purple-400 font-medium transition-colors border border-purple-500/20">
            <Users size={20} />
            <span>Clientes</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors">
            <WalletCards size={20} />
            <span>Cobranças</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors">
            <Settings size={20} />
            <span>Configurações</span>
          </a>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-2xl font-semibold text-white">Gestão de Clientes</h1>
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm font-medium">
              AL
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto flex-1">
              <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nome, documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500 transition-all"
                />
              </div>

              <div className="relative w-full sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter size={18} className="text-gray-500" />
                </div>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg pl-10 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="Todos">Todos os Riscos</option>
                  <option value="Baixo">Risco Baixo</option>
                  <option value="Médio">Risco Médio</option>
                  <option value="Alto">Risco Alto</option>
                </select>
              </div>

              <button
                onClick={() => setSortOrder(sortOrder === 'A-Z' ? 'Z-A' : 'A-Z')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-100 rounded-lg transition-colors whitespace-nowrap"
              >
                {sortOrder === 'A-Z' ? <ArrowDown size={18} /> : <ArrowUp size={18} />}
                <span className="hidden sm:inline">{sortOrder === 'A-Z' ? 'A - Z' : 'Z - A'}</span>
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors w-full xl:w-auto justify-center shadow-lg shadow-purple-600/20 shrink-0"
            >
              <Plus size={20} />
              Novo Cliente
            </button>
          </div>

          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden shadow-sm backdrop-blur-sm relative min-h-[400px]">
            {isLoading && (
              <div className="absolute inset-0 z-10 bg-gray-900/50 backdrop-blur-sm flex flex-col items-center justify-center">
                <Loader2 size={40} className="text-purple-500 animate-spin mb-4" />
                <p className="text-gray-400 font-medium">A carregar clientes da API...</p>
              </div>
            )}

            <div className="overflow-x-auto">
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
                        <td className="py-4 px-6 text-sm text-gray-500">
                          #{client.id?.toString().padStart(3, '0') || 'N/A'}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-200">{client.nome}</span>
                            <span className="text-sm text-gray-500">{client.email}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-300">
                          {client.documento || client.cpfCnpj || '-'}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-300">
                          {client.telefone || '-'}
                        </td>
                        <td className="py-4 px-6">
                          {client.classificacaoRisco ? (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getRiskBadgeColor(client.classificacaoRisco)}`}>
                              {client.classificacaoRisco}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-sm">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors" title="Editar">
                              <Edit2 size={16} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Excluir">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (!isLoading && (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-gray-500">
                        {clients.length === 0
                          ? "Nenhum cliente cadastrado ainda. Clique em 'Novo Cliente' para começar."
                          : `Nenhum cliente encontrado com os filtros atuais.`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-800/50 border-t border-gray-700/50 px-6 py-4 flex items-center justify-between text-sm text-gray-400 mt-auto">
              <span>Mostrando {processedClients.length} de {clients.length} clientes</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors disabled:opacity-50 border border-gray-700" disabled>Anterior</button>
                <button className="px-3 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors disabled:opacity-50 border border-gray-700" disabled>Próxima</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">Cadastrar Novo Cliente</h2>
              <button
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                disabled={isSubmitting}
                className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="nome" className="text-sm font-medium text-gray-300">Nome Completo <span className="text-red-400">*</span></label>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Ex: Empresa Tech Ltda"
                    className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-600 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-gray-300">Email Comercial <span className="text-red-400">*</span></label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    disabled={isSubmitting}
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contato@empresa.com"
                    className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-600 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="cpfCnpj" className="text-sm font-medium text-gray-300">CPF ou CNPJ</label>
                  <input
                    id="cpfCnpj"
                    name="cpfCnpj"
                    type="text"
                    disabled={isSubmitting}
                    value={formData.cpfCnpj}
                    onChange={handleInputChange}
                    placeholder="Apenas números"
                    className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-600 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="telefone" className="text-sm font-medium text-gray-300">Telefone</label>
                  <input
                    id="telefone"
                    name="telefone"
                    type="text"
                    disabled={isSubmitting}
                    value={formData.telefone}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-600 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-transparent hover:bg-gray-800 border border-transparent rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-lg shadow-purple-600/20 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      A Salvar...
                    </>
                  ) : (
                    'Salvar Cliente'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}