import React from 'react';
import { BookOpen, CheckCircle, ShieldAlert, HeartPulse, DollarSign, RefreshCw, Scale } from 'lucide-react';
import { Modal } from '@/core/ui/Modal';
import { Button } from '@/core/ui/Button';
import { useI18nStore } from '@/core/i18n';
import styles from './TermsOfServiceModal.module.css';

export interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, language } = useI18nStore();

  const isSpanish = language === 'es';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('legal.termsTitle')}
    >
      <div className={styles.container}>
        <div className={styles.badge}>
          <BookOpen size={14} />
          <span>{isSpanish ? 'Condiciones de Uso y Exención de Responsabilidad' : 'Terms of Use & Liability Disclaimer'}</span>
        </div>

        <span className={styles.lastUpdated}>{t('legal.lastUpdated')}</span>

        {isSpanish ? (
          <>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <CheckCircle size={16} />
                <span>1. Aceptación de los Términos</span>
              </h3>
              <p>
                Al acceder, instalar, registrarte o utilizar <strong>Trackr</strong>, aceptas quedar vinculado por estos Términos y Condiciones de Uso. Si no estás de acuerdo con la totalidad de estas condiciones, debes abstenerte de utilizar la aplicación.
              </p>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <HeartPulse size={16} />
                <span>2. Exención de Responsabilidad en Salud, Deporte y Bienestar</span>
              </h3>
              <p>
                <strong>Trackr es exclusivamente una herramienta informática de seguimiento y organización personal.</strong>
              </p>
              <ul className={styles.list}>
                <li>
                  <strong>No es asesoramiento médico ni profesional:</strong> La aplicación no proporciona diagnósticos, tratamientos médicos, asesoramiento nutricional ni pautas de entrenamiento físico profesional.
                </li>
                <li>
                  <strong>Responsabilidad exclusiva del usuario:</strong> Cualquier hábito, ejercicio, rutina física, cambio en la dieta o conducta registrada o realizada por el usuario se efectúa bajo su propia cuenta, riesgo y exclusivo juicio personal. Trackr y sus creadores no serán responsables de lesiones físicas, problemas de salud o cualquier consecuencia derivada de las actividades que decidas emprender.
                </li>
              </ul>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <ShieldAlert size={16} />
                <span>3. Exclusión Total de Garantías ("Tal Cual" / "AS IS")</span>
              </h3>
              <p>
                Trackr se proporciona "tal cual" y "según disponibilidad", sin garantías de ningún tipo, expresas o implícitas. No garantizamos que el funcionamiento sea ininterrumpido, libre de errores, o que los datos estén exentos de pérdidas involuntarias por fallos de red o de terceros. Es responsabilidad del usuario realizar copias de seguridad de sus datos mediante la función de exportación JSON.
              </p>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <DollarSign size={16} />
                <span>4. Limitación Total de Responsabilidad y Exclusión de Indemnizaciones</span>
              </h3>
              <p>
                <strong>En la máxima medida permitida por la legislación aplicable:</strong>
              </p>
              <ul className={styles.list}>
                <li>
                  <strong>Exclusión de daños:</strong> Trackr, sus desarrolladores, propietarios y colaboradores no responderán bajo ningún concepto ni teoría jurídica (contractual, extracontractual o negligencia) por daños directos, indirectos, incidentales, punitivos, especiales o consecuentes, ni por lucro cesante, pérdida de información, daños morales o reclamaciones de cualquier naturaleza que surjan del uso o imposibilidad de uso de la app.
                </li>
                <li>
                  <strong>Límite cuantitativo monetario ($0 USD):</strong> En el supuesto en que cualquier tribunal o autoridad judicial competente determine la existencia de alguna responsabilidad imputable a Trackr o a sus creadores, la responsabilidad económica total y acumulada quedará expresamente limitada a la suma que el usuario haya efectivamente pagado por el servicio en los últimos doce meses, o a la cantidad de <strong>cero dólares estadounidenses ($0 USD)</strong> al tratarse de una aplicación de uso gratuito.
                </li>
              </ul>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <Scale size={16} />
                <span>5. Indemnidad por parte del Usuario</span>
              </h3>
              <p>
                El usuario acepta defender, mantener indemne y liberar de toda responsabilidad legal, económica y judicial a Trackr, sus desarrolladores y colaboradores frente a cualquier denuncia, reclamo, demanda, multa, gasto o costo legal (incluyendo honorarios de abogados) que surja como consecuencia de su uso de la aplicación, incumplimiento de estos términos o vulneración de derechos de terceros.
              </p>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <RefreshCw size={16} />
                <span>6. Modificaciones del Servicio</span>
              </h3>
              <p>
                Nos reservamos el derecho de modificar, actualizar o interrumpir temporal o definitivamente cualquier aspecto de la aplicación en cualquier momento sin previo aviso.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <CheckCircle size={16} />
                <span>1. Acceptance of Terms</span>
              </h3>
              <p>
                By accessing, downloading, registering for, or using <strong>Trackr</strong>, you agree to be legally bound by these Terms of Service. If you do not agree with all of these terms, you must not use the application.
              </p>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <HeartPulse size={16} />
                <span>2. Health, Fitness, and Wellness Disclaimer</span>
              </h3>
              <p>
                <strong>Trackr is strictly a software tool for personal organization and habit tracking.</strong>
              </p>
              <ul className={styles.list}>
                <li>
                  <strong>No Medical or Professional Advice:</strong> The app does not provide medical diagnosis, treatment, nutrition plans, or professional fitness guidance.
                </li>
                <li>
                  <strong>User Assumption of Risk:</strong> Any habit, exercise routine, physical activity, or lifestyle change you perform or log is undertaken entirely at your own discretion and risk. Trackr and its creators shall have no liability for physical injury, health conditions, or any damages resulting from actions you take.
                </li>
              </ul>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <ShieldAlert size={16} />
                <span>3. Disclaimer of Warranties ("AS IS")</span>
              </h3>
              <p>
                Trackr is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied. We do not guarantee uninterrupted, bug-free service or that data loss will not occur due to network or third-party provider failures. Users are encouraged to maintain regular JSON backups from Settings.
              </p>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <DollarSign size={16} />
                <span>4. Absolute Limitation of Liability & Monetary Cap ($0 USD)</span>
              </h3>
              <p>
                <strong>To the maximum extent permitted by applicable law:</strong>
              </p>
              <ul className={styles.list}>
                <li>
                  <strong>No Liability for Damages:</strong> In no event shall Trackr, its creators, developers, or affiliates be liable under any legal theory (contract, tort, strict liability, or otherwise) for any direct, indirect, incidental, punitive, special, or consequential damages, lost profits, data loss, or claims of any kind arising from the use or inability to use the application.
                </li>
                <li>
                  <strong>Monetary Liability Cap:</strong> In the event that any competent court or authority finds any liability against Trackr or its creators, such total cumulative liability shall be strictly limited to the amount paid by the user in the preceding twelve months, or <strong>zero dollars ($0 USD)</strong> as this is a free service.
                </li>
              </ul>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <Scale size={16} />
                <span>5. User Indemnification</span>
              </h3>
              <p>
                You agree to defend, indemnify, and hold harmless Trackr, its developers, and contributors from and against any claims, demands, liabilities, damages, losses, and expenses (including reasonable legal fees) resulting from your violation of these terms or misuse of the app.
              </p>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <RefreshCw size={16} />
                <span>6. Modifications to the Service</span>
              </h3>
              <p>
                We reserve the right to modify, update, or discontinue any feature of Trackr at any time without prior notice.
              </p>
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
