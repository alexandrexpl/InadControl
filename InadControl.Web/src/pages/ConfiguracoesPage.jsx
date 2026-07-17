import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, AlertTriangle, Loader2, Key } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5278/api';

const ConfiguracoesPage = ({ usuarioLogado }) => {
    const [usuarios, setUsuarios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estados para os Modais
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState(null);

    // Dados dos Formulários
    const [formData, setFormData] = useState({ nome: '', email: '', senha: '', regra: 'Financeiro' });
    const [editData, setEditData] = useState({ nome: '', email: '', regra: '' });
    const [novaSenha, setNovaSenha] = useState('');

    const fetchUsuarios = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/Auth/usuarios`);
            if (response.ok) {
                setUsuarios(await response.json());
            }
        } catch (err) {
            console.error("Erro ao buscar usuários:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const carregar = async () => {
            await fetchUsuarios();
        };

        carregar();
    }, [fetchUsuarios]);

    // Ação: CRIAR
    const handleCreate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/Auth/register`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error(await response.text());
            setIsCreateModalOpen(false);
            setFormData({ nome: '', email: '', senha: '', regra: 'Financeiro' });
            fetchUsuarios();
        } catch (err) { alert(err.message); } finally { setIsSubmitting(false); }
    };

    // Ação: EDITAR
    const handleEdit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/Auth/${selectedUser.id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editData)
            });
            if (!response.ok) throw new Error(await response.text());
            setIsEditModalOpen(false);
            fetchUsuarios();
        } catch (err) { alert(err.message); } finally { setIsSubmitting(false); }
    };

    // Ação: RESETAR SENHA
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/Auth/${selectedUser.id}/reset-password`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ novaSenha })
            });
            if (!response.ok) throw new Error(await response.text());
            setIsResetModalOpen(false);
            setNovaSenha('');
            alert("Senha alterada com sucesso!");
        } catch (err) { alert(err.message); } finally { setIsSubmitting(false); }
    };

    // Ação: EXCLUIR
    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/Auth/${selectedUser.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(await response.text());
            setIsDeleteModalOpen(false);
            fetchUsuarios();
        } catch (err) { alert(err.message); } finally { setIsSubmitting(false); }
    };

    // Funções Auxiliares de Abertura de Modal
    const openEdit = (user) => { setSelectedUser(user); setEditData({ nome: user.nome, email: user.email, regra: user.regra }); setIsEditModalOpen(true); };
    const openReset = (user) => { setSelectedUser(user); setNovaSenha(''); setIsResetModalOpen(true); };
    const openDelete = (user) => { setSelectedUser(user); setIsDeleteModalOpen(true); };

    return (
        <div className="flex-1 overflow-auto p-8 relative">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-medium text-white">Gestão de Acessos</h2>
                    <p className="text-gray-400 text-sm mt-1">Gerencie os utilizadores que podem acessar ao sistema.</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-purple-600/20">
                    <Plus size={20} /> Novo Utilizador
                </button>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden shadow-sm backdrop-blur-sm min-h-[300px]">
                {isLoading ? (
                    <div className="p-12 flex justify-center"><Loader2 size={32} className="animate-spin text-purple-500" /></div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/80 border-b border-gray-700 text-sm font-medium text-gray-400">
                                <th className="py-4 px-6">Nome</th>
                                <th className="py-4 px-6">Email</th>
                                <th className="py-4 px-6">Perfil de Acesso</th>
                                <th className="py-4 px-6 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {usuarios.map(user => (
                                <tr key={user.id} className="hover:bg-gray-800/80 transition-colors group">
                                    <td className="py-4 px-6 text-white font-medium">{user.nome}</td>
                                    <td className="py-4 px-6 text-gray-400">{user.email}</td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${user.regra === 'Admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                            {user.regra}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(user)} className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors" title="Editar Utilizador">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => openReset(user)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="Resetar Senha">
                                                <Key size={16} />
                                            </button>
                                            {String(user.nome).trim().toLowerCase() === String(usuarioLogado?.nome).trim().toLowerCase() ? (
                                                <button disabled className="p-2 text-gray-600/50 cursor-not-allowed rounded-lg" title="Ação bloqueada para a conta atual">
                                                    <Trash2 size={16} />
                                                </button>
                                            ) : (
                                                <button onClick={() => openDelete(user)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Remover Acesso">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {usuarios.length === 0 && (
                                <tr><td colSpan="4" className="py-8 text-center text-gray-500">Nenhum utilizador encontrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            {/* --- MODAIS --- */}

            {/* 1. Modal: Criar */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                            <h2 className="text-xl font-semibold text-white">Adicionar Utilizador</h2>
                            <button onClick={() => !isSubmitting && setIsCreateModalOpen(false)} disabled={isSubmitting} className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div className="space-y-1.5"><label className="text-sm font-medium text-gray-300">Nome Completo</label><input required type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none" /></div>
                            <div className="space-y-1.5"><label className="text-sm font-medium text-gray-300">Email Corporativo</label><input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none" /></div>
                            <div className="space-y-1.5"><label className="text-sm font-medium text-gray-300">Senha Provisória</label><input required type="password" value={formData.senha} onChange={(e) => setFormData({ ...formData, senha: e.target.value })} className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none" /></div>
                            <div className="space-y-1.5"><label className="text-sm font-medium text-gray-300">Perfil de Acesso</label><select value={formData.regra} onChange={(e) => setFormData({ ...formData, regra: e.target.value })} className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none"><option value="Financeiro">Financeiro (Acesso Padrão)</option><option value="Admin">Administrador (Acesso Total)</option></select></div>
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-800"><button type="button" onClick={() => setIsCreateModalOpen(false)} disabled={isSubmitting} className="px-4 py-2 text-sm text-gray-300 hover:text-white">Cancelar</button><button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">{isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Criar Utilizador'}</button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. Modal: Editar */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                            <h2 className="text-xl font-semibold text-white">Editar Utilizador</h2>
                            <button onClick={() => !isSubmitting && setIsEditModalOpen(false)} disabled={isSubmitting} className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleEdit} className="p-6 space-y-4">
                            <div className="space-y-1.5"><label className="text-sm font-medium text-gray-300">Nome Completo</label><input required type="text" value={editData.nome} onChange={(e) => setEditData({ ...editData, nome: e.target.value })} className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none" /></div>
                            <div className="space-y-1.5"><label className="text-sm font-medium text-gray-300">Email Corporativo</label><input required type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none" /></div>
                            <div className="space-y-1.5"><label className="text-sm font-medium text-gray-300">Perfil de Acesso</label><select value={editData.regra} onChange={(e) => setEditData({ ...editData, regra: e.target.value })} className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none"><option value="Financeiro">Financeiro (Acesso Padrão)</option><option value="Admin">Administrador (Acesso Total)</option></select></div>
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-800"><button type="button" onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting} className="px-4 py-2 text-sm text-gray-300 hover:text-white">Cancelar</button><button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">{isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Salvar Alterações'}</button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. Modal: Resetar Senha */}
            {isResetModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
                        <div className="p-6">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-full text-blue-400"><Key size={24} /></div>
                            </div>
                            <h2 className="text-xl font-semibold text-white text-center mb-2">Redefinir Senha</h2>
                            <p className="text-gray-400 text-sm text-center mb-6">Insira a nova senha provisória para o utilizador <span className="font-semibold text-gray-200">{selectedUser?.nome}</span>.</p>
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <input required type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="Nova senha (ex: Inad123!)" className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-center" />
                                <div className="flex gap-3 mt-2">
                                    <button type="button" onClick={() => setIsResetModalOpen(false)} disabled={isSubmitting} className="flex-1 px-4 py-2 text-sm text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg">Cancelar</button>
                                    <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2">{isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Confirmar'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. Modal: Confirmar Exclusão */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
                        <div className="p-6 text-center">
                            <AlertTriangle size={48} className="text-red-500 mb-4 mx-auto" />
                            <h2 className="text-xl font-semibold text-white mb-2">Excluir Acesso?</h2>
                            <p className="text-gray-400 text-sm mb-6">Tem certeza que deseja remover o acesso de <span className="font-semibold text-gray-200">{selectedUser?.nome}</span>? Esta ação não pode ser desfeita.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setIsDeleteModalOpen(false)} disabled={isSubmitting} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">Cancelar</button>
                                <button onClick={handleDelete} disabled={isSubmitting} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">{isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Sim, Excluir'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConfiguracoesPage;