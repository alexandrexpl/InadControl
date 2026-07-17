import { useState } from 'react';
import { Calculator, Search, Loader2, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5278/api';

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

export default CalculadoraPage;