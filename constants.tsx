
import React from 'react';
import { 
  // Tráfego e Redes Sociais
  Facebook, 
  Globe, 
  Smartphone, 
  Instagram, 
  Youtube,
  Linkedin,
  Mail, // Email Mkt

  // Páginas
  FileText, 
  Video, 
  CheckCircle, 
  Calendar, 
  MonitorPlay, // Webinar
  RefreshCw, // Replay
  Rocket, // Lançamento
  Lock, // Área de Membros
  Newspaper, // Advertorial
  CreditCard, // Checkout

  // Ações e Eventos
  LayoutTemplate, // Form
  HelpCircle, // Quiz
  MessageCircle, // WhatsApp
  Phone, // Telefone
  QrCode, // Pix
  Barcode, // Boleto
  BadgeCheck, // Compra Aprovada
  Ban, // Falha/Recusado
  ShoppingCart, // Abandono Carrinho
  ShoppingBag, // Order Bump
  MessageSquare, // SMS
  Tag, // Tagging
  Maximize, // Popup
  Clock, // Delay

  // CRM
  UserPlus, // Lead Criado
  ArrowRightCircle, // Mover Etapa
  Tags, // Tag CRM
  ClipboardList, // Tarefa CRM
  UserCheck, // Lead Qualificado

  // Decisões
  GitFork, // Split Test
  Check, // Sim
  X, // Não
  MousePointerClick,

  // Texto
  Type, // Título
  StickyNote // Nota
} from 'lucide-react';
import { SidebarItemType } from './types';

// Mapeamento de Ícones para Componentes
export const IconMap: Record<string, React.ElementType> = {
  // Tráfego
  Facebook,
  Globe, // Google Ads
  Smartphone, // TikTok
  Instagram,
  Youtube,
  Linkedin,
  Mail, // Email Mkt
  
  // Páginas
  FileText, // Squeeze/Padrão
  Video, // VSL
  CheckCircle, // Obrigado
  Calendar,
  MonitorPlay, // Webinar
  RefreshCw, // Replay
  Rocket, // Lançamento
  Lock, // Área Membros
  Newspaper, // Advertorial
  CreditCard, // Checkout

  // Ações
  LayoutTemplate, // Form
  HelpCircle, // Quiz
  MessageCircle, // WhatsApp
  Phone, // Telefone
  QrCode, // Pix
  Barcode, // Boleto
  BadgeCheck, // Compra
  Ban, // Recusado
  ShoppingCart, // Abandono
  ShoppingBag, // Order Bump
  MessageSquare, // SMS
  Tag, // Tag
  Maximize, // Popup
  Clock, // Delay

  // CRM
  UserPlus,
  ArrowRightCircle,
  Tags,
  ClipboardList,
  UserCheck,

  // Decisões
  GitFork, // Split
  Check, // Sim
  X, // Não
  MousePointerClick,

  // Texto
  Type,
  StickyNote
};

export const CATEGORY_COLORS = {
  traffic: 'border-blue-500 text-blue-600 bg-blue-50',
  page: 'border-emerald-500 text-emerald-600 bg-emerald-50',
  action: 'border-amber-500 text-amber-600 bg-amber-50',
  crm: 'border-cyan-500 text-cyan-600 bg-cyan-50',
  decision: 'border-purple-500 text-purple-600 bg-purple-50',
  text: 'border-slate-300 text-slate-600 bg-slate-50',
};

export const CATEGORY_LABELS: Record<string, string> = {
  traffic: 'Tráfego',
  page: 'Páginas',
  action: 'Ações',
  crm: 'CRM & Pipeline',
  decision: 'Lógica',
  text: 'Texto & Notas'
};

