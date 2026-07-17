import { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    ArrowDown,
    ArrowUp,
    Plus,
    Loader2,
    AlertTriangle,
    X,
    FileText,
    CheckCircle,
    Edit2,
    Trash2
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5278/api';

const CobrancasPage = ({ clients, triggerUpdate }) => {
    const [faturas, setFaturas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [localError, setLocalError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [sortOrder, setSortOrder] = useState('Mais Recente');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // O valor agora fica armazenado como string formatada visualmente (ex: "1.250,00")
    const [formData, setFormData] = useState({
        id: null,
        clienteId: '',
        tipoDocumento: '',
        numeroDocumento: '',
        valorFormatado: '', // Novo campo para a máscara visual
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
            valorFormatado: '', // Limpa o campo formatado
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
            // Formata o número da API (ex: 1500.5) de volta para o padrão Brasil ("1.500,50") para exibir na edição
            valorFormatado: Number(fatura.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            vencimento: fatura.dataVencimento.split('T')[0],
            status: fatura.status,
            observacao: fatura.observacao || ''
        });
        setLocalError(null);
        setIsModalOpen(true);
    };

    // MÁSCARA 1: Moeda
    const handleCurrencyChange = (e) => {
        let value = e.target.value;
        // Remove tudo o que não for número (limpa a string)
        value = value.replace(/\D/g, "");

        // Se ficou vazio, devolve vazio
        if (!value) {
            setFormData(prev => ({ ...prev, valorFormatado: "" }));
            return;
        }

        // Converte os cêntimos (ex: "1234" vira 12.34)
        const options = { minimumFractionDigits: 2 };
        const result = new Intl.NumberFormat('pt-BR', options).format(parseFloat(value) / 100);

        setFormData(prev => ({ ...prev, valorFormatado: result }));
    };

    // MÁSCARA 2: Status Automático (Inteligência)
    const handleDateChange = (e) => {
        const newDate = e.target.value;

        // Descobre a data de hoje (sem horas, apenas dia, mês, ano) para comparar corretamente
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // A data inserida vem no formato YYYY-MM-DD
        // Nós forçamos o fuso horário anexando 'T00:00:00' para não dar bug dependendo de onde o usuário está no Brasil.
        const selectedDate = new Date(`${newDate}T00:00:00`);

        let newStatus = formData.status;

        // A regra inteligente atua principalmente quando estamos CRIANDO (Pendente) ou se já era Atrasada
        // Se já foi marcada como "Paga", não forçamos para "Atrasada" automaticamente
        if (formData.status !== 'Paga') {
            if (selectedDate < today) {
                newStatus = 'Atrasada';
            } else {
                newStatus = 'Pendente';
            }
        }

        setFormData(prev => ({ ...prev, vencimento: newDate, status: newStatus }));
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

        // LIMPEZA: Converte a string "1.250,50" de volta para o número puro do C# (1250.50)
        let valorPuro = 0;
        if (formData.valorFormatado) {
            // Remove os pontos (milhares) e troca a vírgula por ponto (decimal)
            valorPuro = parseFloat(formData.valorFormatado.replace(/\./g, '').replace(',', '.'));
        }

        const payload = {
            clienteId: parseInt(formData.clienteId),
            tipoDocumento: formData.tipoDocumento || null,
            numeroDocumento: formData.numeroDocumento || null,
            valor: valorPuro, // Envia o número puro
            dataVencimento: new Date(`${formData.vencimento}T00:00:00`).toISOString(), // Força o inicio do dia
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

                                    {/* NOVO INPUT COM MÁSCARA MONETÁRIA */}
                                    <div className="space-y-1.5 relative">
                                        <label className="text-sm font-medium text-gray-300">Valor (R$) <span className="text-red-400">*</span></label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-2.5 text-gray-500 font-medium">R$</span>
                                            <input
                                                type="text"
                                                required
                                                value={formData.valorFormatado}
                                                onChange={handleCurrencyChange}
                                                placeholder="0,00"
                                                className="w-full bg-gray-950 border border-gray-800 text-emerald-400 font-medium rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                    </div>

                                    {/* DATA LIGADA À INTELIGÊNCIA ARTIFICIAL (handleDateChange) */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-300">Vencimento <span className="text-red-400">*</span></label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.vencimento}
                                            onChange={handleDateChange}
                                            className="w-full bg-gray-950 border border-gray-800 text-gray-400 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 [color-scheme:dark]"
                                        />
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

export default CobrancasPage;