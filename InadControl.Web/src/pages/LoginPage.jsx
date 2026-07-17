import { useState } from 'react';
import { Mail, Lock, Loader2, X } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5278/api';

const LoginPage = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErro('');

        try {
            const response = await fetch(`${API_BASE_URL}/Auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            if (!response.ok) throw new Error('Email ou senha incorretos.');

            const data = await response.json();
            onLogin(data);
        } catch (err) {
            setErro(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
            <div className="flex items-center gap-3 text-3xl font-bold text-white mb-8">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
                    <span className="text-white">IC</span>
                </div>
                <span>Inad<span className="text-purple-500">Control</span></span>
            </div>

            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden relative">
                <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-blue-500"></div>

                <div className="p-8 text-center border-b border-gray-800/50">
                    <h1 className="text-2xl font-bold text-white mb-2">Área Restrita</h1>
                    <p className="text-gray-400 text-sm">Insira as suas credenciais para aceder</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {erro && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center flex items-center justify-center gap-2">
                            <X size={16} /> {erro}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-300">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail size={18} className="text-gray-500" />
                            </div>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="admin@inadcontrol.com" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-300">Senha</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-gray-500" />
                            </div>
                            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="••••••••" />
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-70">
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Entrar no Sistema'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;