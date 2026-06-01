// Cuestionario de autoevaluación de cumplimiento de la
// Ley N° 21.719 de Protección de Datos Personales de Chile.
//
// Las preguntas se agrupan en dimensiones. Cada pregunta se responde
// en una escala de 1 (no cumple) a 5 (cumple completamente).

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
    id: "principios",
    name: "Principios y licitud",
    shortName: "Principios",
    description:
      "Aplicación de los principios de licitud, finalidad, proporcionalidad, calidad y transparencia en el tratamiento de datos.",
    questions: [
      {
        id: "principios-1",
        text: "Los datos personales se tratan con una finalidad específica, explícita y lícita previamente definida.",
      },
      {
        id: "principios-2",
        text: "Se recolectan únicamente los datos estrictamente necesarios para la finalidad (minimización de datos).",
      },
      {
        id: "principios-3",
        text: "Existen mecanismos para mantener los datos exactos, completos y actualizados.",
      },
      {
        id: "principios-4",
        text: "Se informa a los titulares de forma clara y transparente sobre el tratamiento de sus datos.",
      },
    ],
  },
  {
    id: "consentimiento",
    name: "Bases de licitud y consentimiento",
    shortName: "Consentimiento",
    description:
      "Existencia de una base legal válida para cada tratamiento y gestión adecuada del consentimiento.",
    questions: [
      {
        id: "consentimiento-1",
        text: "Cada tratamiento de datos cuenta con una base de licitud identificada (consentimiento, contrato, ley, etc.).",
      },
      {
        id: "consentimiento-2",
        text: "El consentimiento se obtiene de forma libre, informada, específica e inequívoca.",
      },
      {
        id: "consentimiento-3",
        text: "Los titulares pueden revocar su consentimiento de forma sencilla en cualquier momento.",
      },
      {
        id: "consentimiento-4",
        text: "Se aplica protección reforzada al tratamiento de datos sensibles y de niños, niñas y adolescentes.",
      },
    ],
  },
  {
    id: "derechos",
    name: "Derechos de los titulares",
    shortName: "Derechos",
    description:
      "Capacidad de la organización para atender los derechos de acceso, rectificación, cancelación, oposición y portabilidad.",
    questions: [
      {
        id: "derechos-1",
        text: "Existe un canal formal para que los titulares ejerzan sus derechos (ARCOP).",
      },
      {
        id: "derechos-2",
        text: "Las solicitudes de derechos se responden dentro de los plazos legales establecidos.",
      },
      {
        id: "derechos-3",
        text: "Se garantiza el derecho a la portabilidad de los datos en formato estructurado.",
      },
      {
        id: "derechos-4",
        text: "Se gestiona el derecho de oposición frente a decisiones automatizadas y elaboración de perfiles.",
      },
    ],
  },
  {
    id: "seguridad",
    name: "Seguridad e incidentes",
    shortName: "Seguridad",
    description:
      "Medidas técnicas y organizativas para proteger los datos y la gestión de violaciones de seguridad.",
    questions: [
      {
        id: "seguridad-1",
        text: "Existen medidas técnicas y organizativas apropiadas para proteger los datos personales.",
      },
      {
        id: "seguridad-2",
        text: "Se aplican controles de acceso, cifrado y registro de actividad sobre los datos.",
      },
      {
        id: "seguridad-3",
        text: "Existe un procedimiento para detectar, gestionar y documentar las brechas de seguridad.",
      },
      {
        id: "seguridad-4",
        text: "Se notifican las brechas a la Agencia de Protección de Datos y a los titulares cuando corresponde.",
      },
    ],
  },
  {
    id: "gobernanza",
    name: "Gobernanza y responsabilidad",
    shortName: "Gobernanza",
    description:
      "Responsabilidad proactiva, roles definidos y documentación que demuestra el cumplimiento.",
    questions: [
      {
        id: "gobernanza-1",
        text: "Existe un responsable o encargado de protección de datos (DPO) designado.",
      },
      {
        id: "gobernanza-2",
        text: "Se mantiene un registro de las actividades de tratamiento de datos personales.",
      },
      {
        id: "gobernanza-3",
        text: "Se realizan evaluaciones de impacto (EIPD) en tratamientos de alto riesgo.",
      },
      {
        id: "gobernanza-4",
        text: "El personal recibe capacitación periódica en protección de datos personales.",
      },
    ],
  },
  {
    id: "transferencias",
    name: "Encargados y transferencias",
    shortName: "Transferencias",
    description:
      "Gestión de proveedores que tratan datos y de las transferencias internacionales de información.",
    questions: [
      {
        id: "transferencias-1",
        text: "Existen contratos de encargo de tratamiento con todos los proveedores que acceden a datos.",
      },
      {
        id: "transferencias-2",
        text: "Se verifica que los encargados ofrezcan garantías suficientes de cumplimiento.",
      },
      {
        id: "transferencias-3",
        text: "Las transferencias internacionales cuentan con garantías adecuadas de protección.",
      },
      {
        id: "transferencias-4",
        text: "Se documentan y controlan los flujos de datos hacia terceros países u organizaciones.",
      },
    ],
  },
];

export const totalQuestions = dimensions.reduce(
  (acc, d) => acc + d.questions.length,
  0
);
