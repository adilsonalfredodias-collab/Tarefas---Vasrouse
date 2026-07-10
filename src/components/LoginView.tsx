/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";

interface LoginViewProps {
  onLoginSuccess: (email: string) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Por favor, introduza o seu e-mail.");
      return;
    }
    if (!password) {
      setError("Por favor, introduza a sua palavra-passe.");
      return;
    }

    // Strict client validation for company email domains if needed, or allow standard
    if (!email.includes("@")) {
      setError("Formato de e-mail inválido.");
      return;
    }

    // Execute session initialization
    onLoginSuccess(email);
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    setRecoverySuccess(true);
    setTimeout(() => {
      setRecoverySuccess(false);
      setRecoveryMode(false);
      setRecoveryEmail("");
    }, 3000);
  };

  return (
    <div id="login-container" className="min-h-screen bg-[#0D0D11] text-[#e4e1e7] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient decorative radial glow */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#5a52a3] rounded-full filter blur-[100px] opacity-15 pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#ebc24c] rounded-full filter blur-[100px] opacity-10 pointer-events-none"></div>

      <main id="login-card" className="w-full max-w-md bg-[#16161F]/85 backdrop-blur-xl rounded-xl border border-white/10 p-8 shadow-2xl relative z-10 transition-all">
        
        {/* Vasrouse Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex items-center gap-2 mb-6">
            <svg fill="none" height="32" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg" className="transform scale-110">
              <path d="M2 2H22L12 22L2 2Z" fill="#5A52A3"></path>
              <path d="M6 6H18L12 18L6 6Z" fill="#FCD15A"></path>
            </svg>
            <span className="text-xl font-bold tracking-tight uppercase">
              Vasrouse <span className="italic text-secondary font-light">Creative</span>
            </span>
          </div>

          {!recoveryMode ? (
            <>
              <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Acesso Seguro</h1>
              <p className="text-sm text-on-surface-variant">Entre para acessar seu Workspace OS criativo.</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Recuperar Conta</h1>
              <p className="text-sm text-on-surface-variant">Introduza o seu e-mail corporativo para redefinir a palavra-passe.</p>
            </>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-container/20 border border-error/30 text-error rounded-lg text-xs">
            {error}
          </div>
        )}

        {!recoveryMode ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1 ml-1" htmlFor="email">
                E-mail corporativo
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  type="email"
                  className="w-full h-12 bg-[#0D0D11] border border-outline-variant/30 text-white text-sm rounded-lg pl-10 pr-4 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder-outline-variant/40"
                  placeholder="nome@vasrouse.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1 ml-1">
                <label className="block text-xs font-medium text-on-surface-variant" htmlFor="password">
                  Palavra-passe
                </label>
                <button
                  type="button"
                  onClick={() => setRecoveryMode(true)}
                  className="text-xs text-[#9FA2B4] hover:text-secondary transition-colors"
                >
                  Recuperar palavra-passe
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full h-12 bg-[#0D0D11] border border-outline-variant/30 text-white text-sm rounded-lg pl-10 pr-10 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder-outline-variant/40"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-outline hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              className="w-full h-12 mt-6 bg-[#FCD15A] hover:bg-[#ebc24c] text-[#0D0D11] text-sm font-semibold rounded-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Entrar no Workspace</span>
              <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRecovery} className="space-y-5">
            {recoverySuccess ? (
              <div className="p-4 bg-primary-container/20 border border-primary/30 rounded-lg flex flex-col items-center text-center gap-2">
                <CheckCircle size={32} className="text-secondary" />
                <p className="text-sm font-semibold text-white">E-mail de recuperação enviado!</p>
                <p className="text-xs text-on-surface-variant">Siga as instruções enviadas para a sua caixa de correio eletrónico.</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1 ml-1" htmlFor="recoveryEmail">
                    E-mail associado
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                      <Mail size={18} />
                    </span>
                    <input
                      id="recoveryEmail"
                      type="email"
                      className="w-full h-12 bg-[#0D0D11] border border-outline-variant/30 text-white text-sm rounded-lg pl-10 pr-4 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder-outline-variant/40"
                      placeholder="seu-email@vasrouse.com"
                      required
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRecoveryMode(false)}
                    className="flex-1 h-12 bg-transparent border border-outline-variant/50 text-white text-sm font-medium rounded-lg hover:bg-white/5 active:scale-95 transition-all"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-12 bg-[#FCD15A] text-[#0D0D11] text-sm font-semibold rounded-lg hover:bg-[#ebc24c] active:scale-95 transition-all"
                  >
                    Enviar Link
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        <div className="mt-8 text-center text-xs text-outline">
          © 2024 Vasrouse Creative. Todos os direitos reservados.
        </div>
      </main>
    </div>
  );
}
