import React from 'react';
import { ShieldCheck, Lock, Database, UserX, FileCheck } from 'lucide-react';
import { Modal } from '@/core/ui/Modal';
import { Button } from '@/core/ui/Button';
import { useI18nStore } from '@/core/i18n';
import styles from './PrivacyPolicyModal.module.css';

export interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, language } = useI18nStore();

  const isSpanish = language === 'es';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('legal.privacyTitle')}
      size="xl"
    >
      <div className={styles.container}>
        <div className={styles.badge}>
          <ShieldCheck size={14} />
          <span>{isSpanish ? 'Compromiso de Privacidad' : 'Privacy Commitment'}</span>
        </div>

        <span className={styles.lastUpdated}>{t('legal.lastUpdated')}</span>

        {isSpanish ? (
          <>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <Lock size={16} />
                <span>1. Información que recopilamos</span>
              </h3>
              <p>
                <strong>Trackr</strong> es una aplicación diseñada para el seguimiento personal de hábitos y actividades. Los únicos datos recopilados son:
              </p>
              <ul className={styles.list}>
                <li>
                  <strong>Información de Cuenta:</strong> Al iniciar sesión con Google o correo electrónico, recibimos tu nombre, dirección de correo y foto de perfil para autenticar tu cuenta.
                </li>
                <li>
                  <strong>Hábitos y Registros:</strong> Nombres de hábitos, categorías, metas numéricas, fechas y marcas de cumplimiento que ingreses voluntariamente en la aplicación.
                </li>
              </ul>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <Database size={16} />
                <span>2. Almacenamiento y Seguridad de los Datos</span>
              </h3>
              <p>
                Tus datos se almacenan en infraestructura segura de <strong>Supabase</strong> con cifrado en tránsito (HTTPS/TLS) y en reposo.
              </p>
              <p>
                Implementamos <strong>Row Level Security (RLS)</strong> a nivel de base de datos: cada registro está estrictamente vinculado a tu identificador único de usuario. Ningún otro usuario de la plataforma puede acceder, visualizar ni modificar tu información.
              </p>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <UserX size={16} />
                <span>3. No venta ni cesión a terceros</span>
              </h3>
              <p>
                <strong>Trackr no vende, no alquila y no comparte tu información personal con empresas de publicidad ni terceros bajo ninguna circunstancia.</strong> Tus datos se utilizan única y exclusivamente para brindarte el servicio de seguimiento de hábitos.
              </p>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <FileCheck size={16} />
                <span>4. Control y eliminación de tus datos</span>
              </h3>
              <p>
                Eres el dueño absoluto de tu información:
              </p>
              <ul className={styles.list}>
                <li>Puedes exportar una copia completa de seguridad en formato JSON en cualquier momento desde la sección de Ajustes.</li>
                <li>Puedes solicitar o eliminar tus hábitos y registros cuando lo desees de forma inmediata.</li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <Lock size={16} />
                <span>1. Information We Collect</span>
              </h3>
              <p>
                <strong>Trackr</strong> is an application built for personal habit tracking and productivity. The only data collected includes:
              </p>
              <ul className={styles.list}>
                <li>
                  <strong>Account Details:</strong> When signing in via Google or email, we receive your name, email address, and profile photo for authentication purposes.
                </li>
                <li>
                  <strong>Habits and Logs:</strong> Habit names, categories, goals, dates, and completion logs you enter into the application.
                </li>
              </ul>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <Database size={16} />
                <span>2. Data Storage and Security</span>
              </h3>
              <p>
                Your data is stored securely in <strong>Supabase</strong> infrastructure with encryption in transit (HTTPS/TLS) and at rest.
              </p>
              <p>
                We enforce database-level <strong>Row Level Security (RLS)</strong>: each record is linked strictly to your unique user ID. No other user can access, view, or modify your information.
              </p>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <UserX size={16} />
                <span>3. No Selling of Personal Data</span>
              </h3>
              <p>
                <strong>Trackr does not sell, rent, or trade your personal data to advertisers or third parties under any circumstances.</strong> Your data is used exclusively to provide habit tracking functionality.
              </p>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <FileCheck size={16} />
                <span>4. Data Control and Portability</span>
              </h3>
              <p>
                You retain full ownership of your data:
              </p>
              <ul className={styles.list}>
                <li>You can export a full JSON backup of all your habits and logs at any time from Settings.</li>
                <li>You can modify or delete your entries directly at any moment.</li>
              </ul>
            </div>
          </>
        )}

        <div className={styles.footer}>
          <Button variant="secondary" size="md" onClick={onClose}>
            {t('legal.closeBtn')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
