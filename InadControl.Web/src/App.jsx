import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, WalletCards, Calculator, Settings, LogOut, Edit2 } from 'lucide-react';

// IMPORTS DOS COMPONENTES (PÁGINAS)
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClientesPage from './pages/ClientesPage';
import CobrancasPage from './pages/CobrancasPage';
import CalculadoraPage from './pages/CalculadoraPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';

const API_BASE_URL = 'http://localhost:5278/api';

export default function App() {

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('usuario')));

  // Nome da Empresa
  const [nomeEmpresa, setNomeEmpresa] = useState(localStorage.getItem('nomeEmpresa') || 'Sua Empresa Ltda');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify({ nome: data.nome, regra: data.regra }));
    setToken(data.token);
    setUsuario({ nome: data.nome, regra: data.regra });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
    setActiveTab('dashboard');
  };

  const handleEditEmpresa = () => {
    if (usuario?.regra !== 'Admin') return; // Apenas admin pode alterar
    const novoNome = window.prompt("Digite o nome da sua empresa:", nomeEmpresa);
    if (novoNome && novoNome.trim() !== "") {
      setNomeEmpresa(novoNome.trim());
      localStorage.setItem('nomeEmpresa', novoNome.trim());
    }
  };

  const triggerUpdate = () => setRefreshTrigger(prev => prev + 1);

  // DADOS GLOBAIS (CLIENTES)
  useEffect(() => {
    if (token) {
      fetch(`${API_BASE_URL}/Clientes`)
        .then(r => r.json())
        .then(data => {
          setClients(data);
          setIsLoadingClients(false);
        })
        .catch(err => {
          console.error("Erro ao buscar clientes:", err);
          setIsLoadingClients(false);
        });
    }
  }, [token, refreshTrigger]);

  // O GUARDIÃO DA TELA
  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Visão Geral (Dashboard)';
      case 'clientes': return 'Gestão de Clientes';
      case 'cobrancas': return 'Controle de Cobranças';
      case 'calculadora': return 'Simulador Financeiro';
      case 'configuracoes': return 'Configurações do Sistema';
      default: return '';
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans relative">
      {/* MENU LATERAL */}
      <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <div className="flex items-center gap-2 text-xl font-bold text-white">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
              <span className="text-white">IC</span>
            </div>
            <span>Inad<span className="text-purple-500">Control</span></span>
          </div>
        </div>

        {/* SEÇÃO: Nome da Empresa */}
        <div className="px-6 py-4 border-b border-gray-800/60 bg-gray-900/20">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Licenciado para</p>
          <div
            onClick={handleEditEmpresa}
            className={`flex items-center justify-between group ${usuario?.regra === 'Admin' ? 'cursor-pointer' : ''}`}
            title={usuario?.regra === 'Admin' ? "Clique para alterar o nome da empresa" : nomeEmpresa}
          >
            <span className="text-sm font-medium text-gray-200 truncate pr-2">{nomeEmpresa}</span>
            {usuario?.regra === 'Admin' && (
              <Edit2 size={14} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-purple-400 shrink-0" />
            )}
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${activeTab === 'dashboard' ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20 font-medium' : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'}`}>
            <LayoutDashboard size={20} /><span>Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('clientes')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${activeTab === 'clientes' ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20 font-medium' : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'}`}>
            <Users size={20} /><span>Clientes</span>
          </button>
          <button onClick={() => setActiveTab('cobrancas')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${activeTab === 'cobrancas' ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20 font-medium' : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'}`}>
            <WalletCards size={20} /><span>Cobranças</span>
          </button>
          <button onClick={() => setActiveTab('calculadora')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${activeTab === 'calculadora' ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20 font-medium' : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'}`}>
            <Calculator size={20} /><span>Simulador</span>
          </button>

          {usuario?.regra === 'Admin' && (
            <button onClick={() => setActiveTab('configuracoes')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${activeTab === 'configuracoes' ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20 font-medium' : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'}`}>
              <Settings size={20} /><span>Configurações</span>
            </button>
          )}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* CABEÇALHO */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-2xl font-semibold text-white">{getHeaderTitle()}</h1>
          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-sm font-medium text-gray-200">{usuario?.nome}</span>
              <span className="text-xs text-purple-400 font-medium">{usuario?.regra}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-sm font-bold text-purple-400 uppercase">
              {usuario?.nome?.substring(0, 2) || 'US'}
            </div>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors ml-2" title="Sair do Sistema">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* RENDERIZAÇÃO DAS PÁGINAS SEPARADAS */}
        {activeTab === 'dashboard' && <DashboardPage clients={clients} />}
        {activeTab === 'clientes' && <ClientesPage clients={clients} isLoading={isLoadingClients} triggerUpdate={triggerUpdate} />}
        {activeTab === 'cobrancas' && <CobrancasPage clients={clients} triggerUpdate={triggerUpdate} />}
        {activeTab === 'calculadora' && <CalculadoraPage />}
        {activeTab === 'configuracoes' && usuario?.regra === 'Admin' && <ConfiguracoesPage usuarioLogado={usuario} />}

      </main>
    </div>
  );
}