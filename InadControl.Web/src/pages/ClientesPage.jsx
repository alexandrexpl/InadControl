import { useState } from 'react';
import {
    Search,
    Filter,
    ArrowDown,
    ArrowUp,
    Plus,
    Edit2,
    Trash2,
    X,
    AlertTriangle,
    Loader2
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5278/api';

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

    // MÁSCARAS DE FORMATAÇÃO E LIMITAÇÃO DE CARACTERES
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'documento') {
            const v = value.replace(/\D/g, ''); // Remove tudo que não for número
            if (v.length <= 11) {
                // Máscara de CPF: 000.000.000-00
                formattedValue = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4').replace(/(-\d{2})\d+?$/, '$1');
            } else {
                // Máscara de CNPJ: 00.000.000/0000-00
                formattedValue = v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5').replace(/(-\d{2})\d+?$/, '$1');
            }
        }

        if (name === 'telefone') {
            const v = value.replace(/\D/g, ''); // Remove tudo que não for número
            if (v.length <= 10) {
                // Máscara de Telefone Fixo: (DD) 0000-0000
                formattedValue = v.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3').replace(/(-\d{4})\d+?$/, '$1');
            } else {
                // Máscara de Celular: (DD) 00000-0000
                formattedValue = v.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3').replace(/(-\d{4})\d+?$/, '$1');
            }
        }

        setFormData(prev => ({ ...prev, [name]: formattedValue }));
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

    // NÃO PERMITIR EXCLUIR CLIENTE COM COBRANÇAS
    const confirmDelete = async () => {
        if (!clientToDelete) return;
        setIsDeleting(true);
        setLocalError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/Clientes/${clientToDelete.id}`, { method: 'DELETE' });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage || 'Falha ao excluir o cliente');
            }

            setIsDeleteModalOpen(false);
            setClientToDelete(null);
            triggerUpdate();
        } catch (err) {
            console.error(err);
            setLocalError(err.message);
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
                                {/* 4. ESCONDIDO O ID */}
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
                                        {/* 4. ESCONDIDO O ID */}
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
                                <tr><td colSpan="5" className="py-12 text-center text-gray-500">Nenhum cliente encontrado.</td></tr>
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
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-300">Nome Completo <span className="text-red-400">*</span></label>
                                    <input type="text" required name="nome" value={formData.nome} onChange={handleInputChange} disabled={isSubmitting} className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-300">Email <span className="text-red-400">*</span></label>
                                    <input type="email" required name="email" value={formData.email} onChange={handleInputChange} disabled={isSubmitting} className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                </div>

                                {/* 3. DOCUMENTO OBRIGATÓRIO COM MÁSCARA */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-300">Documento (CPF/CNPJ) <span className="text-red-400">*</span></label>
                                    <input type="text" required maxLength={18} name="documento" placeholder="000.000.000-00 ou 00.000.000/0000-00" value={formData.documento} onChange={handleInputChange} disabled={isSubmitting} className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                </div>

                                {/* 1 e 2. TELEFONE COM MÁSCARA */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-300">Telefone (Opcional)</label>
                                    <input type="text" maxLength={15} name="telefone" placeholder="(00) 00000-0000" value={formData.telefone} onChange={handleInputChange} disabled={isSubmitting} className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                </div>
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

export default ClientesPage;