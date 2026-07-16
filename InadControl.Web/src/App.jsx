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
  CheckCircle,
  Clock,
  AlertCircle,
  Calculator
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';

const API_BASE_URL = 'http://localhost:5278/api';

// 🧩 COMPONENTE: Menu Lateral
const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'clientes', icon: Users, label: 'Clientes' },
    { id: 'cobrancas', icon: WalletCards, label: 'Cobranças' },
    { id: 'calculadora', icon: Calculator, label: 'Simulador' }, // <-- NOVA ABA AQUI
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
  const [faturas, setFaturas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros de tempo independentes para cada card
  const [filtroReceber, setFiltroReceber] = useState('all');
  const [filtroAtraso, setFiltroAtraso] = useState('all');
  const [filtroPago, setFiltroPago] = useState('all');

  // Buscar Faturas para a Dashboard
  useEffect(() => {
    const fetchFaturasDashboard = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/Cobrancas`);
        if (response.ok) {
          const data = await response.json();
          setFaturas(data);
        }
      } catch (err) {
        console.error("Erro ao carregar faturas na dashboard", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFaturasDashboard();
  }, []);

  // Função Auxiliar para Filtrar por Data
  const verificaPeriodo = (dataVencimento, filtro, direcao) => {
    if (filtro === 'all') return true;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(dataVencimento);
    vencimento.setHours(0, 0, 0, 0);

    const diffTime = vencimento - hoje;
    const diffDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (direcao === 'futuro') {
      return diffDias >= 0 && diffDias <= parseInt(filtro);
    } else { // passado
      return diffDias <= 0 && diffDias >= -parseInt(filtro);
    }
  };

  // Cálculos Financeiros Dinâmicos
  const totalReceber = faturas
    .filter(f => f.status === 'Pendente' && verificaPeriodo(f.dataVencimento, filtroReceber, 'futuro'))
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalAtraso = faturas
    .filter(f => f.status === 'Atrasada' && verificaPeriodo(f.dataVencimento, filtroAtraso, 'passado'))
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalRecebido = faturas
    .filter(f => f.status === 'Paga' && verificaPeriodo(f.dataVencimento, filtroPago, 'passado'))
    .reduce((acc, curr) => acc + curr.valor, 0);

  // Faturas vencidas (Atrasadas) EXATAMENTE nos últimos 7 dias
  const faturasAtrasadas7Dias = faturas.filter(f =>
    f.status === 'Atrasada' && verificaPeriodo(f.dataVencimento, '7', 'passado')
  );

  // --- Dados para os Gráficos ---
  const COLORS = { Pagas: '#10b981', Pendentes: '#f59e0b', Atrasadas: '#ef4444' };

  // Gráfico 1: Valores (Donut)
  const dadosGraficoValor = [
    { name: 'Pagas', value: faturas.filter(f => f.status === 'Paga').reduce((a, b) => a + b.valor, 0) },
    { name: 'Pendentes', value: faturas.filter(f => f.status === 'Pendente').reduce((a, b) => a + b.valor, 0) },
    { name: 'Atrasadas', value: faturas.filter(f => f.status === 'Atrasada').reduce((a, b) => a + b.valor, 0) }
  ].filter(item => item.value > 0); // Só mostra se tiver valor

  // Gráfico 2: Quantidades (Barras)
  const dadosGraficoQtd = [
    { name: 'Pagas', Quantidade: faturas.filter(f => f.status === 'Paga').length },
    { name: 'Pendentes', Quantidade: faturas.filter(f => f.status === 'Pendente').length },
    { name: 'Atrasadas', Quantidade: faturas.filter(f => f.status === 'Atrasada').length }
  ];

  if (isLoading) {
    return <div className="p-8 flex justify-center items-center h-full"><Loader2 size={40} className="animate-spin text-purple-500" /></div>;
  }

  return (
    <div className="p-8 space-y-8 overflow-auto flex-1">

      {/* 1. CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Card: A Receber */}
        <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium flex items-center gap-2">Total a Receber</h3>
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><Clock size={20} /></div>
            </div>
            <p className="text-3xl font-bold text-white mb-4">R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <select value={filtroReceber} onChange={(e) => setFiltroReceber(e.target.value)} className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500">
            <option value="all">Período Total</option>
            <option value="7">Próximos 7 dias</option>
            <option value="30">Próximos 30 dias</option>
            <option value="90">Próximos 90 dias</option>
          </select>
        </div>

        {/* Card: Em Atraso */}
        <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-bl-full pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">Total em Atraso</h3>
              <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><AlertCircle size={20} /></div>
            </div>
            <p className="text-3xl font-bold text-red-400 mb-4">R$ {totalAtraso.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <select value={filtroAtraso} onChange={(e) => setFiltroAtraso(e.target.value)} className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500">
            <option value="all">Período Total</option>
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>
        </div>

        {/* Card: Recebido */}
        <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">Total Recebido</h3>
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><CheckCircle size={20} /></div>
            </div>
            <p className="text-3xl font-bold text-emerald-400 mb-4">R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <select value={filtroPago} onChange={(e) => setFiltroPago(e.target.value)} className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500">
            <option value="all">Período Total</option>
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>
        </div>

        {/* Card: Clientes (Resumo Geral) */}
        <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">Total de Clientes</h3>
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Users size={20} /></div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{clients.length}</p>
            <p className="text-sm text-gray-400 mb-4">
              <span className="text-red-400 font-medium">{clients.filter(c => c.classificacaoRisco === 'Alto').length}</span> em Risco Alto
            </p>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1"><TrendingUp size={14} /> Atualizado agora</div>
        </div>

      </div>

      {/* 2. ÁREA DOS GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Gráfico de Donut: Distribuição Financeira */}
        <div className="bg-gray-800/30 border border-gray-700/50 p-6 rounded-xl">
          <h3 className="text-white font-medium mb-6">Distribuição Financeira (R$)</h3>
          <div className="h-64">
            {dadosGraficoValor.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosGraficoValor} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {dadosGraficoValor.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name]} stroke="transparent" />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">Sem dados financeiros registados.</div>
            )}
          </div>
        </div>

        {/* Gráfico de Barras: Volume de Faturas */}
        <div className="bg-gray-800/30 border border-gray-700/50 p-6 rounded-xl">
          <h3 className="text-white font-medium mb-6">Volume de Documentos (Qtd)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGraficoQtd} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <RechartsTooltip
                  cursor={{ fill: '#374151', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                />
                <Bar dataKey="Quantidade" radius={[4, 4, 0, 0]}>
                  {dadosGraficoQtd.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. TABELA DE FATURAS RECENTEMENTE VENCIDAS */}
      <div className="bg-gray-800/30 border border-red-500/20 rounded-xl overflow-hidden relative">
        <div className="px-6 py-5 border-b border-gray-700/50 flex items-center justify-between bg-red-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg"><AlertTriangle size={18} className="text-red-400" /></div>
            <h3 className="text-white font-medium">Vencidas nos últimos 7 dias</h3>
          </div>
          <span className="bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1 rounded-full border border-red-500/20">
            {faturasAtrasadas7Dias.length} Faturas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800/50 border-b border-gray-700/50 text-xs font-medium text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-6">Cliente</th>
                <th className="py-3 px-6">Documento</th>
                <th className="py-3 px-6">Vencimento</th>
                <th className="py-3 px-6 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/30">
              {faturasAtrasadas7Dias.length > 0 ? faturasAtrasadas7Dias.map(fatura => (
                <tr key={fatura.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-6 text-sm font-medium text-gray-200">{fatura.clienteNome}</td>
                  <td className="py-3 px-6 text-sm text-gray-400">{fatura.tipoDocumento || 'Sem doc.'} {fatura.numeroDocumento}</td>
                  <td className="py-3 px-6 text-sm text-red-400 font-medium">{new Date(fatura.dataVencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                  <td className="py-3 px-6 text-sm text-gray-200 font-medium text-right">R$ {fatura.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500 text-sm">
                    Boas notícias! Nenhuma fatura venceu (e ficou pendente) nos últimos 7 dias.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
    const matchesSearch = clienteMatches || docMatches;
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

// 🧩 COMPONENTE TELA: Simulador de Juros (Calculadora)
const CalculadoraPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [faturaEncontrada, setFaturaEncontrada] = useState(null);
  const [multa, setMulta] = useState(2);
  const [jurosMes, setJurosMes] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const buscarFatura = async () => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/Cobrancas`);
      if (!response.ok) throw new Error('Falha na API');
      const data = await response.json();

      const fatura = data.find(f => f.numeroDocumento === searchTerm && f.status === 'Atrasada');
      if (fatura) {
        setFaturaEncontrada(fatura);
      } else {
        setFaturaEncontrada(null);
        setError("Nenhuma cobrança ATRASADA encontrada com este número de documento.");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao buscar dados na API.");
    } finally {
      setIsLoading(false);
    }
  };

  let diasAtraso = 0;
  let valorMulta = 0;
  let valorJuros = 0;
  let valorTotal = 0;

  if (faturaEncontrada) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(faturaEncontrada.dataVencimento);
    vencimento.setHours(0, 0, 0, 0);

    const diffTime = hoje - vencimento;
    diasAtraso = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    valorMulta = faturaEncontrada.valor * (multa / 100);
    const jurosAoDia = (jurosMes / 100) / 30;
    valorJuros = faturaEncontrada.valor * jurosAoDia * diasAtraso;
    valorTotal = faturaEncontrada.valor + valorMulta + valorJuros;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto w-full space-y-8 flex-1 overflow-auto">

      <div className="bg-gray-800/50 border border-gray-700/50 p-8 rounded-xl space-y-6">
        <h2 className="text-xl font-medium text-white flex items-center gap-2">
          <Calculator className="text-purple-500" /> Simulador de Acordo
        </h2>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Digite o Nº do Documento da fatura atrasada..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscarFatura()}
              className="w-full bg-gray-900 border border-gray-700 text-gray-100 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={buscarFatura}
            disabled={isLoading || !searchTerm}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Buscar'}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}
      </div>

      {faturaEncontrada && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="md:col-span-1 space-y-6 bg-gray-800/30 border border-gray-700/50 p-6 rounded-xl h-fit">
            <h3 className="font-medium text-gray-300">Parâmetros de Juros</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Multa Fixa (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={multa}
                  onChange={(e) => setMulta(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Juros ao Mês (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={jurosMes}
                  onChange={(e) => setJurosMes(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-gray-900 border border-purple-500/20 rounded-xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500"></div>

            <div className="flex justify-between items-start mb-8 border-b border-gray-800 pb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Resumo Atualizado</h3>
                <p className="text-gray-400">Documento: <span className="text-purple-400 font-medium">{faturaEncontrada.numeroDocumento}</span></p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Cliente</p>
                <p className="font-medium text-gray-200">{faturaEncontrada.clienteNome}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-gray-400">
                <span>Valor Original:</span>
                <span className="text-gray-200">R$ {faturaEncontrada.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Vencimento:</span>
                <span className="text-gray-200">{new Date(faturaEncontrada.dataVencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
              </div>
              <div className="flex justify-between text-red-400">
                <span>Dias em Atraso:</span>
                <span>{diasAtraso} dias</span>
              </div>

              <div className="pt-4 border-t border-gray-800 space-y-2">
                <div className="flex justify-between text-gray-400">
                  <span>Multa ({multa}%):</span>
                  <span className="text-orange-400">+ R$ {valorMulta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Juros Pro-rata ({jurosMes}% a.m):</span>
                  <span className="text-orange-400">+ R$ {valorJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-800 flex justify-between items-center">
                <span className="text-lg font-medium text-gray-300">Total a Pagar:</span>
                <span className="text-3xl font-bold text-emerald-400">
                  R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

// 🧩 COMPONENTE RAIZ: O Maestro
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
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
      case 'dashboard': return 'Visão Geral (Dashboard)';
      case 'clientes': return 'Gestão de Clientes';
      case 'cobrancas': return 'Controle de Cobranças';
      case 'calculadora': return 'Simulador de Juros';
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
        {activeTab === 'calculadora' && <CalculadoraPage />}
        {activeTab === 'configuracoes' && <div className="p-8"><p className="text-gray-400">Página em construção...</p></div>}
      </main>
    </div>
  );
}