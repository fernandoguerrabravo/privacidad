// Cuestionario de autoevaluación de cumplimiento de la
// Ley N° 21.719 de Protección de Datos Personales de Chile.
//
// Las dimensiones combinan los principios legales de la ley con las áreas
// operativas del "Checklist de Cumplimiento" (basado en el material de Prey
// Inc.). Cada afirmación se responde en una escala de 1 (no cumple) a
// 5 (cumple completamente).

export interface Question {
  id: string;
  text: string;
  help?: string;
}

export interface Dimension {
  id: string;
  name: string;
  shortName: string; // etiqueta compacta para el gráfico radial
  description: string;
  questions: Question[];
}

export const SCALE_LABELS: Record<number, string> = {
  1: "No cumple",
  2: "Cumplimiento inicial",
  3: "Cumplimiento parcial",
  4: "Cumplimiento avanzado",
  5: "Cumplimiento completo",
};

export const dimensions: Dimension[] = [
  {
    id: "diagnostico",
    name: "Diagnóstico inicial",
    shortName: "Diagnóstico",
    description:
      "Conocimiento de los datos personales que trata la organización y registro de las actividades de tratamiento.",
    questions: [
      {
        id: "diagnostico-1",
        text: "Identificamos qué datos personales recopilamos, dónde y cómo los almacenamos.",
      },
      {
        id: "diagnostico-2",
        text: "Contamos con un inventario de datos personales actualizado.",
      },
      {
        id: "diagnostico-3",
        text: "Hemos realizado un análisis de brechas de cumplimiento (gap analysis).",
      },
      {
        id: "diagnostico-4",
        text: "Mantenemos un Registro de Actividades de Tratamiento (RAT).",
      },
    ],
  },
  {
    id: "principios",
    name: "Principios y licitud",
    shortName: "Principios",
    description:
      "Aplicación de los principios de licitud, finalidad, minimización, calidad y transparencia, con una base legal válida para cada tratamiento.",
    questions: [
      {
        id: "principios-1",
        text: "Los datos se tratan con una finalidad específica, explícita y lícita previamente definida.",
      },
      {
        id: "principios-2",
        text: "Recolectamos únicamente los datos estrictamente necesarios para la finalidad (minimización).",
      },
      {
        id: "principios-3",
        text: "Cada tratamiento cuenta con una base de licitud identificada (consentimiento, contrato, ley, etc.).",
      },
      {
        id: "principios-4",
        text: "El consentimiento se obtiene de forma libre, informada, específica e inequívoca, y es revocable.",
      },
      {
        id: "principios-5",
        text: "Aplicamos protección reforzada a los datos sensibles y de niños, niñas y adolescentes.",
      },
    ],
  },
  {
    id: "politicas",
    name: "Políticas y gobernanza",
    shortName: "Políticas",
    description:
      "Políticas internas, responsabilidades definidas y capacitación que sustentan el cumplimiento (responsabilidad proactiva).",
    questions: [
      {
        id: "politicas-1",
        text: "Contamos con una Política de Privacidad clara, accesible y comunicada a los titulares.",
      },
      {
        id: "politicas-2",
        text: "Hemos designado un Delegado de Protección de Datos (DPO) o responsable interno.",
      },
      {
        id: "politicas-3",
        text: "El personal recibe capacitación periódica sobre protección de datos personales.",
      },
      {
        id: "politicas-4",
        text: "Existen políticas y procedimientos internos documentados para el tratamiento de datos.",
      },
    ],
  },
  {
    id: "derechos",
    name: "Derechos de los titulares",
    shortName: "Derechos",
    description:
      "Capacidad de atender los derechos de acceso, rectificación, cancelación, oposición y portabilidad (ARCOP).",
    questions: [
      {
        id: "derechos-1",
        text: "Tenemos protocolos definidos para gestionar los derechos ARCO (acceso, rectificación, cancelación y oposición).",
      },
      {
        id: "derechos-2",
        text: "Existe un canal formal para que los titulares ejerzan sus derechos.",
      },
      {
        id: "derechos-3",
        text: "Respondemos las solicitudes de derechos dentro de los plazos legales establecidos.",
      },
      {
        id: "derechos-4",
        text: "Garantizamos la portabilidad y gestionamos la oposición a decisiones automatizadas y perfilamiento.",
      },
    ],
  },
  {
    id: "seguridad",
    name: "Medidas de seguridad",
    shortName: "Seguridad",
    description:
      "Medidas técnicas y organizativas para proteger los datos: cifrado, control de acceso, respaldo, dispositivos y ciberseguridad.",
    questions: [
      {
        id: "seguridad-1",
        text: "Implementamos cifrado y anonimización para la información sensible.",
      },
      {
        id: "seguridad-2",
        text: "Contamos con controles de acceso y permisos sobre los datos.",
      },
      {
        id: "seguridad-3",
        text: "Realizamos copias de seguridad periódicas y tenemos planes de recuperación.",
      },
      {
        id: "seguridad-4",
        text: "Monitoreamos y protegemos los dispositivos corporativos para evitar pérdida o robo de datos (incl. borrado remoto).",
      },
      {
        id: "seguridad-5",
        text: "Hemos adoptado medidas de ciberseguridad para prevenir filtraciones y ataques.",
      },
    ],
  },
  {
    id: "pia",
    name: "Evaluación de impacto (EIPD)",
    shortName: "Eval. impacto",
    description:
      "Identificación y gestión de riesgos mediante Evaluaciones de Impacto en la Protección de Datos en tratamientos de alto riesgo.",
    questions: [
      {
        id: "pia-1",
        text: "Sabemos en qué casos debemos realizar una Evaluación de Impacto en la Protección de Datos (EIPD/PIA).",
      },
      {
        id: "pia-2",
        text: "Aplicamos una metodología estructurada para evaluar los riesgos del tratamiento de datos.",
      },
      {
        id: "pia-3",
        text: "Implementamos medidas correctivas cuando detectamos riesgos en el tratamiento.",
      },
    ],
  },
  {
    id: "incidentes",
    name: "Respuesta a incidentes y brechas",
    shortName: "Incidentes",
    description:
      "Protocolos para detectar, gestionar, notificar y comunicar las violaciones de seguridad de los datos personales.",
    questions: [
      {
        id: "incidentes-1",
        text: "Contamos con un protocolo de respuesta ante incidentes de seguridad.",
      },
      {
        id: "incidentes-2",
        text: "Definimos cómo y cuándo notificar a la Agencia de Protección de Datos en caso de brecha.",
      },
      {
        id: "incidentes-3",
        text: "Tenemos un plan de comunicación para informar a los titulares afectados ante un incidente.",
      },
      {
        id: "incidentes-4",
        text: "Realizamos simulacros o pruebas de respuesta ante incidentes.",
      },
    ],
  },
  {
    id: "transferencias",
    name: "Transferencias y terceros",
    shortName: "Transferencias",
    description:
      "Gestión de proveedores que tratan datos en nuestro nombre y de las transferencias internacionales de información.",
    questions: [
      {
        id: "transferencias-1",
        text: "Hemos identificado qué proveedores manejan datos personales en nuestro nombre.",
      },
      {
        id: "transferencias-2",
        text: "Contamos con contratos de encargo de tratamiento (DPA) con nuestros proveedores.",
      },
      {
        id: "transferencias-3",
        text: "Verificamos que las transferencias internacionales de datos cumplan con la ley.",
      },
      {
        id: "transferencias-4",
        text: "Documentamos y controlamos los flujos de datos hacia terceros u otros países.",
      },
    ],
  },
];

export const totalQuestions = dimensions.reduce(
  (acc, d) => acc + d.questions.length,
  0
);
