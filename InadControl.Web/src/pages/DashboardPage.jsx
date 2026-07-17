import { useState, useEffect } from 'react';
import { Loader2, Clock, AlertCircle, CheckCircle, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const API_BASE_URL = 'http://localhost:5278/api';

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
                                    <td className="py-3 px-6 text-sm text-gray-400">
                                        {/* ALTERAÇÃO AQUI: Adiciona o "nº" apenas se houver número de documento */}
                                        {fatura.tipoDocumento || 'Sem doc.'} {fatura.numeroDocumento ? `nº ${fatura.numeroDocumento}` : ''}
                                    </td>
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

export default DashboardPage;