// Proceso de implementación de la Ley N° 21.719 basado en la
// "Guía Práctica para facilitar la implementación" de la Secretaría
// de Gobierno Digital de Chile (wikiguias.digital.gob.cl).

export interface Resource {
  type: "template" | "ia" | "link" | "tool";
  label: string;
  // Para type "link": URL externa. Para "template": ruta o descripción.
  // Para "ia": promptKey que la app usa para generar el documento.
  // Para "tool": funcionalidad interna de la app.
  value: string;
}

export interface CheckItem {
  id: string;
  text: string;
  help?: string;
  resources?: Resource[];
}

export interface Phase {
  id: string;
  number: number;
  name: string;
  shortName: string;
  description: string;
  timeline: string;
  items: CheckItem[];
}

export const phases: Phase[] = [
  {
    id: "primeros-pasos",
    number: 1,
    name: "Primeros pasos",
    shortName: "Inicio",
    description:
      "Designar responsable institucional, constituir formalmente el proyecto de implementación y comunicar internamente el inicio del proceso.",
    timeline: "Diciembre 2025 – Enero 2026",
    items: [
      {
        id: "pp-1",
        text: "Designar un/a encargado/a o responsable institucional de implementación.",
        help: "Debe contar con capacidad de gestión, articulación interna y experiencia en proyectos transversales.",
        resources: [
          { type: "ia", label: "Generar resolución de designación", value: "designacion-responsable" },
          { type: "template", label: "Formato tipo resolución", value: "Resolución exenta que designa al encargado/a de implementación de la Ley N° 21.719" },
        ],
      },
      {
        id: "pp-2",
        text: "Constituir formalmente el proyecto de implementación (acta de constitución).",
        help: "Usar herramienta de gestión de proyectos, carta Gantt o similar para monitorear el avance.",
        resources: [
          { type: "link", label: "Formato tipo acta (SGD)", value: "https://wikiguias.digital.gob.cl/formato_tipo_acta_constituci%C3%B3n_.docx" },
          { type: "ia", label: "Generar acta de constitución", value: "acta-constitucion" },
          { type: "template", label: "Carta Gantt modelo", value: "Carta Gantt con las 7 fases, hitos, responsables y plazos sugeridos" },
        ],
      },
      {
        id: "pp-3",
        text: "Realizar un primer acto de comunicación interna a toda la institución.",
        help: "Informar: inicio de implementación, proyecto constituido, levantamiento próximo, responsable designado, conformación del Comité.",
        resources: [
          { type: "ia", label: "Generar comunicado interno", value: "comunicado-inicio" },
          { type: "template", label: "Formato memo/circular", value: "Memorándum informativo dirigido a todas las áreas sobre el inicio de la implementación" },
        ],
      },
      {
        id: "pp-4",
        text: "Designar representantes de áreas/unidades como contrapartes técnicas (si aplica).",
        resources: [
          { type: "template", label: "Listado de contrapartes", value: "Planilla con: área, nombre del representante, cargo, contacto" },
        ],
      },
    ],
  },
  {
    id: "levantamiento",
    number: 2,
    name: "Levantamiento de información",
    shortName: "Levantamiento",
    description:
      "Realizar un inventario exhaustivo de todos los datos personales tratados por la organización mediante una matriz de levantamiento.",
    timeline: "Enero – Abril 2026",
    items: [
      {
        id: "lev-1",
        text: "Enviar la matriz de levantamiento a todas las áreas/unidades de la organización.",
        resources: [
          { type: "link", label: "Matriz de levantamiento (SGD)", value: "https://wikiguias.digital.gob.cl/documentos/formato_matriz_de_levantamiento_de_informaci%C3%B3n__implementaci%C3%B3n_nueva_ley_de_datos_personales.xlsx" },
          { type: "template", label: "Instrucciones de llenado", value: "Guía breve para que cada área complete la matriz correctamente" },
        ],
      },
      {
        id: "lev-2",
        text: "Identificar categorías y tipos de datos personales tratados.",
        resources: [
          { type: "tool", label: "Inventario de bases de datos", value: "inventario-bd" },
          { type: "template", label: "Clasificador de datos", value: "Tabla con categorías: identificación, contacto, financieros, salud, biométricos, sensibles, NNA" },
        ],
      },
      {
        id: "lev-3",
        text: "Determinar la finalidad y la base de legitimidad de cada tratamiento.",
        resources: [
          { type: "ia", label: "Generar análisis de bases legales", value: "bases-legitimidad" },
          { type: "template", label: "Tabla de finalidades y bases", value: "Matriz: tratamiento / finalidad / base legal (consentimiento, ley, contrato, interés legítimo)" },
        ],
      },
      {
        id: "lev-4",
        text: "Identificar fuentes, destinatarios y periodos de conservación de los datos.",
        resources: [
          { type: "template", label: "Registro de flujos de datos", value: "Diagrama: origen → tratamiento → destino, con periodo de retención" },
        ],
      },
      {
        id: "lev-5",
        text: "Registrar plataformas digitales, sistemas de información y proveedores cloud asociados.",
        resources: [
          { type: "tool", label: "Inventario de sistemas", value: "inventario-sistemas" },
          { type: "template", label: "Planilla de sistemas y proveedores", value: "Columnas: sistema, proveedor, tipo (cloud/on-premise), datos que almacena, ubicación servidores" },
        ],
      },
      {
        id: "lev-6",
        text: "Identificar transferencias internacionales de datos y decisiones automatizadas.",
        resources: [
          { type: "template", label: "Registro de transferencias internacionales", value: "País destino, entidad receptora, base legal de transferencia, garantías" },
          { type: "template", label: "Registro de decisiones automatizadas", value: "Sistema, lógica aplicada, consecuencias para el titular, supervisión humana" },
        ],
      },
      {
        id: "lev-7",
        text: "Identificar riesgos asociados al tratamiento y gestión de cada dato personal.",
        resources: [
          { type: "ia", label: "Generar matriz de riesgos", value: "matriz-riesgos" },
          { type: "template", label: "Matriz de riesgos tipo", value: "Riesgo / Probabilidad / Impacto / Nivel / Controles existentes / Acciones mitigación" },
        ],
      },
      {
        id: "lev-8",
        text: "Incluir áreas de soporte (oficina de partes, jurídica, bienestar, etc.).",
        resources: [
          { type: "template", label: "Check de áreas relevantes", value: "Lista de áreas que suelen tratar datos: RRHH, bienestar, jurídica, TI, finanzas, oficina de partes, atención ciudadana" },
        ],
      },
    ],
  },
  {
    id: "hallazgos",
    number: 3,
    name: "Informe de hallazgos",
    shortName: "Hallazgos",
    description:
      "Elaborar un informe con las conclusiones principales, riesgos más significativos y brechas de cumplimiento respecto de la nueva normativa.",
    timeline: "Abril 2026",
    items: [
      {
        id: "hal-1",
        text: "Documentar conclusiones principales sobre cómo se realizan los tratamientos de datos.",
        resources: [
          { type: "ia", label: "Generar borrador de informe de hallazgos", value: "informe-hallazgos" },
          { type: "template", label: "Estructura del informe", value: "Secciones: resumen ejecutivo, metodología, hallazgos por área, riesgos, brechas, recomendaciones" },
        ],
      },
      {
        id: "hal-2",
        text: "Identificar y priorizar los riesgos más significativos en el tratamiento actual.",
        resources: [
          { type: "template", label: "Mapa de calor de riesgos", value: "Matriz visual probabilidad vs impacto con los riesgos priorizados" },
        ],
      },
      {
        id: "hal-3",
        text: "Identificar brechas de cumplimiento respecto a las obligaciones de la nueva ley.",
        help: "Revisar el checklist del Art. 14 ter: política, individualización del responsable, canal de derechos, categorías de datos, medidas de seguridad, etc.",
        resources: [
          { type: "ia", label: "Generar análisis de brechas (Art. 14 ter)", value: "analisis-brechas" },
          { type: "template", label: "Checklist Art. 14 ter", value: "Los 12 requisitos del Art. 14 ter con estado actual (cumple/no cumple/parcial)" },
        ],
      },
      {
        id: "hal-4",
        text: "Presentar el informe al Comité Ejecutivo para validación y priorización.",
        resources: [
          { type: "template", label: "Formato de presentación al Comité", value: "PPT/documento resumen ejecutivo para la sesión del Comité" },
        ],
      },
    ],
  },
  {
    id: "comite",
    number: 4,
    name: "Constitución del Comité Ejecutivo",
    shortName: "Comité",
    description:
      "Formar un Comité Ejecutivo que determine y priorice acciones, responsables y plazos, y revise los instrumentos que deben formalizarse.",
    timeline: "Abril 2026",
    items: [
      {
        id: "com-1",
        text: "Definir la composición del Comité (jefatura, encargado, legal, TI, control de gestión, áreas críticas).",
        resources: [
          { type: "template", label: "Propuesta de composición", value: "Tabla: rol / nombre / cargo / área / responsabilidad en el Comité" },
        ],
      },
      {
        id: "com-2",
        text: "Formalizar la constitución del Comité mediante acto administrativo.",
        resources: [
          { type: "ia", label: "Generar resolución de constitución del Comité", value: "resolucion-comite" },
          { type: "template", label: "Formato tipo resolución", value: "Resolución que constituye el Comité Ejecutivo de Protección de Datos" },
        ],
      },
      {
        id: "com-3",
        text: "Establecer periodicidad de sesiones (se recomiendan 2 veces al mes).",
        resources: [
          { type: "template", label: "Calendario de sesiones", value: "Planilla con fechas propuestas, temas tentativo por sesión y responsable de actas" },
        ],
      },
      {
        id: "com-4",
        text: "Definir la función de secretaría técnica y registrar acciones, hitos y plazos.",
        resources: [
          { type: "template", label: "Formato de acta de sesión", value: "Acta tipo: fecha, asistentes, temas tratados, acuerdos, responsables, plazos" },
        ],
      },
    ],
  },
  {
    id: "catalogo",
    number: 5,
    name: "Catálogo de datos personales",
    shortName: "Catálogo",
    description:
      "Elaborar y publicar el catálogo de datos personales tratados por la organización (Instrumento N°1 según Art. 14 ter).",
    timeline: "Mayo – Junio 2026",
    items: [
      {
        id: "cat-1",
        text: "Elaborar el catálogo a partir de la matriz de levantamiento y directrices del Comité.",
        resources: [
          { type: "link", label: "Formato catálogo (SGD)", value: "https://wikiguias.digital.gob.cl/documentos/formato_cat%C3%A1logo_implementaci%C3%B3n_nueva_ley_de_datos_personales.xlsx" },
          { type: "ia", label: "Generar borrador de catálogo", value: "catalogo-datos" },
        ],
      },
      {
        id: "cat-2",
        text: "Incluir: categorías de datos, universo de titulares, destinatarios, finalidades, base de legitimidad.",
        resources: [
          { type: "template", label: "Estructura del catálogo", value: "Columnas requeridas por Art. 14 ter lit. d): tipo dato, titulares, destinatarios, finalidad, base legal" },
        ],
      },
      {
        id: "cat-3",
        text: "Incluir: periodo de conservación y fuente de procedencia de los datos.",
        resources: [
          { type: "template", label: "Tabla de retención", value: "Dato / Periodo de conservación / Criterio / Fuente de procedencia / Acceso público (sí/no)" },
        ],
      },
      {
        id: "cat-4",
        text: "Publicar el catálogo en el sitio web institucional o medio equivalente.",
        resources: [
          { type: "template", label: "Checklist de publicación", value: "Verificar: accesible públicamente, formato legible, fecha y versión, enlace desde la política" },
        ],
      },
    ],
  },
  {
    id: "politica",
    number: 6,
    name: "Política de tratamiento de datos",
    shortName: "Política",
    description:
      "Elaborar, aprobar y publicar la política de tratamiento de datos personales de la organización (Instrumento N°2).",
    timeline: "Julio 2026",
    items: [
      {
        id: "pol-1",
        text: "Elaborar primer borrador con el contenido mínimo (finalidades, facultades, medidas de seguridad, derechos, etc.).",
        resources: [
          { type: "link", label: "Formato tipo política (SGD)", value: "https://wikiguias.digital.gob.cl/documentos/formato_tipo_poli%CC%81tica_de_tratamiento_de_datos_personales.docx" },
          { type: "ia", label: "Generar borrador de política", value: "politica-tratamiento" },
          { type: "template", label: "Contenido mínimo requerido", value: "Fines, bases de legitimidad, catálogo, medidas de seguridad, comunicación a terceros, conservación, derechos ARCOP, canal, vigencia" },
        ],
      },
      {
        id: "pol-2",
        text: "Remitir borrador al Comité y a todas las áreas para observaciones.",
        resources: [
          { type: "template", label: "Memo de envío para revisión", value: "Comunicación interna solicitando observaciones en un plazo definido" },
        ],
      },
      {
        id: "pol-3",
        text: "Incorporar observaciones y elaborar versión final.",
        resources: [
          { type: "template", label: "Registro de observaciones", value: "Tabla: área / observación / aceptada (sí/no) / justificación / modificación realizada" },
        ],
      },
      {
        id: "pol-4",
        text: "Aprobación formal por la jefatura de servicio.",
        resources: [
          { type: "ia", label: "Generar resolución de aprobación", value: "resolucion-politica" },
        ],
      },
      {
        id: "pol-5",
        text: "Publicar la política en el sitio web institucional.",
        resources: [
          { type: "template", label: "Checklist de publicación", value: "Verificar: URL pública, versión y fecha, enlace desde home, formato accesible" },
        ],
      },
    ],
  },
  {
    id: "protocolos",
    number: 7,
    name: "Protocolos, reglas y procedimientos",
    shortName: "Protocolos",
    description:
      "Establecer protocolos técnicos y operativos priorizando los riesgos más altos identificados en el informe de hallazgos (Instrumentos N°3).",
    timeline: "Agosto – Noviembre 2026",
    items: [
      {
        id: "prot-1",
        text: "Priorizar los riesgos más altos para definir qué protocolos elaborar primero.",
        resources: [
          { type: "template", label: "Matriz de priorización", value: "Riesgo / Impacto / Protocolo necesario / Prioridad / Área responsable" },
        ],
      },
      {
        id: "prot-2",
        text: "Designar áreas responsables de la elaboración de cada protocolo.",
        resources: [
          { type: "template", label: "Asignación de responsables", value: "Tabla: protocolo / área responsable / plazo / revisor" },
        ],
      },
      {
        id: "prot-3",
        text: "Elaborar borradores de protocolos (acceso a datos, respuesta a solicitudes, uso de cloud, etc.).",
        resources: [
          { type: "ia", label: "Generar protocolo de control de acceso", value: "protocolo-acceso" },
          { type: "ia", label: "Generar protocolo de respuesta ARCOP", value: "protocolo-arcop" },
          { type: "ia", label: "Generar protocolo de uso de servicios cloud", value: "protocolo-cloud" },
          { type: "ia", label: "Generar protocolo de brechas de seguridad", value: "protocolo-brechas" },
        ],
      },
      {
        id: "prot-4",
        text: "Compartir borradores con el Comité y áreas relevantes para observaciones.",
        resources: [
          { type: "template", label: "Memo de circulación", value: "Comunicación formal para revisión de borradores con plazo de respuesta" },
        ],
      },
      {
        id: "prot-5",
        text: "Aprobar versiones finales e implementar los protocolos.",
        resources: [
          { type: "ia", label: "Generar resolución de aprobación de protocolos", value: "resolucion-protocolos" },
        ],
      },
      {
        id: "prot-6",
        text: "Incluir cláusulas de protección de datos en contratos, convenios y procesos de compras.",
        resources: [
          { type: "link", label: "Formato cláusulas compras públicas (SGD)", value: "https://wikiguias.digital.gob.cl/documentos/formato_tipo_cla%C3%BAsulas_contractuales_compras_p%C3%BAblicas.docx" },
          { type: "link", label: "Formato convenio honorarios (SGD)", value: "https://wikiguias.digital.gob.cl/documentos/formato_tipo_convenio_de_honorarios_ajustado_seg%C3%BAn_nueva_ley_de_datos_personales.docx" },
          { type: "ia", label: "Generar cláusula DPA para proveedores", value: "clausula-dpa" },
        ],
      },
      {
        id: "prot-7",
        text: "Realizar capacitaciones a equipos que gestionan datos personales.",
        resources: [
          { type: "ia", label: "Generar plan de capacitación", value: "plan-capacitacion" },
          { type: "template", label: "Programa de capacitación", value: "Módulos: conceptos clave, derechos ARCOP, protocolos internos, incidentes, evaluación" },
        ],
      },
      {
        id: "prot-8",
        text: "Difundir internamente todos los documentos elaborados (intranet, RRHH, etc.).",
        resources: [
          { type: "ia", label: "Generar comunicado de cierre y difusión", value: "comunicado-cierre" },
          { type: "template", label: "Checklist de difusión", value: "Intranet, correo masivo, carpeta compartida, acta de toma de conocimiento" },
        ],
      },
    ],
  },
];

export const totalItems = phases.reduce((acc, p) => acc + p.items.length, 0);
