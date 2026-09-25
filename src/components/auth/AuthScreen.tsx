import React, { useState } from 'react';
import { KeyRound, Server, ShieldCheck, Sparkles, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import { useCheckInstanceStateMutation } from '../../api/hooks';
import { useChat } from '../../context/ChatContext';
import { ThemeToggle } from '../common/ThemeToggle';

export const AuthScreen: React.FC = () => {
  const { setCredentials, showToast, createChat } = useChat();
  const checkStateMutation = useCheckInstanceStateMutation();

  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [host, setHost] = useState('https://api.green-api.com');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanId = idInstance.trim();
    const cleanToken = apiTokenInstance.trim();
    const cleanHost = host.trim() || 'https://api.green-api.com';

    if (!cleanId) {
      showToast('Укажите idInstance', 'error');
      return;
    }

    if (!cleanToken) {
      showToast('Укажите apiTokenInstance', 'error');
      return;
    }

    try {
      const state = await checkStateMutation.mutateAsync({
        idInstance: cleanId,
        apiTokenInstance: cleanToken,
        host: cleanHost,
      });

      setCredentials({
        idInstance: cleanId,
        apiTokenInstance: cleanToken,
        host: cleanHost,
      });
      showToast(`Инстанс подключен (Статус: ${state.stateInstance})`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка подключения к GREEN-API';
      showToast(msg, 'error');

      const proceedAnyway = window.confirm(
        `${msg}\n\nЖелаете войти с указанными учетными данными без предварительной проверки статуса?`
      );
      if (proceedAnyway) {
        setCredentials({
          idInstance: cleanId,
          apiTokenInstance: cleanToken,
          host: cleanHost,
        });
      }
    }
  };

  const handleDemoMode = () => {
    const demoCreds = {
      idInstance: '1101823901',
      apiTokenInstance: 'd75b3a66374942c5b3c019c698abc2067e151558acbd451234',
      host: 'https://api.green-api.com',
    };
    setCredentials(demoCreds);
    createChat('79991234567', 'Анна (HR)');
    showToast('Запущен демонстрационный режим с тестовыми данными', 'info');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-top-bar">
          <ThemeToggle />
        </div>
        <div className="auth-header">
          <div className="auth-logo-badge">
            <MessageSquare size={32} />
          </div>
          <h1 className="auth-title">MAX / WhatsApp Web</h1>
          <p className="auth-subtitle">
            Клиент для отправки и получения сообщений через GREEN-API
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="idInstance" className="form-label">
              <KeyRound size={16} />
              <span>idInstance</span>
            </label>
            <input
              id="idInstance"
              type="text"
              className="form-input"
              placeholder="Например: 1101823901"
              value={idInstance}
              onChange={(e) => setIdInstance(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="apiTokenInstance" className="form-label">
              <ShieldCheck size={16} />
              <span>apiTokenInstance</span>
            </label>
            <input
              id="apiTokenInstance"
              type="password"
              className="form-input"
              placeholder="Например: 8c9d2f...c3a4"
              value={apiTokenInstance}
              onChange={(e) => setApiTokenInstance(e.target.value)}
              required
            />
          </div>

          <div className="advanced-toggle-wrapper">
            <button
              type="button"
              className="advanced-toggle-btn"
              onClick={() => setShowAdvanced((prev) => !prev)}
            >
              <Server size={14} />
              <span>{showAdvanced ? 'Скрыть адрес сервера' : 'Настроить адрес сервера (API Host)'}</span>
            </button>
          </div>

          {showAdvanced && (
            <div className="form-group advanced-group">
              <label htmlFor="host" className="form-label">
                <span>API Host</span>
              </label>
              <input
                id="host"
                type="text"
                className="form-input"
                placeholder="https://api.green-api.com"
                value={host}
                onChange={(e) => setHost(e.target.value)}
              />
              <span className="form-hint">
                По умолчанию: https://api.green-api.com (или https://7103.api.greenapi.com для отдельных инстансов)
              </span>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={checkStateMutation.isPending}>
            {checkStateMutation.isPending ? (
              <>
                <Loader2 size={18} className="spinner-icon" />
                <span>Проверка подключения...</span>
              </>
            ) : (
              <>
                <span>Войти в мессенджер</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-divider">
          <span>или</span>
        </div>

        <button type="button" className="demo-btn" onClick={handleDemoMode}>
          <Sparkles size={16} />
          <span>Запустить в демонстрационном режиме</span>
        </button>

        <div className="auth-notice">
          Учетные данные можно получить в личном кабинете{' '}
          <a
            href="https://console.green-api.com"
            target="_blank"
            rel="noopener noreferrer"
            className="auth-link"
          >
            console.green-api.com
          </a>
        </div>
      </div>
    </div>
  );
};
