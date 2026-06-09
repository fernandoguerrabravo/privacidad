// Proceso de implementación de la Ley N° 21.719 basado en la
// "Guía Práctica para facilitar la implementación" de la Secretaría
// de Gobierno Digital de Chile (wikiguias.digital.gob.cl).
//
// Cada fase contiene hitos con checklist de acciones concretas.

export interface CheckItem {
  id: string;
  text: string;
  help?: string; // detalle extra o referencia
}

export interface Phase {
  id: string;
  number: number;
  name: string;
  shortName: string;
  description: string;
  timeline: string; // plazo sugerido según la guía
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
      },
      {
        id: "pp-2",
        text: "Constituir formalmente el proyecto de implementación (acta de constitución).",
        help: "Usar herramienta de gestión de proyectos, carta Gantt o similar para monitorear el avance.",
      },
      {
        id: "pp-3",
        text: "Realizar un primer acto de comunicación interna a toda la institución.",
        help: "Informar: inicio de implementación, proyecto constituido, levantamiento próximo, responsable designado, conformación del Comité.",
      },
      {
        id: "pp-4",
        text: "Designar representantes de áreas/unidades como contrapartes técnicas (si aplica).",
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
      },
      {
        id: "lev-2",
        text: "Identificar categorías y tipos de datos personales tratados.",
      },
      {
        id: "lev-3",
        text: "Determinar la finalidad y la base de legitimidad de cada tratamiento.",
      },
      {
        id: "lev-4",
        text: "Identificar fuentes, destinatarios y periodos de conservación de los datos.",
      },
      {
        id: "lev-5",
        text: "Registrar plataformas digitales, sistemas de información y proveedores cloud asociados.",
      },
      {
        id: "lev-6",
        text: "Identificar transferencias internacionales de datos y decisiones automatizadas.",
      },
      {
        id: "lev-7",
        text: "Identificar riesgos asociados al tratamiento y gestión de cada dato personal.",
      },
      {
        id: "lev-8",
        text: "Incluir áreas de soporte (oficina de partes, jurídica, bienestar, etc.).",
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
      },
      {
        id: "hal-2",
        text: "Identificar y priorizar los riesgos más significativos en el tratamiento actual.",
      },
      {
        id: "hal-3",
        text: "Identificar brechas de cumplimiento respecto a las obligaciones de la nueva ley.",
        help: "Revisar el checklist del Art. 14 ter: política, individualización del responsable, canal de derechos, categorías de datos, medidas de seguridad, etc.",
      },
      {
        id: "hal-4",
        text: "Presentar el informe al Comité Ejecutivo para validación y priorización.",
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
      },
      {
        id: "com-2",
        text: "Formalizar la constitución del Comité mediante acto administrativo.",
      },
      {
        id: "com-3",
        text: "Establecer periodicidad de sesiones (se recomiendan 2 veces al mes).",
      },
      {
        id: "com-4",
        text: "Definir la función de secretaría técnica y registrar acciones, hitos y plazos.",
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
      },
      {
        id: "cat-2",
        text: "Incluir: categorías de datos, universo de titulares, destinatarios, finalidades, base de legitimidad.",
      },
      {
        id: "cat-3",
        text: "Incluir: periodo de conservación y fuente de procedencia de los datos.",
      },
      {
        id: "cat-4",
        text: "Publicar el catálogo en el sitio web institucional o medio equivalente.",
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
      },
      {
        id: "pol-2",
        text: "Remitir borrador al Comité y a todas las áreas para observaciones.",
      },
      {
        id: "pol-3",
        text: "Incorporar observaciones y elaborar versión final.",
      },
      {
        id: "pol-4",
        text: "Aprobación formal por la jefatura de servicio.",
      },
      {
        id: "pol-5",
        text: "Publicar la política en el sitio web institucional.",
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
      },
      {
        id: "prot-2",
        text: "Designar áreas responsables de la elaboración de cada protocolo.",
      },
      {
        id: "prot-3",
        text: "Elaborar borradores de protocolos (acceso a datos, respuesta a solicitudes, uso de cloud, etc.).",
      },
      {
        id: "prot-4",
        text: "Compartir borradores con el Comité y áreas relevantes para observaciones.",
      },
      {
        id: "prot-5",
        text: "Aprobar versiones finales e implementar los protocolos.",
      },
      {
        id: "prot-6",
        text: "Incluir cláusulas de protección de datos en contratos, convenios y procesos de compras.",
      },
      {
        id: "prot-7",
        text: "Realizar capacitaciones a equipos que gestionan datos personales.",
      },
      {
        id: "prot-8",
        text: "Difundir internamente todos los documentos elaborados (intranet, RRHH, etc.).",
      },
    ],
  },
];

export const totalItems = phases.reduce((acc, p) => acc + p.items.length, 0);
