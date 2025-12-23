import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, ShoppingBag, ShieldCheck, User } from 'lucide-react';
import { UserRole, User as UserType } from '../types';
import { auth } from '../services/api';

interface LoginFormProps {
  onLogin: (user: UserType) => void;
  onNavigate: (page: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await auth.login({ email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      onLogin(user);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || 'Error al iniciar sesión');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-indigo-600 h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Bienvenido de nuevo</h2>
          <p className="text-slate-500 mt-2">Ingresa tus credenciales para continuar</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setEmail('carlos@rentai.com');
              setPassword('123456');
            }}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 py-2 rounded-lg transition-colors border border-slate-200"
          >
            Dueño (Carlos)
          </button>
          <button
            onClick={() => {
              setEmail('ana@gmail.com');
              setPassword('123456');
            }}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 py-2 rounded-lg transition-colors border border-slate-200"
          >
            Cliente (Ana)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="usuario@ejemplo.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-indigo-700 transition-all transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                Iniciar Sesión <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          ¿No tienes una cuenta?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-indigo-600 font-bold hover:underline"
          >
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
};

interface RegisterFormProps {
  onRegister: (user: UserType) => void;
  onNavigate: (page: string) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.RENTER);

  // File states
  const [dniFront, setDniFront] = useState<File | null>(null);
  const [dniBack, setDniBack] = useState<File | null>(null);
  const [utilityBill, setUtilityBill] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!dniFront || !dniBack || !utilityBill) {
      setError("Por favor sube todos los documentos requeridos (DNI y Recibo)");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', role);

      formData.append('dniFront', dniFront);
      formData.append('dniBack', dniBack);
      formData.append('utilityBill', utilityBill);

      await auth.register(formData); // Note: auth.register needs update to accept FormData
      setSuccess(true);
    } catch (err: any) {
      console.error("Register error:", err);
      setError(err.response?.data?.message || 'Error al registrarse');
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4 animate-fade-in">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-emerald-100 w-full max-w-md text-center">
          <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="text-emerald-600 h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Registro Exitoso!</h2>
          <p className="text-slate-600 mb-6">
            Tu cuenta ha sido creada y está en proceso de validación.
            Hemos enviado los documentos a nuestros administradores.
          </p>
          <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm mb-6">
            ✉️ Revisa tu correo electrónico. Te notificaremos cuando tu cuenta sea aprobada.
          </div>
          <button
            onClick={() => onNavigate('login')}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-all"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md my-8">
        <div className="text-center mb-8">
          <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="text-indigo-600 h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Crear Cuenta</h2>
          <p className="text-slate-500 mt-2">Verificación de Identidad Requerida</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div
              onClick={() => setRole(UserRole.RENTER)}
              className={`cursor-pointer p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${role === UserRole.RENTER
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 hover:border-indigo-200 text-slate-500'
                }`}
            >
              <User size={24} />
              <span className="text-xs font-bold">Quiero Alquilar</span>
            </div>
            <div
              onClick={() => setRole(UserRole.OWNER)}
              className={`cursor-pointer p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${role === UserRole.OWNER
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 hover:border-emerald-200 text-slate-500'
                }`}
            >
              <ShieldCheck size={24} />
              <span className="text-xs font-bold">Soy Dueño</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Juan Pérez"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="usuario@ejemplo.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <ShieldCheck size={16} /> Documentos de Validación
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">DNI (Frente)</label>
              <input type="file" accept="image/*,application/pdf" required
                onChange={e => setDniFront(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">DNI (Dorso)</label>
              <input type="file" accept="image/*,application/pdf" required
                onChange={e => setDniBack(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Recibo de Luz/Agua</label>
              <input type="file" accept="image/*,application/pdf" required
                onChange={e => setUtilityBill(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white py-3 rounded-lg font-bold text-lg transition-all transform active:scale-95 disabled:opacity-70 shadow-lg ${role === UserRole.OWNER
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                }`}
            >
              {isLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              ) : (
                'Enviar Solicitud'
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          ¿Ya tienes una cuenta?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-indigo-600 font-bold hover:underline"
          >
            Inicia Sesión
          </button>
        </div>
      </div>
    </div>
  );
};