// LISTA LIMPA E ESSENCIAL
export const FUNNEL_ELEMENTS: SidebarItemType[] = [
  // --- TEXTO ---
  { type: 'text-title', label: 'Título Grande', category: 'text', iconName: 'Type' },
  { type: 'text-area', label: 'Bloco de Notas', category: 'text', iconName: 'StickyNote' },

  // --- TRÁFEGO ---
  { type: 'traffic-fb', label: 'Facebook', category: 'traffic', iconName: 'Facebook' },
  { type: 'traffic-insta', label: 'Instagram', category: 'traffic', iconName: 'Instagram' },
  { type: 'traffic-google', label: 'Google', category: 'traffic', iconName: 'Globe' },
  { type: 'traffic-youtube', label: 'YouTube', category: 'traffic', iconName: 'Youtube' },
  { type: 'traffic-tiktok', label: 'TikTok', category: 'traffic', iconName: 'Smartphone' },
  { type: 'traffic-linkedin', label: 'LinkedIn', category: 'traffic', iconName: 'Linkedin' },
  { type: 'traffic-email', label: 'Email Mkt', category: 'traffic', iconName: 'Mail' },
  
  // --- PÁGINAS ---
  { type: 'page-squeeze', label: 'Captura', category: 'page', iconName: 'FileText' },
  { type: 'page-vsl', label: 'Vendas (VSL)', category: 'page', iconName: 'Video' },
  { type: 'page-checkout', label: 'Checkout', category: 'page', iconName: 'CreditCard' },
  { type: 'page-thankyou', label: 'Obrigado', category: 'page', iconName: 'CheckCircle' },
  { type: 'page-advertorial', label: 'Advertorial', category: 'page', iconName: 'Newspaper' },
  { type: 'page-webinar', label: 'Webinar', category: 'page', iconName: 'MonitorPlay' },
  { type: 'page-replay', label: 'Replay', category: 'page', iconName: 'RefreshCw' },
  { type: 'page-launch', label: 'Lançamento', category: 'page', iconName: 'Rocket' },
  { type: 'page-members', label: 'Membros', category: 'page', iconName: 'Lock' },
  { type: 'page-calendar', label: 'Agenda', category: 'page', iconName: 'Calendar' },

  // --- AÇÕES ---
  { type: 'action-form', label: 'Formulário', category: 'action', iconName: 'LayoutTemplate' },
  { type: 'action-quiz', label: 'Quiz', category: 'action', iconName: 'HelpCircle' },
  { type: 'action-whatsapp', label: 'WhatsApp', category: 'action', iconName: 'MessageCircle' },
  { type: 'action-whatsapp-btn', label: 'Botão Whats', category: 'action', iconName: 'MousePointerClick' },
  { type: 'action-phone', label: 'Telefone', category: 'action', iconName: 'Phone' },
  { type: 'action-email-send', label: 'Email', category: 'action', iconName: 'Mail' },
  { type: 'action-sms', label: 'SMS', category: 'action', iconName: 'MessageSquare' },
  { type: 'action-popup', label: 'Popup', category: 'action', iconName: 'Maximize' },
  { type: 'action-delay', label: 'Delay', category: 'action', iconName: 'Clock' },
  
  // Financeiro
  { type: 'action-orderbump', label: 'Order Bump', category: 'action', iconName: 'ShoppingBag' },
  { type: 'action-purchase', label: 'Compra', category: 'action', iconName: 'BadgeCheck' },
  { type: 'action-pix', label: 'Pix', category: 'action', iconName: 'QrCode' },
  { type: 'action-boleto', label: 'Boleto', category: 'action', iconName: 'Barcode' },
  { type: 'action-abandon', label: 'Abandono', category: 'action', iconName: 'ShoppingCart' },
  { type: 'action-declined', label: 'Recusado', category: 'action', iconName: 'Ban' },
  
  // Gestão
  { type: 'action-tag-add', label: 'Add Tag', category: 'action', iconName: 'Tag' },
  { type: 'action-tag-remove', label: 'Remover Tag', category: 'action', iconName: 'Tag' },

  // --- CRM ---
  { type: 'crm-new-lead', label: 'Novo Lead', category: 'crm', iconName: 'UserPlus' },
  { type: 'crm-move-stage', label: 'Mover Etapa', category: 'crm', iconName: 'ArrowRightCircle' },
  { type: 'crm-tag-lead', label: 'Tag Lead', category: 'crm', iconName: 'Tags' },
  { type: 'crm-task', label: 'Criar Tarefa', category: 'crm', iconName: 'ClipboardList' },
  { type: 'crm-qualify', label: 'Qualificar', category: 'crm', iconName: 'UserCheck' },

  // --- DECISÕES ---
  { type: 'decision-yes', label: 'Sim / Ok', category: 'decision', iconName: 'Check' },
  { type: 'decision-no', label: 'Não / Ruim', category: 'decision', iconName: 'X' },
  { type: 'decision-split', label: 'Teste A/B', category: 'decision', iconName: 'GitFork' },
];
