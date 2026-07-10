/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Check, CheckSquare, MessageSquare, AlertCircle, Eye, CornerUpLeft, ArrowRight, Bell } from "lucide-react";
import { Notification } from "../types";

interface NotificationsViewProps {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onNotificationAction: (taskId: string, actionType: 'view' | 'reply') => void;
}

type TabType = 'all' | 'mention' | 'task';

export default function NotificationsView({ notifications, onMarkAllRead, onNotificationAction }: NotificationsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'mention') return n.tipo === 'mention';
    if (activeTab === 'task') return n.tipo === 'task';
    return true;
  });

  return (
    <div id="notifications-container" className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Notificações</h1>
          <p className="text-sm text-on-surface-variant mt-1">Acompanhe as atualizações do seu workspace.</p>
        </div>
        
        <button
          onClick={onMarkAllRead}
          className="h-11 px-4 bg-[#16161F] hover:bg-white/5 border border-white/10 text-on-surface hover:text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
        >
          <CheckSquare size={16} className="text-secondary" />
          <span>Marcar lidas</span>
        </button>
      </section>

      {/* Filter Tabs */}
      <div className="flex gap-6 border-b border-white/5 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'all' ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-white"
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setActiveTab('mention')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'mention' ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-white"
          }`}
        >
          Menções
        </button>
        <button
          onClick={() => setActiveTab('task')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'task' ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-white"
          }`}
        >
          Tarefas
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-6">
        
        {/* Recents Section */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">Atualizações</h3>
          
          <div className="flex flex-col gap-3">
            {filteredNotifications.length === 0 ? (
              <div className="p-10 bg-[#16161F]/40 border border-white/5 rounded-xl text-center text-xs text-on-surface-variant">
                Não há notificações para exibir nesta categoria.
              </div>
            ) : (
              filteredNotifications.map(n => {
                const isUnread = !n.lida;

                return (
                  <div
                    key={n.id}
                    className={`group bg-[#16161F]/80 backdrop-blur-md rounded-xl p-5 border border-white/5 hover:border-primary-container/30 transition-all flex flex-col sm:flex-row sm:items-center gap-4 relative cursor-pointer ${
                      isUnread ? "pl-9" : ""
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {isUnread && (
                      <div className="absolute top-6 left-4 w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                    )}

                    {/* Icon matching notification type */}
                    <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#0D0D11]/60 border border-white/5">
                      {n.tipo === "task" ? (
                        <Check className="text-secondary" size={18} />
                      ) : n.tipo === "mention" ? (
                        <MessageSquare className="text-primary" size={18} />
                      ) : (
                        <Bell className="text-on-surface-variant" size={18} />
                      )}
                    </div>

                    {/* Notification content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {n.subtipo && (
                          <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary border border-primary/20 text-[9px] font-bold uppercase tracking-wider">
                            {n.subtipo}
                          </span>
                        )}
                        <span className="text-[10px] text-on-surface-variant font-medium">
                          {n.data}
                        </span>
                      </div>
                      
                      <p className="text-xs text-white leading-relaxed font-normal">
                        {n.texto}
                      </p>

                      {/* Comment excerpt/snippet if mention */}
                      {n.tipo === "mention" && n.meta?.comentario && (
                        <div className="mt-2.5 p-3 bg-[#0D0D11]/40 rounded-lg border-l-2 border-primary text-xs text-on-surface-variant italic leading-relaxed">
                          "{n.meta.comentario}"
                        </div>
                      )}
                    </div>

                    {/* Quick action trigger button on hover/card layout */}
                    <div className="flex-shrink-0 mt-3 sm:mt-0 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      {n.meta?.id_tarefa && (
                        <button
                          onClick={() => onNotificationAction(n.meta!.id_tarefa!, n.tipo === "mention" ? "reply" : "view")}
                          className="h-10 px-4 w-full sm:w-auto bg-primary-container hover:bg-inverse-primary text-white text-xs font-semibold rounded-lg shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                        >
                          {n.tipo === "mention" ? (
                            <>
                              <CornerUpLeft size={14} />
                              <span>Responder</span>
                            </>
                          ) : (
                            <>
                              <Eye size={14} />
                              <span>Ver Tarefa</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
